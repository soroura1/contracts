# 0001 — JSON Schema is the source of truth for shapes

**Date:** 2026-08-15 · **Status:** active

## Context

Shapes are needed in three places: request/response validation on the server, type-checking in the
browser and server, and content validation at authoring time.

## Decision

**JSON Schema in `contracts` is the single source.** TypeScript types are *generated* from it, and
runtime validation reads the same schemas via Ajv. Fastify validates natively from JSON Schema, so
the contract *is* the validation.

## Reasoning

Defining a shape twice — once in JSON Schema for the contract, once in a validation library for the
runtime — is the same defect as writing a business rule twice, one layer down. The two drift, both
look correct, and the disagreement surfaces at runtime in a third place.

Choosing Fastify was substantially *because* of this: its native JSON Schema validation removes the
second definition rather than making it convenient.

## Consequences

- `npm run types` regenerates; generated output is committed so consumers need no build step.
- A shape change is a contract change, with the versioning discipline that implies.
- **Do not introduce Zod or an equivalent for shapes already in a schema.**

## Revisit if

The schema subset outgrows the hand-rolled generator — swap in `json-schema-to-typescript` and delete
`scripts/generate-types.js`. The decision does not change; only the tool does.
