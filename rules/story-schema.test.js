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

// --- EVS-1: staged runtime presentation ---------------------------------------
//
// ★ WHAT THESE TESTS PROTECT.
//
// The Final Product Experience Contract's first presentation invariant (FPE-01)
// is that `turn`, the immediate effect, the state delta and `residue` are not
// rendered before commitment. The current renderer emits all six movements as
// one ordered document, so the interface spoils its own drama — and until this
// version there was NOTHING IN THE CONTRACT FOR A RUNTIME TO OBEY. A rule with
// no field to key on is the failure shape this repository has already met
// several times: correct, and unable to fire.
//
// So each refusal below is paired with the corrected form being permitted.

const staging = () => {
  const { _comment, ...fragment } =
    JSON.parse(readFileSync(join(here, 'fixtures/scene-staging.json'), 'utf8'));
  return fragment;
};
const staged = () => ({ ...scene(), ...staging() });

test('the staged fixture passes — without this, every EVS-1 refusal below is meaningless', () => {
  assert.ok(validateScene(staged()), JSON.stringify(validateScene.errors));
});

test('staging is ADDITIVE — an unstaged scene still validates, so v0.4.x content is untouched', () => {
  // The scene fixture and the four R3 candidates carry no staging. If this
  // failed, v0.5.0 would be a major version pretending to be a minor one.
  assert.ok(validateScene(scene()), JSON.stringify(validateScene.errors));
});

test('★ FPE-01 — `residue` staged anywhere but scene_exit is REFUSED', () => {
  const s = staged();
  s.staging.pre_commit = ['orientation', 'desire', 'friction', 'residue'];
  assert.equal(validateScene(s), false, 'residue before commitment must not validate');

  s.staging.pre_commit = ['orientation', 'desire', 'friction'];
  assert.ok(validateScene(s), JSON.stringify(validateScene.errors));
});

test('★ FPE-01 — `turn` staged before commitment is REFUSED', () => {
  const s = staged();
  s.staging.pre_commit = ['orientation', 'turn'];
  assert.equal(validateScene(s), false, 'the turn is what the commitment CAUSES');

  s.staging.post_commit = ['turn', 'immediate_effect'];
  s.staging.pre_commit = ['orientation'];
  assert.ok(validateScene(s), JSON.stringify(validateScene.errors));
});

test('★ the all-at-once presentation — six movements in one phase — is UNREPRESENTABLE', () => {
  // This is the shape the build ships today: one <ol> of all six movements.
  const s = staged();
  s.staging.pre_commit = ['orientation', 'desire', 'friction', 'choice_or_discovery', 'turn', 'residue'];
  assert.equal(validateScene(s), false, 'the current renderer\'s shape must not be expressible');
});

test('★ FPE-02 — a post-commit phase with no immediate effect in it is REFUSED', () => {
  const s = staged();
  s.staging.post_commit = ['turn'];
  assert.equal(validateScene(s), false, 'a response beat must contain the response');

  s.staging.post_commit = ['immediate_effect'];
  assert.ok(validateScene(s), 'the turn is optional there; the immediate effect is not');
});

test('★ a scene that STAGES but carries no immediate_effect is REFUSED', () => {
  // The staging can name the beat while the scene holds nothing to put in it.
  // That renders as an empty phase, which a player reads as a choice that did
  // nothing -- the exact failure FPE-02 names.
  const s = staged();
  delete s.immediate_effect;
  assert.equal(validateScene(s), false, 'a staged scene owes its immediate effect');

  s.immediate_effect = staging().immediate_effect;
  assert.ok(validateScene(s), JSON.stringify(validateScene.errors));
});

test('an UNSTAGED scene owes no immediate effect — the conditional keys on staging, not on nothing', () => {
  const s = scene();
  assert.ok(!('staging' in s));
  assert.ok(validateScene(s), 'the then-branch must not fire when staging is absent');
  s.staging = null;
  assert.ok(validateScene(s), 'nor when staging is explicitly null');
});

test('★ a null narrative response must say WHAT IS OWED and what to derive the beat from', () => {
  // "Canon authors no prose here" and "nobody wrote the response beat" produce
  // the same document unless the gap is declared. Refusing the undeclared form
  // is what keeps `unresolved` an honest record instead of an optional habit.
  const s = staged();
  const r = s.immediate_effect.responses[0];

  delete r.unresolved;
  assert.equal(validateScene(s), false, 'a null response with no declared gap must be refused');

  r.unresolved = [{ field: 'narrative_response', why: 'canon authors none' }];
  delete r.derived_from;
  assert.equal(validateScene(s), false, 'a null response with nothing to derive from is an empty beat');

  r.derived_from = ['protects', 'risks'];
  assert.ok(validateScene(s), JSON.stringify(validateScene.errors));
});

test('an AUTHORED narrative response needs no unresolved entry — the rule keys on the gap', () => {
  const s = staged();
  const r = s.immediate_effect.responses[0];
  r.narrative_response = { key: 'scene.01.01.response.name_an_owner' };
  delete r.unresolved;
  delete r.derived_from;
  assert.ok(validateScene(s), JSON.stringify(validateScene.errors));
});

test('★ a character response holds MORE THAN ONE VOICE — canon reacts in three', () => {
  // Chapter 1 Scene 4 assigns Fadl, Maha AND Rami a different action per
  // pathway. A single-character shape would have forced two of the three to be
  // dropped, which is why this is an array -- found by reading the content, not
  // by designing the field.
  const s = staged();
  s.immediate_effect.responses[0].character_response = [
    { character_id: 'Fadl', responds: 'Retains the high-risk near-miss classification.' },
    { character_id: 'Maha', responds: 'Links the raw chronology to the quality record.' },
    { character_id: 'Rami', responds: 'Refuses "restored" as a synonym for "corrected".' },
  ];
  assert.ok(validateScene(s), JSON.stringify(validateScene.errors));

  s.immediate_effect.responses[0].character_response = [{ character_id: 'Fadl' }];
  assert.equal(validateScene(s), false, 'a character who reacts must react with something');

  s.immediate_effect.responses[0].character_response = [];
  assert.equal(validateScene(s), false, 'an empty list is not "canon is silent" — null is');
});

test('the state change is NOT restated in the scene — it has one authority', () => {
  const s = staged();
  assert.equal(s.immediate_effect.state_change_source, 'decision_effects');
  s.immediate_effect.state_change_source = 'authored_here';
  assert.equal(validateScene(s), false,
    'a second place to declare state changes is a second definition that will drift');
});

test('the phase SEQUENCE is fixed by the contract, so a scene cannot reorder it', () => {
  const s = staged();
  delete s.staging.scene_exit;
  assert.equal(validateScene(s), false, 'all four phases are required');

  s.staging.scene_exit = ['residue'];
  s.staging.after_everything = ['residue'];
  assert.equal(validateScene(s), false, 'a fifth phase is not a phase this contract knows');
});
