import { z } from "zod";
export const money = (cents: number) =>
  `Q${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export function cents(value: string): number {
  if (!/^\d{1,10}(\.\d{1,2})?$/.test(value))
    throw new Error("Ingresa un monto positivo con hasta dos decimales.");
  const [whole, fraction = ""] = value.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}
// Cantidades en milésimas; redondeo half-up de la línea al centavo.
export function total(quantity: string, unitPriceCents: number): number {
  if (!/^\d{1,7}(\.\d{1,3})?$/.test(quantity))
    throw new Error("Cantidad inválida: máximo tres decimales.");
  const [whole, fraction = ""] = quantity.split(".");
  const q = BigInt(whole) * 1000n + BigInt(fraction.padEnd(3, "0"));
  const result = Number((q * BigInt(unitPriceCents) + 500n) / 1000n);
  if (!Number.isSafeInteger(result) || result > 99999999999)
    throw new Error("El total excede el límite de Q999,999,999.99.");
  return result;
}
const text = z.string().max(1000);
const short = z.string().max(160);
const amount = z.number().int().min(0).max(99999999999);
const date = z
  .string()
  .max(30)
  .refine(
    (v) =>
      !v ||
      (/^\d{4}-\d{2}-\d{2}(T([01]\d|2[0-3]):[0-5]\d)?$/.test(v) &&
        Number.isFinite(Date.parse(v.slice(0, 10) + "T12:00:00Z")) &&
        new Date(v.slice(0, 10) + "T12:00:00Z")
          .toISOString()
          .startsWith(v.slice(0, 10))),
    "Fecha inválida.",
  );
const base = {
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
  version: z.number().int().positive(),
  deleted: z.boolean().default(false),
};
export const projectSchema = z.object({
  ...base,
  name: short.min(1),
  description: text,
  location: short,
  budgetCents: amount,
  startDate: date,
  endDate: date,
  status: z.enum(["planificación", "activa", "pausada", "finalizada"]),
});
export const purchaseSchema = z
  .object({
    ...base,
    date: date.min(1),
    category: short,
    material: short.min(1),
    quantity: z.string().regex(/^\d{1,7}(\.\d{1,3})?$/),
    unit: short.min(1),
    unitPriceCents: amount,
    supplier: short,
    paidCents: amount,
    paymentMethod: short,
    reference: short,
    notes: text,
    pendingItemId: z.string().max(36).default(""),
  })
  .refine((p) => p.paidCents <= total(p.quantity, p.unitPriceCents), {
    message: "El abono no puede exceder el total.",
    path: ["paidCents"],
  });
export const pendingStates = [
  "solicitado",
  "pendiente de compra",
  "comprado",
  "en camino",
  "recibido",
  "completado",
  "cancelado",
] as const;
export const pendingSchema = z.object({
  ...base,
  type: z.enum(["comprar", "recibir", "solicitar", "pagar", "otro"]),
  material: short.min(1),
  quantity: z.string().regex(/^\d{1,7}(\.\d{1,3})?$/),
  unit: short,
  unitPriceCents: amount,
  supplier: short,
  dueDate: date,
  buyDate: date,
  receiveDate: date,
  priority: z.enum(["baja", "normal", "alta", "urgente"]),
  status: z.enum(pendingStates),
  notes: text,
  purchaseId: z.string().max(36).default(""),
});
export const workerSchema = z.object({
  ...base,
  name: short.min(1),
  role: short,
  phone: z.string().max(40),
  agreement: z.enum(["diario", "semanal", "por actividad", "otro"]),
  rateCents: amount,
  active: z.boolean(),
  notes: text,
});
export const laborSchema = z
  .object({
    ...base,
    workerId: z.string().uuid(),
    period: short,
    description: text,
    agreedCents: amount,
    paidCents: amount,
    date: date,
    paymentMethod: short,
    reference: short,
    notes: text,
  })
  .refine((p) => p.paidCents <= p.agreedCents, {
    message: "El abono no puede exceder lo acordado.",
    path: ["paidCents"],
  });
export const supplierSchema = z.object({
  ...base,
  name: short.min(1),
  phone: short,
  notes: text,
});
export const materialSchema = z.object({
  ...base,
  name: short.min(1),
  unit: short,
  category: short,
});
export interface UserProfile {
  id: string;
  email: string;
  createdAt: number;
  updatedAt: number;
}
export type Project = z.infer<typeof projectSchema>;
export type Purchase = z.infer<typeof purchaseSchema>;
export type PendingItem = z.infer<typeof pendingSchema>;
export type Worker = z.infer<typeof workerSchema>;
export type LaborPayment = z.infer<typeof laborSchema>;
export type Supplier = z.infer<typeof supplierSchema>;
export type Material = z.infer<typeof materialSchema>;
export const schemas = {
  projects: projectSchema,
  purchases: purchaseSchema,
  pendingItems: pendingSchema,
  workers: workerSchema,
  laborPayments: laborSchema,
  suppliers: supplierSchema,
  materials: materialSchema,
};
export type Kind = keyof typeof schemas;
export type RecordData =
  | Project
  | Purchase
  | PendingItem
  | Worker
  | LaborPayment
  | Supplier
  | Material;
export interface ProjectData {
  purchases: Purchase[];
  pendingItems: PendingItem[];
  workers: Worker[];
  laborPayments: LaborPayment[];
  suppliers: Supplier[];
  materials: Material[];
}
export const emptyData: ProjectData = {
  purchases: [],
  pendingItems: [],
  workers: [],
  laborPayments: [],
  suppliers: [],
  materials: [],
};
export const live = <T extends { deleted: boolean }>(records: T[]) =>
  records.filter((r) => !r.deleted);
export const paymentStatus = (paid: number, agreed: number) =>
  paid >= agreed ? "pagado" : paid > 0 ? "parcial" : "pendiente";
export const estimated = (p: PendingItem) =>
  p.purchaseId ||
  ["cancelado", "completado", "recibido", "comprado", "en camino"].includes(
    p.status,
  )
    ? 0
    : total(p.quantity, p.unitPriceCents);
export function summary(project: Project, data: ProjectData) {
  const purchases = live(data.purchases),
    labor = live(data.laborPayments);
  const purchasesPaid = purchases.reduce((s, p) => s + p.paidCents, 0);
  const laborPaid = labor.reduce((s, p) => s + p.paidCents, 0);
  const spent = purchasesPaid + laborPaid;
  const committed =
    purchases.reduce(
      (s, p) => s + total(p.quantity, p.unitPriceCents) - p.paidCents,
      0,
    ) +
    labor.reduce((s, p) => s + p.agreedCents - p.paidCents, 0) +
    live(data.pendingItems).reduce((s, p) => s + estimated(p), 0);
  return {
    purchasesPaid,
    laborPaid,
    spent,
    committed,
    available: project.budgetCents - spent - committed,
    percent: project.budgetCents ? (spent / project.budgetCents) * 100 : null,
  };
}
export const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Guatemala",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export const localNow = () =>
  `${today()}T${new Intl.DateTimeFormat("en-GB", { timeZone: "America/Guatemala", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date())}`;
export const dateLabel = (s: string) =>
  s
    ? new Intl.DateTimeFormat("es-GT", {
        timeZone: "America/Guatemala",
        dateStyle: "medium",
      }).format(
        new Date(s.length === 10 ? s + "T12:00:00-06:00" : s + "-06:00"),
      )
    : "Sin fecha";
export function compare(purchases: Purchase[], material: string, unit: string) {
  const rows = live(purchases)
    .filter(
      (p) =>
        p.material.trim().toLowerCase() === material.trim().toLowerCase() &&
        p.unit.trim().toLowerCase() === unit.trim().toLowerCase(),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  return {
    rows,
    lowest: rows.length ? Math.min(...rows.map((r) => r.unitPriceCents)) : null,
    latest: rows[0]?.unitPriceCents ?? null,
  };
}
export function fresh(projectId: string) {
  const id = crypto.randomUUID();
  return {
    id,
    projectId: projectId || id,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: 1,
    deleted: false,
  };
}
