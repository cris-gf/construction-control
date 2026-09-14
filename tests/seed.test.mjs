import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { seedConfig } from "../scripts/seed-config.mjs";
const credentials = () => ({
  SEED_EMAIL: `${randomUUID()}@test.local`,
  SEED_PASSWORD: randomUUID(),
});
test("requires private credentials without fallback", () => {
  assert.throws(() => seedConfig({}), /SEED_EMAIL/);
  assert.throws(
    () => seedConfig({ ...credentials(), SEED_PASSWORD: "" }),
    /SEED_PASSWORD/,
  );
});
test("rejects browser-exposed secrets", () => {
  assert.throws(
    () => seedConfig({ ...credentials(), VITE_SEED_PASSWORD: randomUUID() }),
    /VITE_/,
  );
});
test("local target stays isolated from real project configuration", () => {
  assert.equal(
    seedConfig({ ...credentials(), VITE_FIREBASE_PROJECT_ID: "real-project" })
      .firebase.projectId,
    "demo-construction",
  );
});
test("production requires real configuration", () => {
  assert.throws(() => seedConfig(credentials(), "production"), /VITE_FIREBASE/);
  assert.throws(
    () =>
      seedConfig(
        { ...credentials(), VITE_FIREBASE_API_KEY: "demo-key" },
        "production",
      ),
    /VITE_FIREBASE/,
  );
});
test("production preserves env credentials and ignores emulator host setting", () => {
  const env = {
    ...credentials(),
    VITE_FIREBASE_API_KEY: "public-api-key",
    VITE_FIREBASE_AUTH_DOMAIN: "project.firebaseapp.com",
    VITE_FIREBASE_PROJECT_ID: "project",
    VITE_FIREBASE_APP_ID: "public-app-id",
    VITE_USE_EMULATORS: "true",
  };
  const config = seedConfig(env, "production");
  assert.equal(config.target, "production");
  assert.equal(config.password, env.SEED_PASSWORD);
  assert.equal(config.firebase.projectId, "project");
});
test("rejects unknown target", () =>
  assert.throws(() => seedConfig(credentials(), "unknown"), /Destino/));
