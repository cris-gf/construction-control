import { initializeApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  doc,
  writeBatch,
} from "firebase/firestore";
const app = initializeApp({
  apiKey: "demo-key",
  projectId: "demo-construction",
});
const auth = getAuth(app),
  db = getFirestore(app);
connectAuthEmulator(auth, "http://emulators:9099", { disableWarnings: true });
connectFirestoreEmulator(db, "emulators", 8080);
const email = "demo@obra.local",
  password = "ObraDemo2026!";
try {
  await createUserWithEmailAndPassword(auth, email, password);
} catch (error) {
  if (error.code !== "auth/email-already-in-use") throw error;
  await signInWithEmailAndPassword(auth, email, password);
}
const uid = auth.currentUser.uid,
  pid = crypto.randomUUID(),
  now = Date.now();
const base = () => ({
  id: crypto.randomUUID(),
  projectId: pid,
  createdAt: now,
  updatedAt: now,
  version: 1,
  deleted: false,
});
const batch = writeBatch(db);
const put = (kind, value) =>
  batch.set(
    doc(db, "users", uid, "projects", pid, ...(kind ? [kind, value.id] : [])),
    value,
  );
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
await batch.commit();
console.log(
  "Demostración local creada. Correo: demo@obra.local / Contraseña: ObraDemo2026!",
);
process.exit(0);
