/**
 * The editorial lifecycle — the ONE definition.
 *
 * ============================================================================
 * WHY THIS IS IN `contracts` AND THE GAME RULES ARE NOT
 * ============================================================================
 *
 * `DEC-009` says `contracts` holds wire contracts only, and `citadel`'s rules
 * stay in `citadel` — because its browser and server share a repository, so
 * publishing them buys nothing.
 *
 * These rules are different: they are genuinely shared BETWEEN SERVICES.
 * `checklist-api` enforces them; `checklist-app` and `citadel` must predict
 * them to render honestly (grey out what cannot be executed, explain what is
 * awaiting review). A rule implemented twice across a service boundary WILL
 * diverge, and both copies will look correct.
 *
 * Pure. No I/O, no clock read, no ambient randomness — anything time-dependent
 * takes the time as a parameter.
 */

/** from → the states it may legally reach. Anything absent does not exist. */
export const TRANSITIONS = Object.freeze({
  draft: ['in-review'],
  'in-review': ['approved', 'returned'],
  returned: ['in-review'],
  approved: ['deprecated'],
  deprecated: [],
});

/** Consumers read APPROVED only. */
export const CONSUMER_VISIBLE = Object.freeze(['approved']);

/** Never edited — only superseded by a new version. */
export const IMMUTABLE_STATES = Object.freeze(['approved', 'deprecated']);

export const nextStates = (from) => TRANSITIONS[from] ?? [];
export const isTerminal = (state) => nextStates(state).length === 0;
export const isImmutable = (state) => IMMUTABLE_STATES.includes(state);
export const isConsumerVisible = (state) => CONSUMER_VISIBLE.includes(state);

/**
 * The ONLY way to move state.
 *
 * @returns {{ ok: true } | { ok: false, refusal: string }}
 */
export function canTransition(from, to) {
  if (!(from in TRANSITIONS)) return { ok: false, refusal: 'unknown-lifecycle-state' };
  if (!nextStates(from).includes(to)) {
    return {
      ok: false,
      refusal: isTerminal(from) ? 'deprecated-versions-are-immutable' : 'illegal-lifecycle-transition',
    };
  }
  return { ok: true };
}

/**
 * May this version be EDITED?
 *
 * A published version is never edited. A change creates a new version and preserves the prior —
 * which is governance gate 5 made mechanical rather than left to discipline.
 */
export function canEdit(tool) {
  if (isImmutable(tool.lifecycleState)) {
    return {
      ok: false,
      refusal:
        tool.lifecycleState === 'deprecated'
          ? 'deprecated-versions-are-immutable'
          : 'published-version-is-immutable',
    };
  }
  return { ok: true };
}

/**
 * ★ May this person APPROVE this version?
 *
 * ============================================================================
 * SEPARATION COVERS ANYBODY WHO EDITED IT — NOT MERELY THE RECORDED AUTHOR.
 * ============================================================================
 *
 * The stricter reading, and the correct one. An author who hands a draft to a
 * colleague to "just fix the wording" has not created an independent reviewer,
 * and a rule that checks only the author field would happily let them approve
 * their own work.
 */
export function canApprove(tool, reviewerId) {
  const move = canTransition(tool.lifecycleState, 'approved');
  if (!move.ok) return move;

  const editors = tool.editorial?.editors ?? [];
  if (editors.includes(reviewerId)) {
    return { ok: false, refusal: 'reviewer-may-not-approve-own-version' };
  }
  if (tool.editorial?.submittedBy === reviewerId) {
    return { ok: false, refusal: 'reviewer-may-not-approve-own-version' };
  }
  return { ok: true };
}

/**
 * May this tool be EXECUTED — run as an instrument, rather than merely read?
 *
 * Three gates, each a named refusal so a surface can explain WHICH one fired.
 */
export function canExecute(tool) {
  if (!isConsumerVisible(tool.lifecycleState)) {
    return { ok: false, refusal: 'unapproved-content-may-not-earn-progress' };
  }
  if (tool.withdrawnAt) {
    return { ok: false, refusal: 'withdrawn-content-may-not-be-executed' };
  }
  if (tool.classification === 'unclassified') {
    // `unclassified` is a real member, not an absence. Defaulting it is not a fix —
    // it is a judgement about what the tool is FOR, and guessing produces a tool
    // that executes incorrectly rather than one that refuses honestly.
    return { ok: false, refusal: 'unclassified-tool-may-not-be-executed' };
  }
  if (tool.specialistReviewRequired && !tool.specialistReviewSignedBy) {
    // Readable and clearly labelled. Not executable.
    return { ok: false, refusal: 'specialist-review-required-before-execution' };
  }
  return { ok: true };
}

/** May this version be PUBLISHED? Provenance and permission are gates, not metadata. */
export function canPublish(tool) {
  const p = tool.provenance;
  const required = [
    'sourceDocument',
    'sourceLocation',
    'issuingBody',
    'publicationDate',
    'reviewStatus',
    'reproductionPermission',
  ];
  if (!p || required.some((f) => p[f] === undefined || p[f] === null || p[f] === '')) {
    return { ok: false, refusal: 'insufficient-provenance' };
  }
  // HAVING A FILE DOES NOT IMPLY PERMISSION TO PUBLISH IT.
  if (!['confirmed', 'not-required'].includes(p.reproductionPermission)) {
    return { ok: false, refusal: 'reproduction-permission-not-confirmed' };
  }
  return { ok: true };
}

/**
 * The authority class an ADAPTATION carries.
 *
 * Adapting class A guidance produces class C — derived implementation content. A facility that
 * edits official guidance and keeps the class A label has created content claiming an authority it
 * no longer has.
 */
export function adaptedAuthorityClass(parentClass) {
  return parentClass === 'A' || parentClass === 'B' ? 'C' : parentClass;
}

/**
 * The authority class a tool MAY declare, given what it was adapted from.
 *
 * ============================================================================
 * WHY THIS EXISTS — a rule that was correct and could not fire
 * ============================================================================
 * `adaptedAuthorityClass` above answers the question for a LOCAL adaptation of
 * another catalogue tool, identified by `parent` (toolId + version).
 *
 * That is not the common case. Every INGESTED batch is an adaptation of an
 * EXTERNAL SOURCE DOCUMENT, and there was no field in which to say so — so
 * `adaptation_may_not_claim_parent_authority` in the database, which reads
 * `parent_tool_id is null or ...`, exempted exactly the content it was written
 * for. Batch B1 shipped `authorityClass: A` on adaptations of material whose
 * own rights page says adaptations are "not endorsed by PAHO", and nothing in
 * the schema or the database could object.
 *
 * The constraint was not unfired. It was UNFIREABLE, because the fact it keys
 * on had nowhere to live. DEC-025.
 *
 * @param tool  a tool carrying `parent` and/or `adaptedFrom`
 * @returns {{ok: true} | {ok: false, refusal: string, requiredClass: string}}
 */
export function canClaimAuthorityClass(tool) {
  // Whichever source is declared, the STRONGER claim governs. A tool adapted
  // from class A guidance is class C even if it also derives from a class D
  // local note -- taking the weaker source would be a way to launder authority.
  const sources = [
    tool?.parent?.authorityClass,
    tool?.adaptedFrom?.sourceAuthorityClass,
  ].filter(Boolean);

  if (sources.length === 0) return { ok: true };   // not an adaptation

  const required = sources
    .map(adaptedAuthorityClass)
    .sort()[0];                                     // 'C' sorts before 'D'

  if (tool.authorityClass !== required) {
    return {
      ok: false,
      refusal: 'adaptation-may-not-claim-source-authority',
      requiredClass: required,
    };
  }
  return { ok: true };
}

/**
 * Offline expiry behaviour — enforcement mechanism E14, risk-tiered.
 *
 * @param tool           the cached tool
 * @param cachedAt       when the bundle was cached (Date)
 * @param now            injected, never read ambiently
 * @param withdrawnIds   the withdrawal list, synced on any contact
 */
export function offlineAvailability(tool, cachedAt, now, withdrawnIds = new Set()) {
  // The withdrawal list is honoured BEFORE content is served — regardless of bundle age.
  if (withdrawnIds.has(tool.id)) {
    return { available: false, reason: 'withdrawn', refusal: 'withdrawn-content-may-not-be-executed' };
  }

  const ageDays = (now - cachedAt) / 86_400_000;
  const limit = tool.riskTier === 'high' ? 7 : 90;

  if (ageDays <= limit) return { available: true, ageDays, staleness: 'within-limit' };

  // Past expiry the tiers diverge, and that divergence IS the design.
  return tool.riskTier === 'high'
    ? // The failure mode is someone following a withdrawn evacuation instruction.
      { available: false, ageDays, reason: 'expired-high-risk', refusal: 'cached-content-expired' }
    : // A stale supply checklist is still useful; blocking it strands a field user for no safety gain.
      { available: true, ageDays, staleness: 'expired-warn' };
}
