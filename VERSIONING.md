# Versioning

**`contracts` is the interface between five repositories. How it versions is the difference between
five repositories that work together and five that occasionally do.**

---

## The one rule that matters

> **Pin an exact tag. Never a branch.**
>
> `contracts#v0.3.1` ✅ · `contracts#main` ❌

A branch dependency means the contract changes **without any consumer committing anything.** That is
version skew with the safety removed: everything compiles, nothing works, and the error appears at
runtime in a third place.

**CI fails on it** in every repository. The check is five lines and it is the single most valuable
thing in the pipeline.

---

## Scheme

| Object | Scheme | A breaking change means |
|---|---|---|
| Each service's API | Semantic, independent | A consumer must change |
| Content schemas | Semantic | Existing content becomes invalid |
| The package as a whole | Semantic — the maximum of the above | |

**Note what is absent:** there is no rules-module version here. `citadel`'s rules live in `citadel`,
whose browser and server share a repository — publishing a rule no other service consumes costs a
tag-and-pin cycle per change and buys nothing (`DEC-009`). A rule genuinely shared *between services*
would belong here; none currently is.

---

## Breaking changes

1. It is a **major** version.
2. It carries a written migration note **naming every consumer**.
3. The previous major stays published for an agreed overlap.
4. Consumers migrate on their own schedule within that overlap.

**Design for additive**, so this is rare:

- New fields are **optional**
- New endpoints, never changed ones
- **Consumers must tolerate unknown enum members rather than failing** — a new classification or
  hazard family must not break a consumer that has not been redeployed

---

## Release order

```
1  contracts     publish, tagged
2  the provider  implement
3  the consumers adopt
```

**`contracts` releases before the service implementing the change.** A service cannot depend on an
unpublished contract, and a consumer expecting an endpoint that does not exist fails at runtime in
production, in the least obvious place.

---

## Publication

A **git tag dependency** to start — no registry, no auth, no publish step:

```json
{ "dependencies": { "@citadel/contracts": "git+https://github.com/soroura1/contracts.git#v0.3.0" } }
```

Moving to a private package registry later is a one-line change per consumer. **An untagged branch
dependency is not acceptable at any stage** — `check-repo.sh` refuses one.

> ⚠️ This example previously read `git+file://../contracts#v0.1.0`, which is wrong twice: npm reads
> `file://../x` as the absolute path `/x`, and `check-repo.sh` refuses a `file:` spec once a repo has
> a remote. A local path is valid **only** before a remote exists.

---

## The conformance suite travels with the version

Every published version carries the suite that defines what conformance to *that* version means. A
service claiming to implement `v0.3.0` runs `v0.3.0`'s suite — not the newest one.

This is what lets a consumer develop against a test double and be confident the real service behaves
identically: **both are tested against the same suite.**

---

## Changelog

### v0.1.0 — R0 walking skeleton

**Added**

- `schemas/catalogue/item.schema.json` — one catalogue item, with provenance, authority class,
  classification and capability-block reference
- `openapi/checklist-api.yaml` — `GET /catalogue/{version}/items/{id}`, `/version`, `/health`
- `refusals/registry.json` — 21 refusals, each with a service, meaning, status and locale key
- `conformance/` — a suite runnable against any base URL, asserting presences **and absences**

**Absences asserted from the first version**, because they are easy to add now and nearly impossible
to add once something depends on them:

- No comparative or cross-facility endpoint exists
- No sort parameter is honoured on a comparative field
- Every authenticated route answers **401, never 404**
- Every refusal is named and registered
