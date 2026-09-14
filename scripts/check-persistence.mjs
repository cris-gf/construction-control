import { initializeApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  getDocs,
  collection,
} from "firebase/firestore";
import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import assert from "node:assert/strict";
const app = initializeApp({
  apiKey: "demo-key",
  projectId: "demo-construction",
});
const auth = getAuth(app),
  db = getFirestore(app);
connectAuthEmulator(auth, "http://emulators:9099", { disableWarnings: true });
connectFirestoreEmulator(db, "emulators", 8080);
await signInWithEmailAndPassword(auth, "demo@obra.local", "ObraDemo2026!");
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
