#!/usr/bin/env node
/**
 * Generates TypeScript types from the JSON Schemas.
 *
 * JSON Schema is the SOURCE OF TRUTH. Types are derived from it — never hand-written, and never
 * defined a second time in a validation library.
 *
 * Defining a shape twice is the same defect as writing a rule twice, one layer down: the two
 * definitions drift, both look correct, and the disagreement surfaces at runtime.
 *
 * Deliberately dependency-free so `contracts` installs nothing. The schemas are small and the
 * subset of JSON Schema in use is narrow; when that stops being true, swap in
 * json-schema-to-typescript and delete this file.
 */

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, basename } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (e.endsWith('.schema.json')) out.push(p);
  }
  return out;
}

const pascal = (s) => s.replace(/(^|[-_.])(\w)/g, (_, __, c) => c.toUpperCase()).replace(/\W/g, '');

function typeOf(schema, defs, indent = '  ') {
  if (schema.$ref) {
    const name = schema.$ref.split('/').pop();
    return defs.has(name) ? pascal(name) : 'unknown';
  }
  if (schema.const !== undefined) return JSON.stringify(schema.const);
  if (schema.enum) return schema.enum.map((v) => JSON.stringify(v)).join(' | ');

  const t = Array.isArray(schema.type) ? schema.type : [schema.type];
  const parts = [];
  for (const one of t) {
    if (one === 'string') parts.push('string');
    else if (one === 'number' || one === 'integer') parts.push('number');
    else if (one === 'boolean') parts.push('boolean');
    else if (one === 'null') parts.push('null');
    else if (one === 'array') parts.push(`${typeOf(schema.items ?? {}, defs, indent)}[]`);
    else if (one === 'object') parts.push(objectOf(schema, defs, indent));
    else parts.push('unknown');
  }
  return parts.length ? parts.join(' | ') : 'unknown';
}

function objectOf(schema, defs, indent) {
  if (!schema.properties) return 'Record<string, unknown>';
  const req = new Set(schema.required ?? []);
  const inner = indent + '  ';
  const lines = Object.entries(schema.properties).map(([key, prop]) => {
    const doc = prop.description ? `${inner}/** ${prop.description.replace(/\s+/g, ' ')} */\n` : '';
    return `${doc}${inner}${key}${req.has(key) ? '' : '?'}: ${typeOf(prop, defs, inner)};`;
  });
  return `{\n${lines.join('\n')}\n${indent}}`;
}

const files = walk(join(root, 'schemas'));
let out = `/* GENERATED from schemas/**. Do not edit by hand — run \`npm run types\`.
 *
 * JSON Schema is the source of truth. These types are derived from it.
 * Defining a shape a second time (in Zod, in an interface, anywhere) reintroduces the
 * drift this generation exists to prevent.
 */\n\n`;

for (const file of files) {
  const schema = JSON.parse(readFileSync(file, 'utf8'));
  const defs = new Map(Object.entries(schema.$defs ?? {}));
  const name = pascal(basename(file).replace('.schema.json', ''));

  for (const [defName, defSchema] of defs) {
    if (defSchema.description) out += `/** ${defSchema.description.replace(/\s+/g, ' ')} */\n`;
    out += `export type ${pascal(defName)} = ${typeOf(defSchema, defs)};\n\n`;
  }
  if (schema.description) out += `/** ${schema.description.replace(/\s+/g, ' ')} */\n`;
  out += `export type ${name} = ${typeOf(schema, defs)};\n\n`;
}

// The refusal registry becomes a union — so a consumer cannot invent a refusal identifier.
const registry = JSON.parse(readFileSync(join(root, 'refusals/registry.json'), 'utf8'));
out += `/** Every refusal identifier in the ecosystem. A refusal not in this union does not exist. */\n`;
out += `export type RefusalId =\n${registry.refusals.map((r) => `  | ${JSON.stringify(r.id)}`).join('\n')};\n\n`;
out += `export interface Refusal {\n  refusal: RefusalId;\n  message: string;\n  detail?: Record<string, unknown>;\n}\n`;

mkdirSync(join(root, 'types'), { recursive: true });
writeFileSync(join(root, 'types/index.d.ts'), out);
console.log(`generated types/index.d.ts from ${files.length} schema(s) and ${registry.refusals.length} refusals`);
