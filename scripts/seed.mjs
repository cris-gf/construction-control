import { createHash } from "node:crypto";
import {
  doc,
  runTransaction,
  getDocFromServer,
  getDocsFromServer,
  collection,
} from "firebase/firestore";
import { seedSession } from "./seed-session.mjs";
import { loadSeedConfig } from "./seed-config.mjs";

function demoProjectId(uid) {
  const hex = createHash("sha256")
    .update(`construction-demo-v1:${uid}`)
    .digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}
async function main() {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== "--production"))
    throw new Error("Argumento desconocido.");
  const config = loadSeedConfig(
    args.includes("--production") ? "production" : "emulator",
  );
  const { auth, db } = await seedSession(config, true);
  const uid = auth.currentUser.uid,
    pid = demoProjectId(uid),
    now = Date.now();
  const base = () => ({
    id: crypto.randomUUID(),
    projectId: pid,
    createdAt: now,
    updatedAt: now,
    version: 1,
    deleted: false,
  });
  const records = [];
  const put = (kind, value) => records.push({ kind, value });
  put("", {
    ...base(),
    id: pid,
    name: "Casa del bosque",
    description: "Ampliación y construcción de vivienda familiar",
    location: "Antigua Guatemala",
    budgetCents: 25000000,
    startDate: "2026-07-01",
    endDate: "2027-01-30",
    status: "activa",
  });
  for (const [material, quantity, unit, price, supplier, date] of [
    [
      "Cemento UGC",
      "35",
      "saco",
      7199,
      "Ferretería El Constructor",
      "2026-09-10T09:30",
    ],
    [
      "Arena de río",
      "6",
      "m³",
      27500,
      "Materiales del Valle",
      "2026-09-09T14:00",
    ],
    [
      "Varilla de hierro 3/8",
      "120",
      "unidad",
      4250,
      "Aceros de Guatemala",
      "2026-09-08T10:00",
    ],
    [
      "Cemento UGC",
      "50",
      "saco",
      7450,
      "Materiales del Valle",
      "2026-09-01T08:00",
    ],
  ])
    put("purchases", {
      ...base(),
      date,
      category: "Materiales",
      material,
      quantity,
      unit,
      unitPriceCents: price,
      supplier,
      paidCents: Number(quantity) * price,
      paymentMethod: "Transferencia",
      reference: "",
      notes: "Registro de demostración",
      pendingItemId: "",
    });
  const worker = {
    ...base(),
    name: "Carlos Méndez",
    role: "Maestro de obra",
    phone: "",
    agreement: "semanal",
    rateCents: 180000,
    active: true,
    notes: "",
  };
  put("workers", worker);
  put("laborPayments", {
    ...base(),
    workerId: worker.id,
    period: "Semana 10",
    description: "Cimentación y levantado de muros",
    agreedCents: 180000,
    paidCents: 100000,
    date: "2026-09-11",
    paymentMethod: "Transferencia",
    reference: "",
    notes: "",
  });
  put("pendingItems", {
    ...base(),
    type: "comprar",
    material: "Block de concreto 14 × 19 × 39",
    quantity: "500",
    unit: "unidad",
    unitPriceCents: 475,
    supplier: "Materiales del Valle",
    dueDate: "2026-09-12T10:00",
    buyDate: "2026-09-12T08:00",
    receiveDate: "2026-09-13T09:00",
    priority: "alta",
    status: "pendiente de compra",
    notes: "Coordinar descarga en la entrada.",
    purchaseId: "",
  });
  const projectRef = doc(db, "users", uid, "projects", pid);
  const created = await runTransaction(db, async (transaction) => {
    if ((await transaction.get(projectRef)).exists()) return false;
    for (const { kind, value } of records) {
      transaction.set(
        kind ? doc(projectRef, kind, value.id) : projectRef,
        value,
      );
    }
    return true;
  });
  if (!(await getDocFromServer(projectRef)).exists())
    throw new Error("No se pudo verificar la obra.");
  const counts = {};
  for (const kind of [
    "purchases",
    "workers",
    "laborPayments",
    "pendingItems",
  ]) {
    counts[kind] = (await getDocsFromServer(collection(projectRef, kind))).size;
  }
  console.log(
    JSON.stringify({
      target: config.target,
      project: config.firebase.projectId,
      created,
      counts,
    }),
  );
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    // Firebase errors can contain credentials in customData: never dump the object.
    console.error(error.code ? `Firebase: ${error.code}` : error.message);
    process.exit(1);
  });
