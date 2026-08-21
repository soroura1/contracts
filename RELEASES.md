# Releases — `contracts`

**This file owns this repository's release numbering.** A number is never reused and never
renumbered. The prior build attempt had two different releases both numbered R5, with colliding task
numbers, because no single file owned the sequence.

| Release | Status | Tag | Closed | Notes |
|---|---|---|---|---|
| **R0** | 🚧 in progress | — | — | Walking skeleton. Tasks: `citadel-planning/06-releases/R0-tasks.md` |

## 2026-08-21 — reset to infrastructure

The owner chose to start the product over. Every definition was deleted: all fifteen schemas, the
refusal registry, the OpenAPI document, the lifecycle rules and fixtures, the generated types and
the conformance suite. The machinery remains — the package, the repository check, the pipeline and
the type generator.

**No release was cut**, and the package version was set to `0.0.0` because there is nothing to
version.

★ **Every existing tag was kept, and that is what made the reset safe.** Consumers pin tags:
`checklist-api` — live in production — pins `v0.2.2`, `identity-enrolment` and `checklist-app` pin
`v0.2.1`, and `citadel` pins `v0.8.0`. A tag is immutable, so none of them can see this. **Do not
delete the tags.**

## Rules

1. A release is **closed or reopened, never left ambiguous.**
2. A release is done when its **walk** completes in the deployed environment, performed by someone
   who did not build it.
3. Cutting a tag does not deploy it. See [CONTRIBUTING.md](CONTRIBUTING.md) § *The deploy gate*.

## v0.8.0 — strategy, instruments, capability and performed characters · SG-1

**21 August 2026.** `DEC-031`. **Additive — every v0.7.x scene and decision still validates**, and a
test asserts exactly that, because a minor version claiming to be additive and quietly invalidating
content is how a consumer discovers a breaking change at runtime.

### What was unrepresentable before

The SG-1 product audit found the build's actions free and its consequences textual. Both were true
of **the contract** first:

| Could not be expressed | Now |
|---|---|
| An option that **commits** something | `option.commits` — a named capability moving to `committed` or `consumed` |
| Where the pressure **went** | `option.transfers_pressure_to` |
| What is still true **afterwards**, per pathway | `option.residue`, and every entry **binds to a location, route, instrument, person or capability** — a residue bound to nothing can be described and never shown |
| An instrument that is **accurate and silent** | `evidence[].reading.state`, where `unavailable` is a state and not an error |
| A capability the participant can **read** | `capability.schema.json`, whose `how_known` must name an instrument |
| A character who **refuses, qualifies, or acts without you** | `scene.character_beats`, with five distinct kinds |
| A commitment the world **answers in order** | `immediate_effect.responses[].world_response` — environment, instrument, holder, person |

### ⛔ The two things this version makes impossible

**A quantity.** `capability` has no `amount` and no `remaining`, and `commits` has no count; all
three are refused by `additionalProperties: false` and tested. Canon names time, trust, workload,
service capacity and evidence as this world's currencies and sets no prices for any of them. A number
invites optimisation, which is the behaviour the product exists to make harder. Opportunity is a
**named holder in a named state**, and its constraint is exclusivity — which survives the removal of
every clock, and is why the non-timed accessibility path carries the same trade rather than a
relaxed one.

**A response layer omitted in silence.** `world_response` requires all four keys and permits each to
be null. An author with nothing for the instrument layer has to say so, because the most valuable
beat in this chapter is an instrument that **does not change**: bridge the affected bay with a
mobile source and the critical-power board still shows it unsupplied, since the board watches
declared circuits.

### Where the objects came from

Not designed. Transcribed. The sensory canon already builds every instrument this release needs —
the copper message rail with its one, two and three taps and the amber shutter that means *sent, not
answered*; the slate map whose burned-out wick reads exactly like a service that has stopped
reporting; the column room showing a ratio and not a count; and the weight room, which holds one
weight per **declared** dependency and therefore *"shows nothing at all when a dependency was never
declared."* Chapter 1's hidden board was never declared. The instrument that would have caught it is
correct, and silent.

## v0.7.0 — the asset slot becomes a declaration · EVS-5

**20 August 2026.** `DEC-030`.

### ⚠️ Breaking, and named as such

`asset_slots` was an array of **strings**. It is now an array of **objects**, and a string is
refused. Per `VERSIONING.md` a content-schema change that invalidates existing content is a breaking
change: this is `0.x`, so the minor position carries it, and the migration note names **every
consumer — `citadel`, the only one — migrated in the same wave.**

### How this was found

The consumer's computed asset manifest reads `slot.id` and `slot.asset_id`. The content shipped
`"slot.ch01.gate-of-names"`.

> **All eight of Chapter 1's slots were reported as `sc-01-01:?`.** And
> `assertPlayableWithoutArt` — the rule that keeps play from depending on an image — read
> `slot.required` on a string, so it could never fire.

Both looked correct. **Both were tested against object fixtures the content never produced.** That is
the third instance this month of one shape: a rule exercised only on a form the real data does not
take.

| A slot now declares | Why before anything fills it |
|---|---|
| `alt_key` | An image with no text equivalent removes an access path nobody notices is missing until somebody needs it |
| `max_bytes` | A budget agreed after the art arrives is a budget the art sets |
| `kind`, `crop`, `states` | An outage location needs at least two operational states, and the requirement should exist before the art does |
| `candidate_ref` | A concept reference. **A candidate is not a binding** — incidental architectural, costume, equipment and emblem details do not become canon by appearing in an image |
| `inclusion_reviewed` + `reviewed_by` | A slot claiming review must **name the reviewer**. An unattributed review is an assertion, and the same discipline governs content approval one repository over |

**Building against an unreviewed slot is not what the gate forbids. Binding a candidate as canonical
is.**

## v0.6.0 — actions, evidence and role-filtered discovery · EVS-4

**20 August 2026.** `DEC-030`.

### The two action types are canon's, not a games checklist's

Canon asks for both by name:

> *"place detailed timings in **optional inspection** or the later review rather than long crisis
> dialogue"*
>
> *"The selected role supplies one direct authority. The player must **seek other judgments** from
> named clinical, nursing, operational, safety, information, and city partners."*

So `inspect` and `consult` were transcribed, not designed. The third — commit — already existed as
`choice_or_discovery`. `staging.interactive` gains `actions`, which **EVS-1 predicted in its own
schema description**: *"members are not declared before the action they name exists — an enum member
nothing can produce is a rule that cannot fire."*

| Added to `scene.schema.json` | |
|---|---|
| `evidence` | What can be learned, each item carrying **its source** and whether it is `partial` |
| `actions` | `inspect` or `consult`, a target, what it `reveals`, `visible_to_roles`, an optional `requires`, an optional character `response`, an optional `cost` |

⚠️ **A consult response carries `does`, not `says`.** Canon authors the **act** and not the line —
*"Fadl classifies the patient-safety event and sets quality follow-up **without taking clinical or
electrical authority**"*, *"Rami defines what may be safely energized"*, *"the nursing leader corrects
the interpretation"*. Those are canon's own sentences. Turning them into dialogue would be writing
the script, so `says` is **unrepresentable** and `dialogue_unresolved` records that the line is owed.

| `required_reveals[].evidence_ids` | The reveal wired to evidence **by id** |

### Why evidence carries a source

Chapter 1 turns on two people reading accurate information in different rooms and reaching different
conclusions — the Hall sees *"backup generation active"*, the far bay sees no supply. **An engine
holding one true world state cannot express that. One holding who-said-what can.**

### ⚠️ A cost is a declared note, never a quantity

Canon names the currencies — *"a cost in time, trust, workload, service capacity, or evidence"* — and
attaches them to unsafe proposals and the fail-forward. **It sets no prices.** So `cost` carries a
currency and a sentence, an `amount` is unrepresentable, and a currency canon did not name is
refused. A number invented here would be a score wearing a lore costume, which `DEC-005` exists to
prevent.

### `risk_requires_evidence` — FPE-05, inverted

Until now every option's risk was unconditionally visible, which reads as a briefing rather than as
something learned. An option may now withhold its `risks` until the participant holds the evidence
that makes it knowable.

⚠️ **`protects` is never gated**, and no field exists to gate it — an option whose protection is
hidden is not a position anyone can weigh. That every decision keeps at least one ungated risk is a
cross-option rule the consumer enforces, because a schema cannot see across options.

**Additive.** A scene with no actions and a decision with no gate both still validate.

## v0.5.1 — `bell` on a scene · V7, and the check that found it missing

**20 August 2026.**

`citadel` PR #25 added `bell` to all four Chapter 1 scenes — the world's own clock, so a scene's
place in the day is told as *"Quarter after First Bell"* rather than *"Scene 2 of 4"*. It was never
added here, and `scene.schema.json` is `additionalProperties: false`.

> **So every shipped Chapter 1 scene has been invalid against the contract it pins, since PR #25.**

**Nothing found out, and nothing could have.** `citadel` validated *no content* against the pinned
schemas at all: `check-repo.sh` proved the pin was an exact tag, and `npm run conformance` ran this
repository's suite against itself. Neither looked at a scene. EVS-1 added
`citadel/test/content-conformance.test.js` and it failed on its first run.

⚠️ **The defect was the missing check, not the missing field.** A consumer that pins a contract and
never runs it has paid the tag-and-pin cost and bought none of the safety — which is the entire
argument for five repositories.

`bell` is an optional, nullable enum of the four bells Chapter 1 names. An enum rather than a free
string because **every member has a locale string**; a bell with none renders as its own key at the
reader. A chapter naming a fourth bell extends the enum and adds its string in the same change.

Additive. Consumers on `v0.5.0` are unaffected until they adopt it.

## v0.5.0 — the staged runtime contract · EVS-1

**20 August 2026.** `DEC-030`. The Experience Vertical-Slice Gate's first development session.

### The thing that had nowhere to live

The Final Product Experience Contract's first presentation invariant, **FPE-01**, is that `turn`, the
immediate effect, the state delta and `residue` are **not rendered before commitment**. The shipped
renderer emits all six authored movements as one ordered `<ol>`, so the interface spoils its own
drama — and **no rule could object, because the contract carried no field saying WHEN anything is
presented.** The six movements are source material; the schema treated them as a display list.

That is this project's recurring failure shape one layer earlier than usual. The usual form is a rule
that is correct and cannot fire. This was a rule that could not be *written*.

| Added to `schemas/story/scene.schema.json` | |
|---|---|
| `staging` | Four required phases — `pre_commit`, `interactive`, `post_commit`, `scene_exit` — each with its own `items` enum. `turn` and `residue` are **absent from the pre-commit enum**, and that absence is FPE-01 |
| `immediate_effect` | The response beat's material, per committed option: `narrative_response`, `character_response`, `derived_from`, `unresolved`. `character_response` is an **array** because canon reacts in more than one voice — the closure characterization assigns Fadl, Maha *and* Rami a different action per pathway |
| A top-level `if`/`then` | A scene that **stages** must carry its immediate effect. Staging can name a beat while the scene holds nothing to put in it, which renders as an empty phase — read by a player as a choice that did nothing |

**The phase sequence is not data.** It is the object's four required keys, so a scene cannot declare
its phases out of order; what a scene *can* get wrong is which movement sits in which phase, and each
phase's enum is what refuses that. The all-at-once presentation — six movements in one phase, which
is the shape shipping today — is **unrepresentable**.

### What the schema will not let an author invent

Chapter 1 canon authors, per pathway, the operational consequence and the state change. It authors
**no post-commitment narration**, and it authors a character reaction for exactly one decision (the
closure characterization, where Fadl, Maha and Rami each act differently per pathway). So:

- the **state change is not restated** in the scene — `state_change_source` has one accepted value,
  because there is one authority: the decision option's own typed `effects`;
- a **null `narrative_response` requires both `derived_from` and `unresolved`** — otherwise "canon
  authors no prose here" and "nobody wrote the response beat" are the same document.

**Additive.** `staging` and `immediate_effect` are optional, the unstaged fixture and all four R3
candidates still validate, and a consumer on `v0.4.1` is unaffected until it adopts them.

⚠️ **Deliberately unresolved:** `immediate_effect.responses` is keyed by `option_id`, so a
discovery-only scene — one whose `choice_or_discovery` is prose rather than a decision reference —
cannot be represented. All four Chapter 1 scenes carry decisions, so nothing is blocked. A discovery
shape is not invented here; EVS-4 is where discovery actions get defined.

### Two defects in the generated types, found by regenerating

Neither is EVS-1's subject; both shipped in `types/index.d.ts` from `v0.1.0` and were invisible
because **nothing imports that file yet.**

| | |
|---|---|
| `"a" \| "b"[]` | TypeScript binds `[]` tighter than `\|`, so this reads as `"a" \| ("b"[])`. Five properties had it; EVS-1 added three more, which is what made it worth fixing rather than propagating |
| `in-review?: …` | A hyphen is not an identifier. **The file did not parse at all** |

A generator that emits nonsense still exits 0, so `rules/types-generation.test.js` asserts the
emitted text rather than the generator's exit code.

## v0.4.1 — `emotional_state` on a scene · V9

**19 August 2026.** Additive, optional.

A scene may declare the emotional register that drives how it opens. **Two findings are encoded in
the shape rather than left to the reader:**

1. **Canon assigns the arc per CHAPTER, not per scene.** Chapter 1's is one line —
   *wonder → professional belonging → concentrated fear → first unease*. Distributing it across four
   scenes is a **derivation**, so `derivedFrom` is required and carries the canon term verbatim. The
   interpretation stays visible instead of being inherited as canon.
2. **The vocabularies do not align.** `art-direction-and-asset-model.md` § 2 defines seven registers
   with visual meanings; canon's *"concentrated fear"* is not among them. The enum is the art
   model's, because **a state with no defined register cannot drive anything**.

> § 2 also says *"ten emotional states"* and tabulates **seven**. The three unlisted ones are not
> enum members — a member with no register is a state nothing can render.

`unresolved` lets a scene say canon is silent, rather than inventing a register to fill the gap.

## v0.4.0 — the outcome contracts · R4 Phase B

**19 August 2026.** Additive: nine schemas, no existing content invalidated.

| | |
|---|---|
| `observation-record` | ★ **The six boundaries, in the schema** |
| `consequence`, `traceback` | The deferred mechanic's wire form |
| `reflection` | The participant's own words |
| `result-*` × 4 | **Four separate payloads**, never combined |
| `flag` | Separate from results, and never about a person |

### ★ Boundaries 2 and 3 are enforced by ABSENCE

There is no `reviewState`, `approvedBy`, `completeness`, `evidenceStatus`, `capabilityCredit`,
`recognition` or flag property anywhere in the observation record, and
`additionalProperties: false`. So a record carrying one is **unrepresentable, not merely refused**.

> That is stronger than a rule. A rule can be forgotten at the call site; a shape with no room for
> the mistake cannot be. Canon prohibits a formal artifact before Chapter 4, and until now that
> prohibition lived in prose, in a `check-plan.sh` grep, and in a comment — all three of which can be
> walked past.

**An absence nobody asserts is an absence somebody adds**, so each one is named in a test. Widening
the schema is a failing test, not a quiet edit.

### The other refusals worth naming

- `player_could_have_known: true` **without** `foreshadowed_at` — telling a professional they should
  have seen something never shown is a trick, not a lesson
- A consequence with **one** account. Operational alone is felt by nobody; emotional alone has no cost
- A result payload naming **more than one subject** — that is a combined view, and one query-string
  change from a league table
- A flag whose `kind` is about a person. Every member is about the content

## v0.3.1 — `tool_id` reconciled as context, not identity

**17 August 2026.** Patch: additive optional field.

`v0.3.0` omitted `tool_id` from `capability_block_ref` because a tool-scoped identity breaks shared
credit. **Two specifications put it inside the ref** — `R3 B7` and
`scene-and-quest-schema.md` § 6a — so omitting it left the contract disagreeing with the plan.

> **Both readings are right about different things.** A surface needs to know **which tool to open**;
> credit must attach to **the block**. So the field exists and is **excluded from identity**:
> `required` stays `{block_id, block_version, catalogue_version}`, and anything comparing or
> deduplicating refs ignores `tool_id`.

## v0.3.0 — the scene and decision contracts · R3 Phase B

**17 August 2026.** Additive: no existing content becomes invalid, so a **minor** bump.

> ⚠️ **`R3-tasks.md` says "tag `v0.4.0`".** It was written assuming R2's identity contract would ship
> first as `v0.3.0`. **R2 Phase B has not started**, and minting `v0.4.0` would leave a gap implying
> an identity contract that does not exist. `VERSIONING.md` is semantic, not release-coupled — so
> this is `v0.3.0`, and R2's contract takes the next number when it lands.

| Added | |
|---|---|
| `schemas/story/scene.schema.json` | **Adopted** from the R3 candidate draft at sha256 `fb177ccb…`. That folder is now **input, not authority** |
| `schemas/story/decision.schema.json` | Derived from the four validated candidate decisions |
| `capability_block_ref` | `{block_id, block_version, catalogue_version}` — **the one definition** |

**Two findings, both surfaced rather than quietly resolved:**

1. ★ **`capability_block_ref` must NOT carry `tool_id`**, though `R3 B7` proposed it. A capability
   block is deliberately **shared across tools** — binding the ref to one tool gives the same block
   two identities, and a facility doing one piece of work is credited twice or not at all.
2. **Two fields are richer than their names suggest**, and an earlier draft of this release would
   have flattened both to booleans: `requires_authority` is **which roles** may decide, and
   `deliberately_asymmetric` is **the reason** an asymmetry is deliberate. A boolean records that
   somebody noticed; a sentence records what they concluded.

**Every correction is proven by refusal *and* by permitting the corrected form** — a schema that
rejects everything passes a rejection test perfectly. A ch-01 scene claiming a transfer artifact is
**unloadable**, which is stronger than the prose and the grep that missed it once already.

`v0.2.2` remains valid for consumers not adopting story content.

## v0.2.2 — the adaptation rule becomes fireable

**16 August 2026.** `DEC-025`.

`adaptedAuthorityClass()` answered the question for a **local** adaptation of another catalogue tool,
identified by `parent` (toolId + version). Every **ingested** batch is an adaptation of an external
source document, and there was no field in which to say so — so
`adaptation_may_not_claim_parent_authority`, which reads `parent_tool_id is null or …`, exempted
exactly the content it was written for.

**The constraint was not unfired. It was unfireable**, because the fact it keys on had nowhere to
live. Batch B1 shipped `authorityClass: A` on adaptations of material whose own rights page says
adaptations are *"not endorsed by PAHO"*, and nothing could object.

| Added | |
|---|---|
| `adaptedFrom` on `tool.schema.json` | `sourceDocument`, `issuingBody`, `sourceAuthorityClass` |
| `canClaimAuthorityClass(tool)` | Reads **both** `parent` and `adaptedFrom`; the **stronger** source governs, so authority cannot be laundered by citing a trivial second source |
| Refusal **broadened, not duplicated** | `local-adaptation-may-not-claim-parent-authority` → `adaptation-may-not-claim-source-authority`. Nothing emitted the old id; two refusals for one rule is the mistake this release exists to avoid |

Additive and backward-compatible. Consumers on `v0.2.1` are unaffected until they adopt it.

