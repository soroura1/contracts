#!/usr/bin/env node
/**
 * A contract-conformant TEST DOUBLE — R1 F3.
 *
 * ============================================================================
 * THIS IS WHAT MAKES FIVE SEPARATE REPOSITORIES SAFE.
 * ============================================================================
 *
 * A consumer develops against this double and is confident the real service
 * behaves identically — because BOTH are tested against the SAME conformance
 * suite. The contract is the shared truth, not a shared database.
 *
 * It deliberately implements only what the contract promises. If a consumer
 * needs behaviour this double does not have, that behaviour is either not in the
 * contract (so the consumer is depending on an implementation detail) or the
 * contract is incomplete. Both are worth discovering here rather than at
 * integration.
 */
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createHash } from 'node:crypto';

const here = dirname(fileURLToPath(import.meta.url));
const registry = JSON.parse(readFileSync(join(here, '../../refusals/registry.json'), 'utf8'));
const R = new Map(registry.refusals.map((r) => [r.id, r]));
const port = Number(process.env.DOUBLE_PORT ?? 8181);

const send = (res, code, body) => {
  res.writeHead(code, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
};
const refuse = (res, id) => send(res, R.get(id).http, { refusal: id, message: R.get(id).meaning });

const KNOWN = [
  /^\/catalogue\/[^/]+\/items\/[^/]+$/,
  /^\/catalogue\/[^/]+\/tools$/,
  /^\/catalogue\/[^/]+\/tools\/[^/]+$/,
  /^\/catalogue\/[^/]+\/bundle$/,
  /^\/manifest$/,
];

createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  const p = url.pathname;

  if (p === '/version') return send(res, 200, { commit: 'double', service: 'checklist-api', startedAt: new Date().toISOString() });
  if (p === '/health') return send(res, 200, { status: 'ok' });

  // 401-never-404 for KNOWN routes; 404 for unknown. That distinction is what
  // makes a 401 prove the route deployed.
  if (KNOWN.some((re) => re.test(p))) {
    if (!req.headers.authorization) return refuse(res, 'session-invalid');
    if (p === '/manifest') {
      return send(res, 200, {
        generatedAt: new Date().toISOString(),
        unclassified: [], awaitingSpecialistReview: [], unconfirmedReproduction: [],
        insufficientProvenance: [], expired: [], expiringSoon: [], orphanLocalVersions: [], untranslated: {},
      });
    }
    if (p.endsWith('/bundle')) {
      const tools = [];
      return send(res, 200, {
        catalogueVersion: '1.0.0', generatedAt: new Date().toISOString(),
        checksum: createHash('sha256').update(JSON.stringify(tools)).digest('hex'),
        tools, withdrawalList: [],
      });
    }
    if (p.endsWith('/tools')) return send(res, 200, { tools: [], catalogueVersion: '1.0.0', nextCursor: null });
    return send(res, 404, { refusal: 'session-invalid', message: 'Not found at this catalogue version.' });
  }

  // No comparative endpoint. No sort honoured. ABSENT, not permission-gated.
  send(res, 404, { refusal: 'session-invalid', message: 'No such route.' });
}).listen(port, () => console.log(`conformant double on http://localhost:${port}`));
