/**
 * The generated types must be TYPES, not text that looks like types.
 *
 * ============================================================================
 * NOTHING IMPORTS types/index.d.ts YET. THAT IS WHY IT WAS BROKEN.
 * ============================================================================
 * Two defects shipped in it, both since v0.1.0, both invisible because no
 * consumer had adopted the file:
 *
 *   `"a" | "b"[]`      -- TypeScript binds [] tighter than |, so this is
 *                         `"a" | ("b"[])`, not an array of two strings.
 *   `in-review?: ...`  -- a hyphen is not an identifier. The file did not parse.
 *
 * EVS-1 added three more enum arrays, which is what made the first worth
 * fixing rather than propagating. Neither is checkable by running the
 * generator, because a generator that emits nonsense exits 0. So the emitted
 * text is asserted here -- the cheapest thing that would have caught both.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const dts = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../types/index.d.ts'), 'utf8');

test('★ no union is left unparenthesised before `[]`', () => {
  // A quoted member, whitespace-pipe-whitespace, more members, then `[]` with
  // no closing paren before it.
  const offenders = dts.split('\n').filter((l) => /"[^"]*"(?:\s*\|\s*"[^"]*")+\[\]/.test(l));
  assert.deepEqual(offenders, [], 'these read as `A | (B[])`, which is not what the schema says');
});

test('★ every property name is either an identifier or quoted', () => {
  const offenders = dts.split('\n').filter((l) => /^\s+[A-Za-z_$][A-Za-z0-9_$]*-[A-Za-z0-9_$-]*\??:/.test(l));
  assert.deepEqual(offenders, [], 'a hyphenated key must be quoted or the file does not parse');
});

test('the generated file still carries its do-not-edit header', () => {
  assert.match(dts, /GENERATED from schemas/);
});
