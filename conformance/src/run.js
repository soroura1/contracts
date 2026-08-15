#!/usr/bin/env node
/**
 * Conformance suite — runs against ANY implementation of the contract.
 *
 *   CONFORMANCE_TARGET=http://localhost:8081 node conformance/src/run.js
 *
 * It runs in TWO places, and that is the whole point:
 *
 *   in checklist-api's CI          in citadel's CI
 *   against the real service       against a contract-conformant test double
 *          │                                │
 *          └────── the same suite ──────────┘
 *
 * `citadel` can develop against a double and be confident the real service behaves the same way,
 * because both are tested against one suite. The contract is the shared truth — not a shared
 * database.
 *
 * It asserts ABSENCES as well as presences. Absences are easy to add now and nearly impossible to
 * add once something depends on them.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const registry = JSON.parse(readFileSync(join(here, '../../refusals/registry.json'), 'utf8'));
const knownRefusals = new Set(registry.refusals.map((r) => r.id));

const TARGET = process.env.CONFORMANCE_TARGET;
if (!TARGET) {
  console.error('CONFORMANCE_TARGET is required, e.g. CONFORMANCE_TARGET=http://localhost:8081');
  process.exit(2);
}

let failures = 0;
const results = [];

function record(name, passed, detail = '') {
  results.push({ name, passed, detail });
  if (!passed) failures++;
  console.log(`${passed ? 'ok   ' : 'FAIL '} ${name}${detail ? `\n        ${detail}` : ''}`);
}

async function get(path, init = {}) {
  const res = await fetch(`${TARGET}${path}`, { redirect: 'manual', ...init });
  let body = null;
  try { body = await res.json(); } catch { /* not all responses are JSON */ }
  return { status: res.status, headers: res.headers, body };
}

// ---------------------------------------------------------------------------
// Presence — the documented interface exists and has the documented shape
// ---------------------------------------------------------------------------

async function versionEndpoint() {
  const r = await get('/version');
  record('GET /version returns 200 unauthenticated', r.status === 200, `got ${r.status}`);
  record(
    'GET /version reports a commit — this is what makes deployment externally verifiable',
    typeof r.body?.commit === 'string' && r.body.commit.length > 0,
    `got ${JSON.stringify(r.body?.commit)}`,
  );
  record('GET /version names its service', typeof r.body?.service === 'string');
}

async function healthEndpoint() {
  const r = await get('/health');
  record(
    "GET /health returns 200 — the SERVICE's own health, not the proxy's",
    r.status === 200,
    `got ${r.status}`,
  );
}

// ---------------------------------------------------------------------------
// The 401-never-404 convention
//
// An unknown path returns 404. A known authenticated path returns 401.
// Therefore a 401 PROVES THE ROUTE DEPLOYED — a free deployment check on every
// route, for the cost of one convention.
// ---------------------------------------------------------------------------

async function authConvention() {
  const known = await get('/catalogue/1.0.0/items/HZ-HVCA-001-i01');
  record(
    'a known authenticated route answers 401 without a session (never 404)',
    known.status === 401,
    `got ${known.status} — if this is 404, the route is indistinguishable from one that never deployed`,
  );

  const unknown = await get('/no-such-route-should-exist');
  record(
    'an unknown path answers 404 — which is what makes the 401 above meaningful',
    unknown.status === 404,
    `got ${unknown.status}`,
  );
}

// ---------------------------------------------------------------------------
// Named refusals
// ---------------------------------------------------------------------------

async function namedRefusals() {
  const r = await get('/catalogue/1.0.0/items/HZ-HVCA-001-i01');
  const id = r.body?.refusal;
  record(
    'a refusal carries a NAMED reason, not a bare status code',
    typeof id === 'string' && id.length > 0,
    `body was ${JSON.stringify(r.body)}`,
  );
  const registered = knownRefusals.has(id);
  record(
    `the refusal "${id}" is in the registry`,
    registered,
    // Detail only on FAILURE. An earlier version printed the failure text on a
    // PASSING test — a signal that does not mean what it appears to say, which is
    // exactly the defect class this suite exists to catch.
    registered ? '' : `"${id}" is not registered — every refusal needs a registry entry and a locale key`,
  );
  record('a refusal carries a resolved message', typeof r.body?.message === 'string');
}

// ---------------------------------------------------------------------------
// ABSENCES — the properties that must NOT exist
//
// These are the highest-value assertions in the suite. A comparative endpoint
// or a sort parameter is one query-string change from a league table, and the
// product's entire honest-reporting argument depends on that shape being
// ABSENT rather than permission-gated.
// ---------------------------------------------------------------------------

async function absences() {
  const comparativePaths = [
    '/facilities/compare',
    '/catalogue/1.0.0/facilities',
    '/leaderboard',
    '/rankings',
    '/facilities/scores',
  ];
  let found = [];
  for (const p of comparativePaths) {
    const r = await get(p);
    if (r.status !== 404) found.push(`${p} → ${r.status}`);
  }
  record(
    'NO comparative or cross-facility endpoint exists (absent, not permission-gated)',
    found.length === 0,
    found.join('; '),
  );

  const sortAttempts = [
    '/catalogue/1.0.0/items?sort=score',
    '/catalogue/1.0.0/items?sort=maturity',
    '/catalogue/1.0.0/items?orderBy=readiness',
  ];
  let honoured = [];
  for (const p of sortAttempts) {
    const r = await get(p);
    if (r.status === 200) honoured.push(p);
  }
  record(
    'NO sort parameter is honoured on a comparative field',
    honoured.length === 0,
    honoured.length
      ? `${honoured.join('; ')} — a list sorted by display name WITH a sort parameter available is one query-string change from a league table`
      : '',
  );
}

// ---------------------------------------------------------------------------

const suites = [versionEndpoint, healthEndpoint, authConvention, namedRefusals, absences];

console.log(`conformance → ${TARGET}\n`);
for (const suite of suites) {
  try {
    await suite();
  } catch (err) {
    record(`${suite.name} threw`, false, String(err?.message ?? err));
  }
}

console.log(`\n${results.length - failures}/${results.length} passed`);
process.exit(failures === 0 ? 0 : 1);
