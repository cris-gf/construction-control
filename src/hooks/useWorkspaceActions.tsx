import { type User } from "firebase/auth";
import { useState } from "react";
import { RecordActions } from "../components/RecordActions";
import { titles } from "../config/recordFields";
import { live, type Kind, type PendingItem, type RecordData } from "../domain";
import { RecordConflictError } from "../domain/errors";
import { prepareBackupImport } from "../features/backup/importBackup";
import { type Backup } from "../features/backup/serialization";
import { workspaceText } from "../locales/es/workspace";
import { save } from "../services/firebase";
import { useWorkspaceData } from "./useWorkspaceData";

export function useWorkspaceActions(
  user: User,
  workspace: ReturnType<typeof useWorkspaceData>,
) {
  const { db, projects, active, setActive, data, setError } = workspace;
  const [notice, setNotice] = useState("");
  const [editor, setEditor] = useState<{
    kind: Kind;
    initial?: Partial<RecordData>;
    convert?: PendingItem;
  } | null>(null);
  const [imported, setImported] = useState<Backup | null>(null);
  function submit(value: RecordData) {
    if (!db || !editor) throw new Error(workspaceText.storageNotReady);
    const { kind, initial, convert } = editor;
    const records = kind === "projects" ? projects : data[kind];
    const current = records.find((r) => r.id === initial?.id);
    if (initial?.id && current?.version !== initial.version) {
      throw new RecordConflictError(workspaceText.recordConflict);
    }
    if (
      convert &&
      data.pendingItems.find((p) => p.id === convert.id)?.version !==
        convert.version
    ) {
      setError(workspaceText.pendingConflict);
      return;
    }
    const other = convert
      ? {
          kind: "pendingItems" as const,
          value: {
            ...convert,
            purchaseId: value.id,
            status: "comprado" as const,
            version: convert.version + 1,
            updatedAt: Date.now(),
          },
        }
      : undefined;
    void save(db, user.uid, active, kind, value, other)
      .then(() => setNotice(workspaceText.saved))
      .catch(() => setError(workspaceText.syncFailed));
    setNotice(workspaceText.queued);
    setEditor(null);
    if (kind === "projects") setActive(value.id);
  }
  function mutate(kind: Kind, value: RecordData) {
    if (!db) return;
    void save(db, user.uid, active, kind, {
      ...value,
      version: value.version + 1,
      updatedAt: Date.now(),
    }).catch(() => setError(workspaceText.writeRejected));
  }
  function remove(kind: Kind, value: RecordData) {
    if (
      kind === "workers" &&
      live(data.laborPayments).some((p) => p.workerId === value.id)
    ) {
      setError(workspaceText.workerHasPayments);
      return;
    }
    if (window.confirm(workspaceText.confirmDelete))
      mutate(kind, { ...value, deleted: true });
  }
  function convert(p: PendingItem) {
    setEditor({
      kind: "purchases",
      convert: p,
      initial: {
        material: p.material,
        quantity: p.quantity,
        unit: p.unit || "unidad",
        unitPriceCents: p.unitPriceCents,
        supplier: p.supplier,
        pendingItemId: p.id,
        notes: p.notes,
      },
    });
  }
  const actions = (kind: Kind, record: RecordData) => (
    <RecordActions
      title={titles[kind]}
      onEdit={() => setEditor({ kind, initial: record })}
      onDelete={() => remove(kind, record)}
    />
  );
  async function doImport() {
    if (!db || !imported) return;
    let prepared;
    try {
      prepared = prepareBackupImport(db, user.uid, imported);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : workspaceText.importPreparationFailed,
      );
      return;
    }
    const { pid, commit } = prepared;
    setImported(null);
    setNotice(workspaceText.importQueued);
    void commit()
      .then(() => {
        setActive(pid);
        setNotice(workspaceText.importConfirmed);
      })
      .catch(() => setError(workspaceText.importFailed));
  }

  return {
    notice,
    setNotice,
    editor,
    setEditor,
    imported,
    setImported,
    submit,
    mutate,
    remove,
    convert,
    actions,
    doImport,
  };
}
