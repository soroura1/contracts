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

