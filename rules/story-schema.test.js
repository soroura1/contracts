/**
 * R3 Phase B — the scene and decision contracts, proven by REFUSAL.
 *
 * ============================================================================
 * EVERY CORRECTION IS TESTED BY MAKING IT REFUSE, AND BY MAKING IT PERMIT.
 * ============================================================================
 * A schema that rejects everything passes a rejection test perfectly. Six rules
 * were found inert in this project on 16-17 August — each correct, each keying
 * on something that was never present. So each correction below has a negative
 * fixture AND the corrected form.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const here = dirname(fileURLToPath(import.meta.url));
const schemaDir = join(here, '../schemas/story');
const load = (f) => JSON.parse(readFileSync(join(schemaDir, f), 'utf8'));

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validateScene = ajv.compile(load('scene.schema.json'));
const validateDecision = ajv.compile(load('decision.schema.json'));

// A minimal scene that PASSES, so each negative fixture differs by one field.
const scene = () => JSON.parse(readFileSync(join(here, 'fixtures/scene-valid.json'), 'utf8'));
const decision = () => JSON.parse(readFileSync(join(here, 'fixtures/decision-valid.json'), 'utf8'));

test('the valid fixtures pass — without this, every refusal below is meaningless', () => {
  assert.ok(validateScene(scene()), JSON.stringify(validateScene.errors));
  assert.ok(validateDecision(decision()), JSON.stringify(validateDecision.errors));
});

test('★ CORRECTION 1 — a single-location scene is refused; canon Scene 1 spans three', () => {
  const s = scene();
  s.locations = 'Gate of Names';           // the old shape
  assert.equal(validateScene(s), false);
  s.locations = ['Gate of Names', 'Clinical Sorting Court', 'emergency and urgent-care courts'];
  assert.ok(validateScene(s));
});

test('★ CORRECTION 3 — a Chapter 1 scene claiming a transfer artifact is UNLOADABLE', () => {
  // Canon: "No formal assessment or transfer artifact is completed in Chapters 1-3."
  // Enforced by the schema, so a violating scene cannot load. Stronger than prose
  // or a grep -- and a grep is what missed this once already.
  const s = scene();
  s.real_world_bridge = { kind: 'artifact', id: 'tf-01' };
  assert.equal(validateScene(s), false, 'a ch-01 artifact bridge must be refused');

  s.real_world_bridge = { kind: 'observation_record', id: null };
  assert.ok(validateScene(s), 'an observation record is what Chapter 1 DOES produce');
});

test('★ CORRECTION 2 — an untyped up/down effect is refused; enum state is expressible', () => {
  const d = decision();
  d.options[0].effects = [{ operation: 'up', magnitude: 'moderate', delay: 'immediate', visible: true }];
  assert.equal(validateDecision(d), false, 'the old up|down shape must not validate');

  // Canon assigns discrete state, which up|down cannot express at all.
  d.options[0].effects = [{
    operation: 'set_enum', enum_variable: 'C1_CRITICAL_PATH', enum_value: 'ED_HOLD',
    delay: 'immediate', visible: true,
  }];
  assert.ok(validateDecision(d), JSON.stringify(validateDecision.errors));
});

test('set_enum without its value is refused — a half-declared effect is how a rule goes vacuous', () => {
  const d = decision();
  d.options[0].effects = [{ operation: 'set_enum', enum_variable: 'C1_CRITICAL_PATH', delay: 'immediate', visible: true }];
  assert.equal(validateDecision(d), false);
});

test('★ an option with an empty `defensible_by` is refused — that is a decoy, not a choice', () => {
  const d = decision();
  d.options[0].defensible_by = '';
  assert.equal(validateDecision(d), false);
});

test('a decision with one option is refused — one option is not a decision', () => {
  const d = decision();
  d.options = [d.options[0]];
  assert.equal(validateDecision(d), false);
});

test('★ capability_block_ref IDENTITY excludes tool_id — blocks are shared across tools', () => {
  const s = load('scene.schema.json');
  const ref = s.$defs.capability_block_ref;
  // tool_id exists (a surface must know which tool to open) but is NOT required,
  // so it cannot be part of identity. A tool-scoped identity would give one block
  // two identities and break shared credit.
  assert.deepEqual(ref.required, ['block_id', 'block_version', 'catalogue_version']);
  assert.ok('tool_id' in ref.properties, 'context is needed to navigate to the tool');
  assert.ok(!ref.required.includes('tool_id'), 'tool_id must never be part of identity');
});

test('every candidate scene and decision still validates against the adopted schema', () => {
  const cand = join(here, 'fixtures/candidates');
  let checked = 0;
  for (const f of readdirSync(join(cand, 'scenes'))) {
    const ok = validateScene(JSON.parse(readFileSync(join(cand, 'scenes', f), 'utf8')));
    assert.ok(ok, `${f}: ${JSON.stringify(validateScene.errors)}`);
    checked++;
  }
  for (const f of readdirSync(join(cand, 'decisions'))) {
    const ok = validateDecision(JSON.parse(readFileSync(join(cand, 'decisions', f), 'utf8')));
    assert.ok(ok, `${f}: ${JSON.stringify(validateDecision.errors)}`);
    checked++;
  }
  assert.equal(checked, 8, 'expected the four scenes and four decisions');
});

// --- V9: the emotional register ------------------------------------------------

test('★ V9 — a register must carry the canon term it was DERIVED from', () => {
  const s = scene();
  // Canon assigns the arc per CHAPTER. A per-scene register is an interpretation,
  // and `derivedFrom` is what keeps the interpretation visible to a reviewer
  // instead of inherited as if it were canon.
  s.emotional_state = { register: 'wonder' };
  assert.equal(validateScene(s), false, 'a register with no derivation was accepted');

  s.emotional_state = { register: 'wonder', derivedFrom: 'wonder' };
  assert.ok(validateScene(s), JSON.stringify(validateScene.errors));
});

test('★ V9 — only registers with a DEFINED visual meaning are permitted', () => {
  const s = scene();
  // "concentrated fear" is canon's word and has no register in section 2 of the
  // art model. A state nothing can render is a state that drives nothing.
  s.emotional_state = { register: 'concentrated-fear', derivedFrom: 'concentrated fear' };
  assert.equal(validateScene(s), false);

  s.emotional_state = { register: 'pressure', derivedFrom: 'concentrated fear' };
  assert.ok(validateScene(s), 'the mapped register is permitted, and the canon term is preserved');
});

test('V9 — a scene may declare its register UNRESOLVED rather than invent one', () => {
  const s = scene();
  s.emotional_state = { register: 'unease', derivedFrom: 'first unease',
                        unresolved: 'canon names no register for this scene individually' };
  assert.ok(validateScene(s));
});
