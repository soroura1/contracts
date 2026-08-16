#!/usr/bin/env node
/**
 * Self-conformance — the suite against the bundled double, with no target to provision.
 *
 * The suite runs in three places, and this wrapper is what makes two of them possible in CI:
 *
 *   contracts CI (here)        consumer CI                  checklist-api CI
 *   suite × double             suite × double               suite × the real service
 *          │                          │                            │
 *          └── proves the double ─────┴── the same suite ──────────┘
 *              honours the contract
 *
 * If the double drifts from the contract, THIS is where it fails — in the repository that owns
 * both, not in a consumer's build two integrations later.
 *
 * It starts the double on an ephemeral port, waits for /health, runs the suite against it, and
 * exits with the suite's exit code. No environment is required.
 */

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.DOUBLE_PORT ?? 8181);
const target = `http://localhost:${port}`;

const double = spawn(process.execPath, [join(here, 'double.js')], {
  env: { ...process.env, DOUBLE_PORT: String(port) },
  stdio: ['ignore', 'inherit', 'inherit'],
});

const stop = () => { if (double.exitCode === null) double.kill('SIGTERM'); };
process.on('exit', stop);

double.on('exit', (code) => {
  // The double exiting before the suite finishes is a failure, whatever the code says.
  if (!finished) {
    console.error(`double exited early (code ${code}) — conformance cannot run`);
    process.exit(1);
  }
});

let finished = false;

async function waitForHealth(deadlineMs = 10_000) {
  const until = Date.now() + deadlineMs;
  while (Date.now() < until) {
    try {
      const res = await fetch(`${target}/health`);
      if (res.ok) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  console.error(`double did not become healthy at ${target} within ${deadlineMs}ms`);
  process.exit(1);
}

await waitForHealth();

const suite = spawn(process.execPath, [join(here, 'run.js')], {
  env: { ...process.env, CONFORMANCE_TARGET: target },
  stdio: 'inherit',
});

suite.on('exit', (code) => {
  finished = true;
  stop();
  process.exit(code ?? 1);
});
