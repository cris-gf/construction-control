import type { PendingItem, Project, ProjectData, Purchase } from "./models";
import { total } from "./money";
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
