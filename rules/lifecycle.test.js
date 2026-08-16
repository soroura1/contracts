/**
 * Lifecycle rules — tested here, in `contracts`, because both sides import them.
 *
 * Every assertion checks the SPECIFIC named refusal, never merely that something was refused.
 * A test asserting "this was refused" passes even when the WRONG rule refused it — which is the
 * whole reason refusals are named values rather than booleans.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  canTransition, canEdit, canApprove, canExecute, canPublish,
  nextStates, isTerminal, adaptedAuthorityClass, canClaimAuthorityClass, offlineAvailability,
} from './lifecycle.js';

const tool = (o = {}) => ({
  id: 'HZ-HVCA-001',
  version: '1.0.0',
  lifecycleState: 'approved',
  classification: 'checklist',
  riskTier: 'general',
  specialistReviewRequired: false,
  specialistReviewSignedBy: null,
  withdrawnAt: null,
  provenance: {
    sourceDocument: 'doc', sourceLocation: 'p1', issuingBody: 'body',
    publicationDate: '2026-01-01', reviewStatus: 'expert-reviewed',
    reproductionPermission: 'confirmed',
  },
  editorial: { editors: ['alice'], submittedBy: 'alice' },
  ...o,
});

describe('transitions', () => {
  test('legal moves are permitted', () => {
    assert.equal(canTransition('draft', 'in-review').ok, true);
    assert.equal(canTransition('in-review', 'approved').ok, true);
    assert.equal(canTransition('in-review', 'returned').ok, true);
    assert.equal(canTransition('returned', 'in-review').ok, true);
    assert.equal(canTransition('approved', 'deprecated').ok, true);
  });

  test('a draft cannot skip review', () => {
    const r = canTransition('draft', 'approved');
    assert.equal(r.ok, false);
    assert.equal(r.refusal, 'illegal-lifecycle-transition');
  });

  test('deprecated is terminal — nextStates returns nothing', () => {
    assert.deepEqual(nextStates('deprecated'), []);
    assert.equal(isTerminal('deprecated'), true);
    assert.equal(canTransition('deprecated', 'approved').refusal, 'deprecated-versions-are-immutable');
  });
});

describe('immutability', () => {
  test('★ an APPROVED version cannot be edited', () => {
    const r = canEdit(tool({ lifecycleState: 'approved' }));
    assert.equal(r.ok, false);
    assert.equal(r.refusal, 'published-version-is-immutable');
  });

  test('a DEPRECATED version cannot be edited', () => {
    assert.equal(canEdit(tool({ lifecycleState: 'deprecated' })).refusal, 'deprecated-versions-are-immutable');
  });

  test('a draft CAN be edited — that is the point of a draft', () => {
    assert.equal(canEdit(tool({ lifecycleState: 'draft' })).ok, true);
  });
});

describe('★ reviewer separation', () => {
  test('an editor cannot approve their own version', () => {
    const r = canApprove(tool({ lifecycleState: 'in-review', editorial: { editors: ['alice'], submittedBy: 'bob' } }), 'alice');
    assert.equal(r.ok, false);
    assert.equal(r.refusal, 'reviewer-may-not-approve-own-version');
  });

  test('the submitter cannot approve their own version', () => {
    const r = canApprove(tool({ lifecycleState: 'in-review', editorial: { editors: [], submittedBy: 'bob' } }), 'bob');
    assert.equal(r.refusal, 'reviewer-may-not-approve-own-version');
  });

  test('SEPARATION COVERS EDITORS, NOT ONLY THE AUTHOR — the case a naive rule misses', () => {
    // bob authored and submitted; alice edited it to "just fix the wording".
    // A rule checking only the author would let alice approve. She must not.
    const t = tool({ lifecycleState: 'in-review', editorial: { editors: ['bob', 'alice'], submittedBy: 'bob' } });
    assert.equal(canApprove(t, 'alice').refusal, 'reviewer-may-not-approve-own-version');
    assert.equal(canApprove(t, 'bob').refusal, 'reviewer-may-not-approve-own-version');
    assert.equal(canApprove(t, 'carol').ok, true, 'an independent reviewer may approve');
  });
});

describe('execution gates', () => {
  test('an approved, classified, reviewed tool executes', () => {
    assert.equal(canExecute(tool()).ok, true);
  });

  test('an UNCLASSIFIED tool cannot be executed', () => {
    assert.equal(canExecute(tool({ classification: 'unclassified' })).refusal, 'unclassified-tool-may-not-be-executed');
  });

  test('specialist-review content is readable but NOT executable until signed', () => {
    const unsigned = tool({ specialistReviewRequired: true });
    assert.equal(canExecute(unsigned).refusal, 'specialist-review-required-before-execution');
    assert.equal(canExecute(tool({ specialistReviewRequired: true, specialistReviewSignedBy: 'eng-1' })).ok, true);
  });

  test('a draft cannot be executed', () => {
    assert.equal(canExecute(tool({ lifecycleState: 'draft' })).refusal, 'unapproved-content-may-not-earn-progress');
  });

  test('withdrawn content cannot be executed even while approved', () => {
    assert.equal(canExecute(tool({ withdrawnAt: '2026-08-15T00:00:00Z' })).refusal, 'withdrawn-content-may-not-be-executed');
  });
});

describe('publication gates', () => {
  test('incomplete provenance blocks publication', () => {
    const t = tool(); delete t.provenance.issuingBody;
    assert.equal(canPublish(t).refusal, 'insufficient-provenance');
  });

  test('★ HAVING A FILE DOES NOT IMPLY PERMISSION TO PUBLISH IT', () => {
    const pending = tool({ provenance: { ...tool().provenance, reproductionPermission: 'pending' } });
    assert.equal(canPublish(pending).refusal, 'reproduction-permission-not-confirmed');
    assert.equal(canPublish(tool({ provenance: { ...tool().provenance, reproductionPermission: 'not-required' } })).ok, true);
  });
});

describe('local adaptation', () => {
  test('adapting class A or B produces class C — the label cannot outrank the content', () => {
    assert.equal(adaptedAuthorityClass('A'), 'C');
    assert.equal(adaptedAuthorityClass('B'), 'C');
  });
  test('adapting derived content stays derived', () => {
    assert.equal(adaptedAuthorityClass('C'), 'C');
    assert.equal(adaptedAuthorityClass('D'), 'D');
  });
});

describe('★ offline expiry — risk-tiered (E14)', () => {
  const day = 86_400_000;
  const cached = new Date('2026-01-01T00:00:00Z');

  test('fresh content of either tier is available', () => {
    const now = new Date(cached.getTime() + 3 * day);
    assert.equal(offlineAvailability(tool(), cached, now).available, true);
    assert.equal(offlineAvailability(tool({ riskTier: 'high' }), cached, now).available, true);
  });

  test('EXPIRED GENERAL content warns and CONTINUES — a stale supply checklist is still useful', () => {
    const now = new Date(cached.getTime() + 120 * day);
    const r = offlineAvailability(tool(), cached, now);
    assert.equal(r.available, true, 'blocking it strands a field user for no safety gain');
    assert.equal(r.staleness, 'expired-warn');
  });

  test('EXPIRED HIGH-RISK content STOPS — the failure mode is a withdrawn evacuation instruction', () => {
    const now = new Date(cached.getTime() + 30 * day);
    const r = offlineAvailability(tool({ riskTier: 'high' }), cached, now);
    assert.equal(r.available, false);
    assert.equal(r.refusal, 'cached-content-expired');
  });

  test('the WITHDRAWAL LIST is honoured before content is served — regardless of age or tier', () => {
    const now = new Date(cached.getTime() + 1 * day);   // perfectly fresh
    const r = offlineAvailability(tool(), cached, now, new Set(['HZ-HVCA-001']));
    assert.equal(r.available, false);
    assert.equal(r.refusal, 'withdrawn-content-may-not-be-executed');
  });
});

// ---------------------------------------------------------------------------
// canClaimAuthorityClass — DEC-025.
//
// The first case is the one that happened: batch B1 shipped authorityClass A on
// content adapted from PAHO guidance whose own rights page says adaptations are
// "not endorsed by PAHO". Two rules existed. Neither could fire, because
// `parent` requires a toolId and there was nowhere to say "adapted from an
// external document".
// ---------------------------------------------------------------------------
test('★ content adapted from an EXTERNAL class A source may not claim class A', () => {
  const b1 = {
    authorityClass: 'A',
    parent: null,
    adaptedFrom: {
      sourceDocument: 'Resilient Hospitals',
      issuingBody: 'Pan American Health Organization',
      sourceAuthorityClass: 'A',
    },
  };
  const r = canClaimAuthorityClass(b1);
  assert.equal(r.ok, false);
  assert.equal(r.refusal, 'adaptation-may-not-claim-source-authority');
  assert.equal(r.requiredClass, 'C');

  // And the corrected form is permitted -- which is what proves the refusal above
  // is about the CLAIM and not about adaptation itself.
  assert.equal(canClaimAuthorityClass({ ...b1, authorityClass: 'C' }).ok, true);
});

test('a tool that is not an adaptation is unaffected', () => {
  assert.equal(canClaimAuthorityClass({ authorityClass: 'A' }).ok, true);
  assert.equal(canClaimAuthorityClass({ authorityClass: 'A', parent: null, adaptedFrom: null }).ok, true);
});

test('the LOCAL adaptation path still works, via parent', () => {
  const local = { authorityClass: 'A', parent: { toolId: 'X', version: '1.0.0', authorityClass: 'A' } };
  assert.equal(canClaimAuthorityClass(local).refusal, 'adaptation-may-not-claim-source-authority');
  assert.equal(canClaimAuthorityClass({ ...local, authorityClass: 'C' }).ok, true);
});

test('★ the STRONGER source governs — authority cannot be laundered through a weak one', () => {
  // Adapting class A guidance AND a class D local note is still class C. Taking
  // the weaker source would let anyone relabel official material by citing a
  // second, trivial one alongside it.
  const both = {
    authorityClass: 'D',
    parent: { toolId: 'X', version: '1.0.0', authorityClass: 'D' },
    adaptedFrom: { sourceDocument: 'S', issuingBody: 'B', sourceAuthorityClass: 'A' },
  };
  const r = canClaimAuthorityClass(both);
  assert.equal(r.ok, false);
  assert.equal(r.requiredClass, 'C');
});

test('adapting class C or D does not change the class', () => {
  for (const c of ['C', 'D']) {
    const t = { authorityClass: c, adaptedFrom: { sourceDocument: 'S', issuingBody: 'B', sourceAuthorityClass: c } };
    assert.equal(canClaimAuthorityClass(t).ok, true);
  }
});
