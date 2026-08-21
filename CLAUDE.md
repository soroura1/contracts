# `contracts` — status

**Last updated:** 2026-08-21 · **Latest tag:** `v0.8.0`
**Topology:** [`../CLAUDE.md`](../CLAUDE.md) — read before proposing any port, path or hostname.

## ★ SG-1 `v0.8.0` — an option can now COST something, and an instrument can be silent

`DEC-031`. Additive; every `v0.7.x` scene and decision still validates, and a test asserts it.

| New | What it makes expressible |
|---|---|
| `option.commits` | A named capability moving to `committed` or `consumed`. **No amount, no remaining, no count** — refused by the schema and tested |
| `option.transfers_pressure_to` | Where the pressure went. Chapter 1 never removes pressure; it moves it |
| `option.residue` | What is still true afterwards, **per pathway**, each entry binding to a location, route, instrument, person or capability |
| `evidence[].reading` | An instrument reading with a state — `known`, `uncertain`, `conflicting`, `unavailable`, `changed` — and a chronology **mark**, never a timestamp |
| `capability.schema.json` | A capability as a **named holder in a named state**, whose `how_known` must name an instrument |
| `instrument.schema.json` | The physical object, what it may be compared with, and ⛔ **what it must never imply** — required and non-empty |
| `scene.character_beats` | Speech, action, refusal, qualification and **independent action**, which is canon's fail-forward rule with a trigger |
| `world_response` | Environment → instrument → holder → person. All four keys required, each nullable |

> ★ **`unavailable` is a state, not an error, and that distinction is the chapter.** The Measure's
> weight room holds one weight per **declared** dependency and *"shows nothing at all when a
> dependency was never declared."* Chapter 1's hidden board was never declared, so the instrument
> that would have caught it is accurate and silent. An engine that models silence as failure cannot
> express it.

> ⚠️ **A residue that binds to nothing was the real defect.** `scene.residue` is one sentence, so
> three pathways with three different aftermaths shared one description of what was left behind —
> the same shape as three options sharing one consequence, and why the world did not appear to
> answer. `binds_to` is what lets a consequence survive a return to the hub and a resume.

## ★ The scene contract now says WHEN, not only WHAT — `v0.5.0`, EVS-1

`staging` maps each authored movement to one of four phases (`pre_commit`, `interactive`,
`post_commit`, `scene_exit`), and `turn` and `residue` are **absent from the pre-commit enum**. That
absence is `FPE-01`: the interface may not spoil its own drama.

> **Why it did not exist before.** The six movements are source material, and the schema treated them
> as a display list. So the renderer emitted all six as one `<ol>` — and **no rule could object,
> because there was no field to key on.** The usual failure here is a rule that cannot fire; this was
> a rule that could not be written.

⚠️ **The cross-field rules are NOT here.** Each of the six movements staged exactly once, and
`responses` covering every option of the scene's decision, live in `citadel/src/engine/staging.js`.
`VERSIONING.md`: a rule no other service consumes costs a tag-and-pin cycle per change and buys
nothing (`DEC-009`). Only `citadel` loads scenes.

## What this is

The **only** shared definition. Schemas, lifecycle rules, the refusal registry, and the conformance
suite. It is a **library — it publishes a tag and deploys nothing.**

## The rules that live here, and why they are here

| Rule | Why it is shared, not local |
|---|---|
| `canTransition`, `canEdit`, `canApprove`, `canExecute`, `canPublish` | Both consumers must **predict** them to render honestly. A rule implemented twice diverges, and both copies look correct |
| `adaptedAuthorityClass`, `canClaimAuthorityClass` | Adapting class A or B guidance yields **C** |
| `offlineAvailability` | Risk-tiered expiry, `E14` |

★ **`canApprove` checks the EDITOR LIST, not merely the recorded author.** An author who hands a
draft to a colleague to "fix the wording" has not created an independent reviewer.

⚠️ **An empty editor list makes it vacuous** — it returns `ok` for anyone. Found on 16 Aug in batch
B1. When you write a rule, ask **what makes it fire, and whether that thing is ever present.**

## Traps this repo has already hit

- **Consumers must pin an exact tag, never a branch.** `check-repo.sh` enforces it; a probe PR
  pinning `#main` was refused. Version skew fails silently at runtime, in a third place.
- **Two shapes with one name is worse than either.** A draft once invented a second four-field
  identity contract alongside the live one. The conformance suite says **"every issuer emits"**, not
  "an adapter emits".
- **Broaden a refusal; never duplicate it.** `local-adaptation-may-not-claim-parent-authority`
  became `adaptation-may-not-claim-source-authority` rather than gaining a sibling.
- **An unregistered refusal is an untranslatable string** a consumer cannot render.

## Releases

`v0.1.0` R0 · `v0.2.0` R1 lifecycle + governance · `v0.2.1` conformance double + self-runner ·
`v0.2.2` `adaptedFrom` (`DEC-025`) · `v0.3.0`–`v0.3.1` scene + decision contracts, R3 Phase B ·
`v0.4.0` outcome contracts · `v0.4.1` `emotional_state` · `v0.5.0` staging + immediate effect ·
`v0.5.1` `bell` · `v0.6.0` actions + evidence · **`v0.7.0` the asset slot becomes a declaration**.

⚠️ **`v0.7.0` is BREAKING** — `asset_slots` went from strings to objects. `RELEASES.md` carries the
migration note; `citadel` is the only consumer and migrated in the same wave.

⚠️ **`R3-tasks.md` says `v0.4.0`.** It assumed R2's identity contract would ship first as `v0.3.0`.
**R2 Phase B has not started**, and versioning here is **semantic, not release-coupled** — so the
scene contracts took `v0.3.0` and R2's `IssuerAssertion` takes the next number when it lands.

## Story contracts — `schemas/story/`

`scene.schema.json` was **adopted** from `citadel-planning/10-content-candidates/` at a recorded
checksum. **That folder is now input, not authority.**

★ **`capability_block_ref` = `{block_id, block_version, catalogue_version}` — no `tool_id`.**
`R3 B7` proposed one; a block is deliberately **shared across tools**, so a tool-scoped ref gives one
block two identities and breaks shared credit. Asserted in `rules/story-schema.test.js`.

★ **A Chapter 1 scene claiming a transfer artifact is UNLOADABLE** — the canon prohibition is in the
schema, not in prose and not in a grep. A grep missed it once already.

```bash
export PATH="/opt/homebrew/opt/node@26/bin:$PATH"
npm test && ./check-repo.sh
```
