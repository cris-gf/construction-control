// @vitest-environment node
import { beforeAll, afterAll, it, expect } from "vitest";
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { readFileSync } from "node:fs";
let env: RulesTestEnvironment;
const pid = "11111111-1111-4111-8111-111111111111";
const project = {
  id: pid,
  projectId: pid,
  createdAt: 1,
  updatedAt: 1,
  version: 1,
  deleted: false,
  name: "Obra A",
  description: "",
  location: "",
  budgetCents: 10000,
  startDate: "2026-09-11",
  endDate: "",
  status: "activa",
};
beforeAll(async () => {
  const [host, port] = (
    process.env.FIRESTORE_EMULATOR_HOST || "localhost:8080"
  ).split(":");
  env = await initializeTestEnvironment({
    projectId: "demo-rules",
    firestore: {
      host,
      port: Number(port),
      rules: readFileSync("firestore.rules", "utf8"),
    },
  });
  await env.clearFirestore();
}, 30000);
afterAll(async () => env?.cleanup());
it("propietario crea, consulta, lista, actualiza y elimina", async () => {
  const db = env.authenticatedContext("alice").firestore(),
    r = doc(db, `users/alice/projects/${pid}`);
  await assertSucceeds(setDoc(r, project));
  await assertSucceeds(getDoc(r));
  await assertSucceeds(getDocs(collection(db, "users/alice/projects")));
  await assertSucceeds(updateDoc(r, { name: "Nueva", version: 2 }));
  await assertSucceeds(deleteDoc(r));
});
it("A no puede leer, listar, crear, modificar ni borrar ramas de B", async () => {
  const a = env.authenticatedContext("alice").firestore();
  for (const kind of [
    "projects",
    "purchases",
    "pendingItems",
    "workers",
    "laborPayments",
    "suppliers",
    "materials",
  ]) {
    const path =
      kind === "projects"
        ? `users/bob/projects/${pid}`
        : `users/bob/projects/${pid}/${kind}/record`;
    await env.withSecurityRulesDisabled(async (ctx) =>
      setDoc(doc(ctx.firestore(), path), project),
    );
    const r = doc(a, path);
    await assertFails(getDoc(r));
    await assertFails(
      getDocs(collection(a, path.slice(0, path.lastIndexOf("/")))),
    );
    await assertFails(setDoc(doc(a, path + "-new"), project));
    await assertFails(updateDoc(r, { version: 2, name: "Ataque" }));
    await assertFails(deleteDoc(r));
  }
});
it("sin autenticación todo acceso privado se rechaza", async () => {
  const db = env.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(db, `users/bob/projects/${pid}`)));
  await assertFails(getDocs(collection(db, "users/bob/projects")));
  await assertFails(setDoc(doc(db, `users/bob/projects/${pid}`), project));
  await assertFails(deleteDoc(doc(db, `users/bob/projects/${pid}`)));
});
it("rechaza uid manipulado, projectId incorrecto y versiones obsoletas", async () => {
  const db = env.authenticatedContext("alice").firestore(),
    r = doc(db, `users/alice/projects/${pid}`);
  await assertFails(setDoc(r, { ...project, uid: "bob" }));
  await assertFails(setDoc(r, { ...project, projectId: "otro" }));
  await assertSucceeds(setDoc(r, project));
  await assertFails(updateDoc(r, { name: "viejo", version: 1 }));
  await assertFails(setDoc(doc(db, "users/alice/unknown/x"), project));
  expect((await getDoc(r)).data()?.name).toBe("Obra A");
});
it("montos, identificadores y abonos inválidos se rechazan", async () => {
  const db = env.authenticatedContext("alice").firestore(),
    id = "22222222-2222-4222-8222-222222222222",
    r = doc(db, `users/alice/projects/${pid}/purchases/${id}`);
  const p = {
    ...project,
    id,
    material: "Cemento",
    category: "",
    quantity: "35",
    unit: "saco",
    unitPriceCents: 7199,
    paidCents: 251965,
    supplier: "A",
    date: "2026-09-11T10:00",
    paymentMethod: "",
    reference: "",
    notes: "",
    pendingItemId: "",
  };
  await assertSucceeds(setDoc(r, p));
  await assertFails(updateDoc(r, { unitPriceCents: -1, version: 2 }));
  await assertFails(updateDoc(r, { paidCents: 251966, version: 2 }));
  await assertFails(updateDoc(r, { id: "otro", version: 2 }));
});
