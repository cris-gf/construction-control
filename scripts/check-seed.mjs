import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
// Ephemeral credentials override files; no real account is used in these checks.
const env = {
  ...process.env,
  SEED_ENV_FILE: "/tmp/nonexistent-seed-check.env",
  SEED_EMAIL: `${randomUUID()}@test.local`,
  SEED_PASSWORD: `T-${randomUUID()}!`,
};
function seed(overrides = {}) {
  return spawnSync(process.execPath, ["scripts/seed.mjs"], {
    env: { ...env, ...overrides },
    encoding: "utf8",
    timeout: 60000,
  });
}
function output(result) {
  assert.equal(result.status, 0, "Seed must complete successfully");
  return JSON.parse(result.stdout.trim().split("\n").at(-1));
}
const first = output(seed());
assert.equal(first.created, true);
assert.deepEqual(first.counts, {
  purchases: 4,
  workers: 1,
  laborPayments: 1,
  pendingItems: 1,
});
const second = output(seed());
assert.equal(second.created, false);
assert.deepEqual(second.counts, first.counts);
const wrongPassword = seed({ SEED_PASSWORD: randomUUID() });
assert.equal(wrongPassword.status, 1);
assert.match(wrongPassword.stderr, /Firebase: auth\//);
assert.equal(output(seed()).created, false);
console.log(
  "PASS: usuario creado, ocho documentos leídos del servidor, carga repetible y contraseña incorrecta rechazada.",
);
