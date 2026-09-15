import { z } from "zod";
import { appConfig } from "../../config/appConfig";
import {
  laborSchema,
  materialSchema,
  pendingSchema,
  projectSchema,
  purchaseSchema,
  supplierSchema,
  workerSchema,
  type Project,
  type ProjectData,
} from "../../domain";
import { backupText } from "../../locales/es/backup";
export const backupSchema = z.object({
  format: z.literal("obra-backup"),
  version: z.literal(1),
  exportedAt: z.string(),
  project: projectSchema,
  data: z.object({
    purchases: z
      .array(purchaseSchema)
      .max(appConfig.backup.maxRecordsPerCollection),
    pendingItems: z
      .array(pendingSchema)
      .max(appConfig.backup.maxRecordsPerCollection),
    workers: z
      .array(workerSchema)
      .max(appConfig.backup.maxRecordsPerCollection),
    laborPayments: z
      .array(laborSchema)
      .max(appConfig.backup.maxRecordsPerCollection),
    suppliers: z
      .array(supplierSchema)
      .max(appConfig.backup.maxRecordsPerCollection),
    materials: z
      .array(materialSchema)
      .max(appConfig.backup.maxRecordsPerCollection),
  }),
});
export type Backup = z.infer<typeof backupSchema>;
export function parseBackup(raw: string) {
  if (new TextEncoder().encode(raw).length > appConfig.backup.maxFileBytes)
    throw new Error(backupText.fileTooLarge);
  const b = backupSchema.parse(JSON.parse(raw));
  const ids = new Set<string>();
  for (const rows of Object.values(b.data))
    for (const r of rows) {
      if (ids.has(r.id)) throw new Error(backupText.duplicateIds);
      ids.add(r.id);
    }
  const workers = new Set(b.data.workers.map((w) => w.id));
  if (b.data.laborPayments.some((p) => !workers.has(p.workerId)))
    throw new Error(backupText.missingWorker);
  const purchases = new Map(b.data.purchases.map((p) => [p.id, p]));
  const pending = new Map(b.data.pendingItems.map((p) => [p.id, p]));
  for (const p of b.data.pendingItems)
    if (p.purchaseId && purchases.get(p.purchaseId)?.pendingItemId !== p.id)
      throw new Error(backupText.invalidPurchaseLink);
  for (const p of b.data.purchases)
    if (p.pendingItemId && pending.get(p.pendingItemId)?.purchaseId !== p.id)
      throw new Error(backupText.invalidPendingLink);
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
