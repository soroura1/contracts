/**
 * R4 Phase B — the outcome contracts, and the boundaries they make UNREPRESENTABLE.
 *
 * ============================================================================
 * AN ABSENCE IS ONLY A CONTROL IF SOMETHING ASSERTS IT.
 * ============================================================================
 * Boundaries 2 and 3 of the observation record are enforced by there being NO
 * review, approval, completeness, evidence, capability or recognition property,
 * plus `additionalProperties: false`. That is stronger than a rule — a rule can
 * be forgotten at the call site, and a shape with no room for the mistake
 * cannot be.
 *
 * But an absence nobody asserts is an absence somebody adds. These tests name
 * each one, so widening the schema is a failing test rather than a quiet edit.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const here = dirname(fileURLToPath(import.meta.url));
const load = (n) => JSON.parse(readFileSync(join(here, '../schemas/outcome', n), 'utf8'));

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

// ⚠️ COMPILE ONCE. ajv refuses a second compile() of the same $id, and a test
// that throws before its assertion runs reports a failure for the wrong reason
// — which is indistinguishable, in the output, from the schema being wrong.
const CACHE = new Map();
const compile = (n) => {
  if (!CACHE.has(n)) CACHE.set(n, ajv.compile(load(n)));
  return CACHE.get(n);
};

const record = () => ({
  id: 'obs-1',
  participantRef: 'person-abc',
  chapter: 'ch-01',
  visibility: 'participant-private',
  sections: {
    service: { promptKey: 'obs.service', text: 'Our emergency department at handover.' },
    undocumentedDependency: { promptKey: 'obs.dependency', text: 'One porter knows which lift reaches theatre.' },
    notSureAbout: { promptKey: 'obs.unsure', text: 'Whether the second lift is actually rated for a bed.' },
    questionToAsk: { promptKey: 'obs.question', text: 'Ask estates whether lift 2 is bed-rated.' },
  },
  exportLabel: 'unverified personal preparedness observation — not an assessment',
});

// --- B4: the observation record ---------------------------------------------

test('a complete observation record validates', () => {
  const v = compile('observation-record.schema.json');
  assert.ok(v(record()), JSON.stringify(v.errors));
});

test('★ BOUNDARY 2 — a record carrying a REVIEW STATE is UNREPRESENTABLE', () => {
  const v = compile('observation-record.schema.json');
  for (const field of ['reviewState', 'approvedBy', 'reviewedAt', 'completeness',
                       'evidenceStatus', 'capabilityCredit']) {
    assert.equal(v({ ...record(), [field]: 'anything' }), false,
      `${field} was accepted — this is the prohibited artifact with a new noun on it`);
  }
});

test('★ BOUNDARY 3 — no recognition hook and no flag can be attached', () => {
  const v = compile('observation-record.schema.json');
  for (const field of ['recognition', 'artifactCompleted', 'resolvesFlag', 'firstArtifact']) {
    assert.equal(v({ ...record(), [field]: true }), false, `${field} was accepted`);
  }
});

test('★ BOUNDARY 1 — visibility has ONE value; there is no other to set', () => {
  const v = compile('observation-record.schema.json');
  for (const bad of ['facility', 'coordinator', 'public', 'shared']) {
    assert.equal(v({ ...record(), visibility: bad }), false, `visibility "${bad}" was accepted`);
  }
  assert.ok(v(record()));
});

test('★ BOUNDARY 4 — uncertainty and a follow-up question are REQUIRED', () => {
  const v = compile('observation-record.schema.json');
  for (const section of ['notSureAbout', 'questionToAsk']) {
    const r = record(); delete r.sections[section];
    assert.equal(v(r), false,
      `without ${section} this asserts an assessed dependency — which is the artifact`);
  }
});

test('★ BOUNDARY 5 — the export label cannot be softened', () => {
  const v = compile('observation-record.schema.json');
  assert.equal(v({ ...record(), exportLabel: 'personal preparedness observation' }), false,
    'dropping "unverified" and "not an assessment" is exactly how the label stops working');
});

test('★ BOUNDARY 6 — promotion requires explicit participant confirmation', () => {
  const v = compile('observation-record.schema.json');
  assert.equal(v({ ...record(), promotion: { confirmedByParticipant: false,
    correctedAt: '2026-08-19T00:00:00Z', promotedTo: 'artifact-1' } }), false);
  assert.ok(v({ ...record(), promotion: null }), 'null is the state until Q19 closes');
});

// --- B1: the deferred consequence -------------------------------------------

const consequence = () => ({
  caused_by: ['dec-01-power-pressure.defer-escalation'],
  surfaces_at: { chapter: 'ch-02' },
  relationship: 'precursor',
  emotional: 'The Foreman does not look at you during handover.',
  operational: 'The second bay loses power with no tested fallback.',
  player_could_have_known: false,
});

test('★ B1 — an unforeshadowed "you could have known" is UNREPRESENTABLE', () => {
  const v = compile('consequence.schema.json');
  assert.equal(v({ ...consequence(), player_could_have_known: true }), false,
    'telling a professional they should have seen something never shown is a trick, not a lesson');
  assert.ok(v({ ...consequence(), player_could_have_known: true, foreshadowed_at: 'sc-01-02' }));
});

test('★ B1 — a consequence with no cause, or only one account, is refused', () => {
  const v = compile('consequence.schema.json');
  assert.equal(v({ ...consequence(), caused_by: [] }), false, 'no cause means no chain');
  assert.equal(v({ ...consequence(), emotional: '' }), false, 'operational alone is felt by nobody');
  assert.equal(v({ ...consequence(), operational: '' }), false, 'emotional alone has no cost');
  assert.ok(v(consequence()));
});

// --- B6, B7: results and flags ----------------------------------------------

test('★ B6 — the four result views are SEPARATE payloads, and none combines them', () => {
  const views = ['personal-progress', 'cohort-inquiry', 'facility-capability', 'content-governance'];
  for (const name of views) {
    const s = load(`result-${name}.schema.json`);
    assert.equal(s.additionalProperties, false, `${name} accepts extra properties`);
    const props = Object.keys(s.properties);
    // A payload naming more than one subject IS a combined view.
    const subjects = props.filter((p) => /^(participantRef|cohortRef|facilityRef)$/.test(p));
    assert.ok(subjects.length <= 1,
      `${name} names ${subjects.join(' and ')} — one payload, one subject`);
  }
});

test('★ B6 — no result view carries a sort parameter or a comparative field', () => {
  for (const name of ['personal-progress', 'cohort-inquiry', 'facility-capability', 'content-governance']) {
    const text = JSON.stringify(load(`result-${name}.schema.json`).properties);
    for (const forbidden of ['"sort"', '"orderBy"', '"rank"', '"percentile"', '"compareTo"', '"leaderboard"']) {
      assert.ok(!text.includes(forbidden),
        `${name} carries ${forbidden} — a sort parameter on a comparative field IS the league table`);
    }
  }
});

test('★ B7 — a flag against a PERSON is unrepresentable', () => {
  const v = compile('flag.schema.json');
  const flag = { id: 'f1', raisedAgainst: 'sc-01-02', kind: 'content-inaccurate',
                 reason: 'the bay count disagrees with canon', state: 'open' };
  assert.ok(v(flag));
  // Every `kind` is about the content. There is no member for a person.
  const kinds = load('flag.schema.json').properties.kind.enum;
  for (const k of kinds) assert.match(k, /^(content|binding)-/, `${k} is not about the content`);
  assert.equal(v({ ...flag, kind: 'participant-underperformed' }), false);
});

test('★ facility capability is calculated by checklist-api and nowhere else', () => {
  const s = load('result-facility-capability.schema.json');
  assert.equal(s.properties.calculatedBy.const, 'checklist-api',
    'two surfaces crediting one piece of work is the parallel-credit failure');
});
