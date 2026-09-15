import { writeBatch, type Firestore } from "firebase/firestore";
import { appConfig } from "../../config/appConfig";
import { fresh, type Kind } from "../../domain";
import { backupText } from "../../locales/es/backup";
import { servicesText } from "../../locales/es/services";
import { ref } from "../../services/firebase";
import { type Backup } from "./serialization";

export function prepareBackupImport(
  db: Firestore,
  uid: string,
  imported: Backup,
) {
  const count = Object.values(imported.data).reduce((s, r) => s + r.length, 0);
  if (count > appConfig.backup.maxImportRecords) {
    throw new Error(servicesText.importLimitExceeded);
  }
  const pid = crypto.randomUUID(),
    mapping = new Map<string, string>();
  for (const rows of Object.values(imported.data))
    for (const r of rows) mapping.set(r.id, crypto.randomUUID());
  const batch = writeBatch(db);
  const p = {
    ...imported.project,
    ...fresh(pid),
    id: pid,
    projectId: pid,
    name:
      imported.project.name.slice(
        0,
        appConfig.validation.shortTextLength - backupText.importedSuffix.length,
      ) + backupText.importedSuffix,
  };
  batch.set(ref(db, uid, pid, "projects", pid), p);
  for (const [kind, rows] of Object.entries(imported.data))
    for (const row of rows) {
      const r: Record<string, unknown> = {
        ...row,
        ...fresh(pid),
        deleted: row.deleted,
        id: mapping.get(row.id),
      };
      for (const key of ["workerId", "purchaseId", "pendingItemId"])
        if (key in r && r[key]) r[key] = mapping.get(String(r[key])) || "";
      batch.set(ref(db, uid, pid, kind as Kind, String(r.id)), r);
    }

  return { pid, commit: () => batch.commit() };
}
