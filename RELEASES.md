# Releases — `contracts`

**This file owns this repository's release numbering.** A number is never reused and never
renumbered. The prior build attempt had two different releases both numbered R5, with colliding task
numbers, because no single file owned the sequence.

| Release | Status | Tag | Closed | Notes |
|---|---|---|---|---|
| **R0** | 🚧 in progress | — | — | Walking skeleton. Tasks: `citadel-planning/06-releases/R0-tasks.md` |

## Rules

1. A release is **closed or reopened, never left ambiguous.**
2. A release is done when its **walk** completes in the deployed environment, performed by someone
   who did not build it.
3. Cutting a tag does not deploy it. See [CONTRIBUTING.md](CONTRIBUTING.md) § *The deploy gate*.

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

