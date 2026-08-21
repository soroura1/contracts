/**
 * ⛔ SCAFFOLDING. THIS PROVES THE HARNESS RUNS, AND NOTHING ELSE.
 *
 * `contracts` was reset to infrastructure on 2026-08-21. Every schema, the
 * refusal registry, the OpenAPI document, the lifecycle rules, the generated
 * types and the conformance suite were deleted — they are definitions, and the
 * definitions are being rebuilt.
 *
 * ⚠️ A GREEN SUITE OVER AN EMPTY REPOSITORY CERTIFIES NOTHING, and this file
 * must not be allowed to look like it does. The second test below fails the
 * moment a real schema lands, which is the only honest way to make sure it is
 * replaced rather than left underneath.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';

test('the test harness runs', () => {
  assert.equal(1, 1);
});

test('⚠️ and there is nothing defined yet — this fails the day a schema lands', () => {
  const schemas = new URL('../schemas', import.meta.url);
  assert.ok(!existsSync(schemas),
    'schemas/ exists again — delete test/smoke.test.js and write real refusal tests for it');
});

test('the type generator survives, and it is the machinery worth keeping', () => {
  // `scripts/generate-types.js` walks schemas/** and derives TypeScript from
  // JSON Schema, so a shape is never defined twice. It is kept deliberately:
  // when the first schema returns, the derivation already exists and nobody is
  // tempted to hand-write a type beside it.
  assert.ok(readdirSync(new URL('../scripts', import.meta.url)).includes('generate-types.js'));
});
