import { getDocs, collection } from "firebase/firestore";
import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import assert from "node:assert/strict";
import { loadSeedConfig } from "./seed-config.mjs";
import { seedSession } from "./seed-session.mjs";
const { auth, db } = await seedSession(loadSeedConfig());
const projects = await getDocs(
  collection(db, "users", auth.currentUser.uid, "projects"),
);
const snapshot = JSON.stringify({
  uid: auth.currentUser.uid,
  projects: projects.docs
    .map((d) => d.data())
    .sort((a, b) => a.id.localeCompare(b.id)),
});
assert(projects.size > 0);
if (process.argv.includes("--capture")) {
  mkdirSync("test-results", { recursive: true });
  writeFileSync("test-results/persistence-before.json", snapshot);
  console.log(
    `Captura: ${projects.size} obras, UID conservado para verificación.`,
  );
} else {
  assert.equal(
    snapshot,
    readFileSync("test-results/persistence-before.json", "utf8"),
  );
  console.log(
    `PASS: cuenta, UID y ${projects.size} obras idénticos después de docker compose down/up.`,
  );
}
process.exit(0);
