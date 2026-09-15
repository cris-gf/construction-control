import { describe, it, expect } from "vitest";
import {
  cents,
  total,
  summary,
  fresh,
  projectSchema,
  laborSchema,
  purchaseSchema,
  pendingSchema,
  emptyData,
  compare,
} from "../src/domain";
import { backup, parseBackup } from "../src/features/backup/serialization";
import { ics } from "../src/domain/calendar";
import { csv } from "../src/services/files";
const base = fresh("");
const project = projectSchema.parse({
  ...base,
  name: "Casa",
  description: "",
  location: "",
  budgetCents: 1000000,
  startDate: "2026-09-11",
  endDate: "",
  status: "activa",
});
const purchase = purchaseSchema.parse({
  ...fresh(project.id),
  date: "2026-09-11T10:00",
  category: "Material",
  material: "Cemento",
  quantity: "35",
  unit: "saco",
  unitPriceCents: 7199,
  supplier: "A",
  paidCents: 100000,
  paymentMethod: "",
  reference: "",
  notes: "",
});
const pending = pendingSchema.parse({
  ...fresh(project.id),
  type: "comprar",
  material: "Cemento",
  quantity: "35",
  unit: "saco",
  unitPriceCents: 7199,
  supplier: "A",
  dueDate: "",
  buyDate: "",
  receiveDate: "",
  priority: "normal",
  status: "pendiente de compra",
  notes: "",
});
describe("Dinero determinista", () => {
  it("35 sacos a Q71.99 = Q2,519.65", () =>
    expect(total("35", cents("71.99"))).toBe(251965));
  it("redondea fracciones al centavo", () =>
    expect(total("0.125", 100)).toBe(13));
  it("rechaza valores negativos y exceso de decimales", () => {
    expect(() => cents("-1")).toThrow();
    expect(() => cents("1.999")).toThrow();
    expect(() => total("2.1234", 100)).toThrow();
  });
  it("abonos no exceden el total", () =>
    expect(
      purchaseSchema.safeParse({ ...purchase, paidCents: 999999 }).success,
    ).toBe(false));
  it("saldo y gasto exactos después de editar y eliminar", () => {
    const d = { ...emptyData, purchases: [purchase] };
    expect(summary(project, d)).toMatchObject({
      spent: 100000,
      committed: 151965,
      available: 748035,
    });
    expect(
      summary(project, {
        ...d,
        purchases: [{ ...purchase, paidCents: 251965 }],
      }).committed,
    ).toBe(0);
    expect(
      summary(project, { ...d, purchases: [{ ...purchase, deleted: true }] })
        .spent,
    ).toBe(0);
  });
  it("conversión enlazada evita doble conteo", () => {
    expect(
      summary(project, { ...emptyData, pendingItems: [pending] }).committed,
    ).toBe(251965);
    const d = {
      ...emptyData,
      purchases: [purchase],
      pendingItems: [{ ...pending, purchaseId: purchase.id }],
    };
    expect(summary(project, d).committed).toBe(151965);
  });
  it("sin presupuesto no hay porcentaje y cancelados no comprometen", () => {
    expect(
      summary({ ...project, budgetCents: 0 }, emptyData).percent,
    ).toBeNull();
    expect(
      summary(project, {
        ...emptyData,
        pendingItems: [{ ...pending, status: "cancelado" }],
      }).committed,
    ).toBe(0);
  });
  it("solo compara unidades compatibles", () => {
    const result = compare(
      [
        purchase,
        {
          ...purchase,
          id: crypto.randomUUID(),
          unit: "libra",
          unitPriceCents: 1,
        },
        { ...purchase, id: crypto.randomUUID(), unitPriceCents: 6500 },
      ],
      "Cemento",
      "saco",
    );
    expect(result.lowest).toBe(6500);
    expect(result.rows).toHaveLength(2);
  });
});
describe("Respaldo y calendario", () => {
  it("exporta JSON versionado y descarta identidades ajenas", () => {
    const raw = JSON.parse(backup(project, emptyData));
    raw.uid = "otro";
    raw.project.uid = "otro";
    const parsed = parseBackup(JSON.stringify(raw));
    expect(parsed).not.toHaveProperty("uid");
    expect(parsed.project).not.toHaveProperty("uid");
  });
  it("rechaza respaldo inválido y referencias faltantes", () => {
    expect(() => parseBackup("{}")).toThrow();
    expect(() =>
      parseBackup(
        backup(project, {
          ...emptyData,
          pendingItems: [{ ...pending, purchaseId: crypto.randomUUID() }],
        }),
      ),
    ).toThrow();
  });
  it("CSV neutraliza fórmulas y escapa comillas", () => {
    const result = csv([{ material: "=SUM(A1)", supplier: 'A,"B"' }]);
    expect(result).toContain("'=SUM(A1)");
    expect(result).toContain('"A,""B"""');
  });
  it("ICS convierte Guatemala a UTC y escapa saltos", () => {
    const result = ics("Comprar cemento, 35 sacos", "2026-09-11T10:00", "test");
    expect(result).toContain("DTSTART:20260911T160000Z\r\n");
    expect(result).toContain("SUMMARY:Comprar cemento\\, 35 sacos");
    expect(result).toContain("BEGIN:VALARM");
    expect(result.endsWith("\r\n")).toBe(true);
  });
});

it("mano de obra conserva el saldo exacto y excluye borrados", () => {
  const payment = laborSchema.parse({
    ...fresh(project.id),
    workerId: crypto.randomUUID(),
    period: "Semana 1",
    description: "Muros",
    agreedCents: 200000,
    paidCents: 50000,
    date: "2026-09-11",
    paymentMethod: "",
    reference: "",
    notes: "",
  });
  expect(
    summary(project, { ...emptyData, laborPayments: [payment] }),
  ).toMatchObject({
    laborPaid: 50000,
    spent: 50000,
    committed: 150000,
    available: 800000,
  });
  expect(
    summary(project, {
      ...emptyData,
      laborPayments: [{ ...payment, deleted: true }],
    }).committed,
  ).toBe(0);
});
