import { z } from "zod";
import {
  projectSchema,
  purchaseSchema,
  pendingSchema,
  workerSchema,
  laborSchema,
  supplierSchema,
  materialSchema,
  type Project,
  type ProjectData,
} from "./domain";
export const backupSchema = z.object({
  format: z.literal("obra-backup"),
  version: z.literal(1),
  exportedAt: z.string(),
  project: projectSchema,
  data: z.object({
    purchases: z.array(purchaseSchema).max(10000),
    pendingItems: z.array(pendingSchema).max(10000),
    workers: z.array(workerSchema).max(10000),
    laborPayments: z.array(laborSchema).max(10000),
    suppliers: z.array(supplierSchema).max(10000),
    materials: z.array(materialSchema).max(10000),
  }),
});
export type Backup = z.infer<typeof backupSchema>;
export function parseBackup(raw: string) {
  if (raw.length > 10000000) throw new Error("El respaldo excede 10 MB.");
  const b = backupSchema.parse(JSON.parse(raw));
  const ids = new Set<string>();
  for (const rows of Object.values(b.data))
    for (const r of rows) {
      if (ids.has(r.id)) throw new Error("Identificadores duplicados.");
      ids.add(r.id);
    }
  const workers = new Set(b.data.workers.map((w) => w.id));
  if (b.data.laborPayments.some((p) => !workers.has(p.workerId)))
    throw new Error("Falta un trabajador referenciado.");
  const purchases = new Map(b.data.purchases.map((p) => [p.id, p]));
  const pending = new Map(b.data.pendingItems.map((p) => [p.id, p]));
  for (const p of b.data.pendingItems)
    if (p.purchaseId && purchases.get(p.purchaseId)?.pendingItemId !== p.id)
      throw new Error("Enlace de compra inválido.");
  for (const p of b.data.purchases)
    if (p.pendingItemId && pending.get(p.pendingItemId)?.purchaseId !== p.id)
      throw new Error("Enlace de pendiente inválido.");
  return b;
}
export const backup = (project: Project, data: ProjectData) =>
  JSON.stringify(
    {
      format: "obra-backup",
      version: 1,
      exportedAt: new Date().toISOString(),
      project,
      data,
    },
    null,
    2,
  );
export function csv(rows: object[]) {
  const keys = [...new Set(rows.flatMap(Object.keys))];
  const cell = (v: unknown) => {
    let s = String(v ?? "");
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return '"' + s.replaceAll('"', '""') + '"';
  };
  return (
    "\uFEFF" +
    [
      keys.map(cell).join(","),
      ...rows.map((r) =>
        keys.map((k) => cell((r as Record<string, unknown>)[k])).join(","),
      ),
    ].join("\r\n")
  );
}
export function download(name: string, contents: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
const escapeIcs = (s: string) =>
  s
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", "\\n")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;")
    .replaceAll("\r", "");
export function ics(title: string, date: string, id: string) {
  if (!date) throw new Error("Primero define la fecha del evento.");
  const stamp = (d: Date) =>
    d
      .toISOString()
      .replaceAll("-", "")
      .replaceAll(":", "")
      .replace(/\.\d{3}/, "");
  const start = new Date(date + "-06:00");
  if (!Number.isFinite(start.getTime())) throw new Error("Fecha inválida.");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Obra//ES",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${id}@obra.local`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(new Date(start.getTime() + 3600000))}`,
    `SUMMARY:${escapeIcs(title)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT30M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeIcs(title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return (
    lines
      .map((line) => {
        let out = "",
          bytes = 0;
        for (const c of line) {
          const n = new TextEncoder().encode(c).length;
          if (bytes + n > 73) {
            out += "\r\n ";
            bytes = 1;
          }
          out += c;
          bytes += n;
        }
        return out;
      })
      .join("\r\n") + "\r\n"
  );
}
