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

// --- V7: the bell ---------------------------------------------------------------

test('★ V7 — the bell validates, and it did NOT before v0.5.1', () => {
  // ⚠️ HOW THIS WAS FOUND. `citadel` PR #25 added `bell` to all four Chapter 1
  // scenes. This schema is `additionalProperties: false`, so every one of those
  // scenes has been INVALID against the contract it pins ever since — and
  // nothing found out, because citadel validated no content against the pinned
  // schemas at all. EVS-1 added that validation and it failed on its first run.
  //
  // The defect was not the field. It was that a consumer pinned a schema and
  // never ran it.
  const s = scene();
  s.bell = 'first';
  assert.ok(validateScene(s), JSON.stringify(validateScene.errors));
});

test('★ V7 — a bell with no locale string is refused', () => {
  // Every enum member has a string in en.json. A free-form bell would render as
  // its own key at the reader, which is the failure the locale coverage check
  // exists to catch one repository over.
  const s = scene();
  s.bell = 'fourth';
  assert.equal(validateScene(s), false, 'a bell canon has not named must not validate');
});

test('a scene need not sit on a bell — the field is optional and nullable', () => {
  const s = scene();
  assert.ok(validateScene(s), 'absent');
  s.bell = null;
  assert.ok(validateScene(s), 'null');
});

// --- EVS-4: actions, evidence and role-filtered discovery ------------------------
//
// ★ THE TWO ACTION TYPES ARE CANON'S, NOT A GAMES CHECKLIST'S.
//
//   "place detailed timings in OPTIONAL INSPECTION or the later review rather
//    than long crisis dialogue"
//   "The selected role supplies one direct authority. The player must SEEK
//    OTHER JUDGMENTS from named clinical, nursing, operational, safety,
//    information, and city partners."
//
// So `inspect` and `consult` are transcribed, not designed. The third action —
// commit — already existed as `choice_or_discovery`.

const evidence = () => ({
  id: 'ev.01.board-reading', what: 'The Hall reads generation active.',
  source: { kind: 'instrument', id: 'the Measure' }, partial: true,
  derivedFrom: 'Canon Scene 2: "The Hall initially sees backup generation active, not the downstream exception."',
});
const action = () => ({
  id: 'consult.01.rami', type: 'consult', target: { kind: 'person', id: 'Rami' },
  reveals: ['ev.01.board-reading'],
  derivedFrom: 'Canon: "Rami defines what may be safely energized."',
});

test('★ EVS-4 — a scene may carry evidence and the actions that reveal it', () => {
  const s = staged();
  s.staging.interactive = ['actions', 'choice_or_discovery'];
  s.evidence = [evidence()];
  s.actions = [action()];
  assert.ok(validateScene(s), JSON.stringify(validateScene.errors));
});

test('★ EVS-4 — the interactive phase can stage actions, and EVS-1 predicted it', () => {
  // EVS-1 shipped `interactive: ["choice_or_discovery"]` and said why: an enum
  // member nothing can produce is a rule that cannot fire. The action exists now.
  const s = staged();
  s.staging.interactive = ['actions'];
  s.evidence = [evidence()];
  s.actions = [action()];
  assert.ok(validateScene(s), JSON.stringify(validateScene.errors));

  s.staging.interactive = ['actions', 'turn'];
  assert.equal(validateScene(s), false, 'the turn is post-commitment and cannot be staged as an action');
});

test('★ an action that reveals NOTHING is refused — a button that does nothing', () => {
  const s = staged();
  s.evidence = [evidence()];
  s.actions = [{ ...action(), reveals: [] }];
  assert.equal(validateScene(s), false);

  s.actions = [action()];
  assert.ok(validateScene(s), JSON.stringify(validateScene.errors));
});

test('★ evidence must name its SOURCE — provenance travels with the fact', () => {
  // Canon's chapter turns on two people reading accurate information in
  // different rooms. An engine holding one true world state cannot express
  // that; one holding who-said-what can.
  const s = staged();
  const e = evidence();
  delete e.source;
  s.evidence = [e];
  s.actions = [action()];
  assert.equal(validateScene(s), false, 'a fact with no source is a fact from nowhere');
});

test('★ every action and every piece of evidence must cite CANON', () => {
  const s = staged();
  s.evidence = [evidence()];
  const a = action();
  delete a.derivedFrom;
  s.actions = [a];
  assert.equal(validateScene(s), false, 'an uncited action is invented content');

  s.actions = [action()];
  const e = evidence();
  delete e.derivedFrom;
  s.evidence = [e];
  assert.equal(validateScene(s), false, 'uncited evidence is invented content');
});

test('★ a consult carries what the person DOES, and the LIMIT canon gives them', () => {
  // ⚠️ `does`, NOT `says`. Canon authors the act and not the line: "Fadl
  // classifies the patient-safety event and sets quality follow-up WITHOUT
  // TAKING CLINICAL OR ELECTRICAL AUTHORITY." Turning that into dialogue would
  // be writing the script.
  const s = staged();
  s.evidence = [evidence()];
  s.actions = [{
    ...action(),
    response: {
      character_id: 'Fadl',
      does: 'Classifies the patient-safety event and sets quality follow-up.',
      withholds: 'He does not take clinical or electrical authority.',
      acts_independently: false,
      dialogue_unresolved: 'Canon describes the act and writes no line for it.',
    },
  }];
  assert.ok(validateScene(s), JSON.stringify(validateScene.errors));

  s.actions[0].response = { character_id: 'Fadl', does: 'x', says: 'a line nobody wrote' };
  assert.equal(validateScene(s), false, 'dialogue must not be expressible where canon writes none');

  s.actions[0].response = { character_id: 'Fadl' };
  assert.equal(validateScene(s), false, 'a character who responds must do something');
});

test('★ a cost is a DECLARED NOTE in a named currency — never a quantity', () => {
  // Canon names the currencies — "a cost in time, trust, workload, service
  // capacity, or evidence" — and sets no prices. A number invented here would
  // be a score wearing a lore costume.
  const s = staged();
  s.evidence = [evidence()];
  s.actions = [{ ...action(), cost: { currency: 'time', what: 'The next status update slips.' } }];
  assert.ok(validateScene(s), JSON.stringify(validateScene.errors));

  s.actions[0].cost = { currency: 'time', what: 'slips', amount: 3 };
  assert.equal(validateScene(s), false, 'a quantity must not be expressible');

  s.actions[0].cost = { currency: 'morale', what: 'x' };
  assert.equal(validateScene(s), false, 'a currency canon did not name is refused');
});

test('★ a reveal is wired to evidence BY ID, never matched on prose', () => {
  // Canon guarantees the clue regardless of role. A guarantee checked by string
  // comparison is not checked.
  const s = staged();
  s.evidence = [{ ...evidence(), satisfies_reveal: 'reveal.01.capacity-is-not-physical-position' }];
  s.actions = [action()];
  s.required_reveals[0].evidence_ids = ['ev.01.board-reading'];
  assert.ok(validateScene(s), JSON.stringify(validateScene.errors));

  s.required_reveals[0].evidence_ids = ['not-an-evidence-id'];
  assert.equal(validateScene(s), false, 'a reveal may only point at evidence ids');
});

test('★ FPE-05 — an option may withhold its risk until the evidence is held', () => {
  const d = decision();
  d.options[0].risk_requires_evidence = ['ev.01.board-reading'];
  assert.ok(validateDecision(d), JSON.stringify(validateDecision.errors));

  // `protects` is never gated. An option whose protection is hidden is not a
  // position the participant can weigh at all, so no such field exists.
  const optionSchema = load('decision.schema.json').$defs.option;
  assert.ok('risk_requires_evidence' in optionSchema.properties);
  assert.ok(!('protects_requires_evidence' in optionSchema.properties),
    'protects must never be withheld — an option must always be weighable');

  d.options[0].risk_requires_evidence = ['board-reading'];
  assert.equal(validateDecision(d), false, 'the gate may only name evidence ids');
});

test('EVS-4 is ADDITIVE — a scene with no actions still validates', () => {
  assert.ok(validateScene(staged()), JSON.stringify(validateScene.errors));
  assert.ok(validateScene(scene()));
});

// --- EVS-5: the asset slot is a DECLARATION -------------------------------------
//
// ⚠️ HOW THIS WAS FOUND. The consumer's computed asset manifest reads `slot.id`
// and `slot.asset_id`. The content shipped bare strings. So all eight of
// Chapter 1's slots were reported as `sc-01-01:?`, and the rule refusing a
// REQUIRED slot — the rule that keeps play from depending on an image — read
// `slot.required` on a string and could never fire.
//
// Both looked correct. Both were tested against object fixtures the content
// never produced. This is the third instance this month of one shape: a rule
// tested on a form the real data does not take.

const slot = () => ({
  id: 'slot.ch01.gate-of-names', kind: 'environment',
  alt_key: 'art.gate_of_names.alt', max_bytes: 300000,
  crop: null, candidate_ref: 'VA-004', inclusion_reviewed: false, reviewed_by: null,
});

test('★ EVS-5 — a declared slot validates, and a bare string no longer does', () => {
  const s = scene();
  s.asset_slots = [slot()];
  assert.ok(validateScene(s), JSON.stringify(validateScene.errors));

  s.asset_slots = ['slot.ch01.gate-of-names'];
  assert.equal(validateScene(s), false, 'two shapes for one thing is what produced the defect');
});

test('★ a slot must declare its ALT TEXT and its WEIGHT BUDGET before anything fills it', () => {
  // An image with no text equivalent removes an access path nobody notices is
  // missing until somebody needs it. A budget agreed after the art arrives is
  // a budget the art sets.
  for (const field of ['alt_key', 'max_bytes', 'kind', 'id', 'inclusion_reviewed']) {
    const s = scene();
    const one = slot();
    delete one[field];
    s.asset_slots = [one];
    assert.equal(validateScene(s), false, `a slot with no ${field} was accepted`);
  }
  const ok = scene();
  ok.asset_slots = [slot()];
  assert.ok(validateScene(ok));
});

test('★ a slot claiming inclusion review must NAME the reviewer', () => {
  // An unattributed review is an assertion. The same discipline governs content
  // approval one repository over, where `canApprove` reads the editor list.
  const s = scene();
  s.asset_slots = [{ ...slot(), inclusion_reviewed: true }];
  assert.equal(validateScene(s), false, 'a review with no reviewer was accepted');

  s.asset_slots = [{ ...slot(), inclusion_reviewed: true, reviewed_by: 'the named inclusion reviewer' }];
  assert.ok(validateScene(s), JSON.stringify(validateScene.errors));

  // ...and an unreviewed slot is a perfectly good slot. Building against one is
  // not what the gate forbids; BINDING a candidate as canonical is.
  s.asset_slots = [slot()];
  assert.ok(validateScene(s));
});

test('a slot may declare the operational STATES it must eventually carry', () => {
  // An outage location needs at least two, and the requirement should exist
  // before the art does rather than being discovered when one state is drawn.
  const s = scene();
  s.asset_slots = [{ ...slot(), states: ['supplied', 'interrupted'] }];
  assert.ok(validateScene(s), JSON.stringify(validateScene.errors));

  s.asset_slots = [{ ...slot(), states: ['supplied', 'supplied'] }];
  assert.equal(validateScene(s), false, 'one state named twice is one state');
});

test('a candidate reference is not a binding', () => {
  // "Incidental architectural, costume, equipment, and emblem details do not
  // become story canon merely because they appear in an image."
  const s = scene();
  s.asset_slots = [{ ...slot(), candidate_ref: 'VA-004', inclusion_reviewed: false }];
  assert.ok(validateScene(s));
  const declared = s.asset_slots[0];
  assert.equal(declared.inclusion_reviewed, false);
  assert.equal(declared.crop, null, 'no crop is agreed until a design package exists');
});

test('★ EVS-5 — a scene may name its locations as REFERENCES as well as prose', () => {
  // ⚠️ ALONGSIDE, not instead of. `locations` holds canon's own phrases — "older
  // ICU far bay" — and those are the writer's voice. `location_ids` resolve
  // against a place model that can say what is next door and what changed
  // there. Matching one to the other by string comparison would be a
  // resemblance standing in for a reference, which is the mistake
  // `required_reveals.evidence_ids` was added to avoid one field over.
  const s = scene();
  s.location_ids = ['loc.gate-of-names', 'loc.sorting-court'];
  assert.ok(validateScene(s), JSON.stringify(validateScene.errors));
  assert.ok(s.locations.length > 0, 'canon\'s own phrases stay');

  s.location_ids = ['gate-of-names'];
  assert.equal(validateScene(s), false, 'a location reference must look like one');

  s.location_ids = [];
  assert.equal(validateScene(s), false, 'a scene that names locations must name at least one');
});
