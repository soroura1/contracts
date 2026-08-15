#!/usr/bin/env node
/**
 * Validates the contract artifacts themselves — no running service required.
 *
 * This is the check that runs in `npm run check`. It catches the class of defect that two
 * adversarial review rounds found by hand in the planning folder: a schema that does not parse, a
 * refusal referenced but unregistered, a locale key missing, an example that does not match its own
 * schema.
 *
 * Extend it whenever a defect is found that a script could have caught.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
let failures = 0;
const bad = (m, d = '') => { console.log(`FAIL  ${m}${d ? `\n        ${d}` : ''}`); failures++; };
const ok = (m) => console.log(`ok    ${m}`);

function walk(dir, ext) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...walk(p, ext));
    else if (entry.endsWith(ext)) out.push(p);
  }
  return out;
}

// --- every JSON Schema parses and declares its dialect and identity -----------
{
  const schemas = walk(join(root, 'schemas'), '.json');
  let problems = [];
  for (const file of schemas) {
    try {
      const s = JSON.parse(readFileSync(file, 'utf8'));
      if (!s.$schema) problems.push(`${relative(root, file)}: no $schema dialect declared`);
      if (!s.$id) problems.push(`${relative(root, file)}: no $id — consumers cannot reference it`);
      if (s.type === 'object' && s.additionalProperties !== false) {
        problems.push(`${relative(root, file)}: additionalProperties is not false — an object schema that accepts unknown keys validates almost nothing`);
      }
    } catch (e) {
      problems.push(`${relative(root, file)}: ${e.message}`);
    }
  }
  problems.length
    ? bad(`${schemas.length} schema(s) checked, ${problems.length} problem(s)`, problems.join('\n        '))
    : ok(`every JSON Schema parses, declares a dialect and an $id (${schemas.length})`);
}

// --- the refusal registry is well-formed ------------------------------------
{
  const reg = JSON.parse(readFileSync(join(root, 'refusals/registry.json'), 'utf8'));
  const problems = [];
  const seen = new Set();
  for (const r of reg.refusals) {
    for (const field of ['id', 'service', 'meaning', 'http', 'userMessageKey']) {
      if (r[field] === undefined) problems.push(`${r.id ?? '(no id)'}: missing ${field}`);
    }
    if (seen.has(r.id)) problems.push(`${r.id}: duplicate identifier`);
    seen.add(r.id);
    if (r.userMessageKey && !r.userMessageKey.startsWith('refusal.')) {
      problems.push(`${r.id}: locale key should start with "refusal."`);
    }
    if (r.id && !/^[a-z0-9-]+$/.test(r.id)) {
      problems.push(`${r.id}: identifiers are lower-kebab-case so they are safe in logs and URLs`);
    }
  }
  problems.length
    ? bad(`refusal registry has ${problems.length} problem(s)`, problems.join('\n        '))
    : ok(`refusal registry well-formed — ${reg.refusals.length} refusals, every one with a locale key`);
}

// --- every OpenAPI file parses and carries the boundary statement ------------
{
  const specs = walk(join(root, 'openapi'), '.yaml');
  const problems = [];
  for (const file of specs) {
    const text = readFileSync(file, 'utf8');
    if (!text.includes('openapi: 3.1')) problems.push(`${relative(root, file)}: not OpenAPI 3.1`);
    if (!text.includes('preparedness, exercise and improvement only')) {
      problems.push(`${relative(root, file)}: the scope boundary is not stated in the API description`);
    }
    if (!text.includes('401')) {
      problems.push(`${relative(root, file)}: no 401 documented — the 401-never-404 convention is what makes deployment verifiable`);
    }
  }
  problems.length
    ? bad(`${specs.length} spec(s) checked, ${problems.length} problem(s)`, problems.join('\n        '))
    : ok(`every OpenAPI spec is 3.1, states the scope boundary, documents 401 (${specs.length})`);
}

// --- no comparative endpoint is DOCUMENTED ----------------------------------
// The absence must hold in the contract, not only in the implementation.
{
  const specs = walk(join(root, 'openapi'), '.yaml');
  const offenders = [];
  for (const file of specs) {
    const text = readFileSync(file, 'utf8');
    for (const pattern of [/^\s+\/.*compare/im, /^\s+\/.*leaderboard/im, /^\s+\/.*ranking/im]) {
      if (pattern.test(text)) offenders.push(`${relative(root, file)}: ${pattern}`);
    }
    if (/name:\s*sort\b/i.test(text)) {
      offenders.push(`${relative(root, file)}: a "sort" parameter is documented — one query-string change from a league table`);
    }
  }
  offenders.length
    ? bad('a comparative endpoint or sort parameter is DOCUMENTED', offenders.join('\n        '))
    : ok('no comparative endpoint or sort parameter exists in any contract');
}

console.log();
console.log(failures === 0 ? 'PASS' : 'FAILED');
process.exit(failures === 0 ? 0 : 1);
