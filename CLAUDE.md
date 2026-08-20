# `contracts` — status

**Last updated:** 2026-08-20 · **Latest tag:** `v0.6.0`
**Topology:** [`../CLAUDE.md`](../CLAUDE.md) — read before proposing any port, path or hostname.

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
`v0.2.2` `adaptedFrom` (`DEC-025`) · **`v0.3.0` scene + decision contracts, R3 Phase B**.

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
