# `contracts` — status

**Last updated:** 2026-08-21 · ⛔ **RESET TO INFRASTRUCTURE. NOTHING IS DEFINED HERE.**
**Version:** `0.0.0` — deliberately. There is nothing to version.

---

## What happened

On **2026-08-21** the owner chose to start the product over. Every **definition** in this repository
was deleted: all fifteen JSON Schemas, the refusal registry, the OpenAPI document, the lifecycle
rules and their fixtures, the generated types, and the whole conformance suite.

What remains is the **machinery** — the package skeleton, the repository check, the pipeline, and
the type generator that derives TypeScript from JSON Schema so a shape is never defined twice.

---

## ★ The tags are why this was safe

**Every consumer pins a tag, and a tag is immutable.** Resetting `main` cannot reach any of them:

| Repository | Pins | Affected by this reset |
|---|---|---|
| **`checklist-api`** — ⚠️ **LIVE** at `api.endura-assess.com` | `v0.2.2` | **No** |
| `identity-enrolment` | `v0.2.1` | **No** |
| `checklist-app` | `v0.2.1` | **No** |
| `citadel` | `v0.8.0` | **No** |

This is the tag-and-pin discipline paying for itself: the live service kept working through a reset
that emptied the repository it depends on, and nobody had to coordinate anything.

⚠️ **So do not delete the tags.** `v0.1.0` … `v0.8.0` are the only thing standing between a reset
`main` and a broken production API.

---

## What is left

| Kept | Why |
|---|---|
| `package.json` at `0.0.0`, empty `exports` | The old exports map pointed at files that no longer exist |
| `check-repo.sh`, `.woodpecker.yml` | The pipeline |
| `scripts/generate-types.js` | ★ **Machinery worth keeping.** It walks `schemas/**` and derives the types, so when the first schema returns the derivation already exists and nobody hand-writes a type beside it |
| `VERSIONING.md`, `RELEASES.md`, `CONTRIBUTING.md`, `README.md`, `LICENSE`, `docs/` | Governance. `check-repo.sh` requires the scope statement in `README.md` verbatim |
| `test/smoke.test.js` | ⛔ **Scaffolding.** The pipeline runs `npm test` and a missing glob is a red pipeline |

**`test/smoke.test.js` asserts that `schemas/` does not exist**, so it **fails the day the first
schema lands** — which is the only honest way to stop a green suite over an empty repository from
sitting under real definitions pretending to cover them.

---

## Deleted, and what each was

| Gone | What it was |
|---|---|
| `schemas/story/**` | scene, decision, capability, instrument |
| `schemas/catalogue/**` | item, tool, capability-block, lifecycle |
| `schemas/outcome/**` | observation record, reflection, consequence, traceback, flag, four result shapes |
| `refusals/registry.json` | 27 refusals, each with a locale key |
| `openapi/checklist-api.yaml` | the service contract |
| `rules/**` | the lifecycle rules, their fixtures and every refusal test |
| `conformance/**` | the suite and its double |
| `types/index.d.ts` | generated, so it was never a source |

---

## The rules that survive, because they were not what went wrong

1. **A tag, never a branch.** A consumer pinning a branch means everything compiles, nothing works,
   and the error appears at runtime in a third place.
2. **JSON Schema is the source; types are derived.** Defining a shape twice is the same defect as
   writing a rule twice, one layer down.
3. **A rule needs a field to key on.** This repository shipped rules that were correct and could
   never fire — a manifest reading `slot.id` on a bare string, a REQUIRED-slot check reading a
   property off a string. Both were tested, on fixtures the content never produced.
4. **Prove a rule by making it refuse AND by making it permit.** A schema that rejects everything
   passes a rejection test perfectly.
5. **A shared rule costs a tag-and-pin cycle per change.** A rule only one service consumes belongs
   in that service.

---

## What comes next

Nothing, until the rebuild needs a shared shape. **A definition belongs here only when more than one
repository depends on it** — anything else is a local rule paying an inter-repository price.
