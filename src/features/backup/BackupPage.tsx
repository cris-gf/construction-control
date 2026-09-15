import { Download } from "lucide-react";
import { appConfig } from "../../config/appConfig";
import { titles } from "../../config/recordFields";
import {
  money,
  type Kind,
  type Project,
  type ProjectData,
  type RecordData,
} from "../../domain";
import { backupText } from "../../locales/es/backup";
import { csv, download } from "../../services/files";
import { closeSession } from "../../services/session";
import { backup, parseBackup, type Backup } from "./serialization";

export function BackupPage({
  project,
  data,
  dataReady,
  imported,
  setImported,
  setError,
  doImport,
  setEditor,
  remove,
  pending,
}: {
  project: Project;
  data: ProjectData;
  dataReady: boolean;
  imported: Backup | null;
  setImported: (value: Backup | null) => void;
  setError: (value: string) => void;
  doImport: () => void;
  setEditor: (value: { kind: Kind; initial?: Partial<RecordData> }) => void;
  remove: (kind: Kind, value: RecordData) => void;
  pending: boolean;
}) {
  return (
    <section className="panel">
      <h2>{backupText.title}</h2>
      <p>
        {backupText.exportActive} <strong>{project.name}</strong>.
      </p>
      <div className="export-grid">
        {(["purchases", "laborPayments", "pendingItems"] as const).map(
          (kind) => (
            <button
              className="secondary"
              key={kind}
              disabled={!dataReady}
              onClick={() =>
                download(
                  `${kind}.csv`,
                  csv(data[kind].filter((r) => !r.deleted)),
                  "text/csv;charset=utf-8",
                )
              }
            >
              <Download size={18} />
              {titles[kind]}
              {backupText.csv}
            </button>
          ),
        )}
        <button
          disabled={!dataReady}
          onClick={() =>
            download(
              "obra-respaldo.json",
              backup(project, data),
              "application/json",
            )
          }
        >
          <Download size={18} />
          {backupText.exportJson}
        </button>
      </div>
      <hr />
      <h2>{backupText.importTitle}</h2>
      <p>{backupText.importDescription}</p>
      <input
        aria-label={backupText.importLabel}
        type="file"
        accept="application/json,.json"
        onChange={async (e) => {
          try {
            const file = e.target.files?.[0];
            if (file) {
              if (file.size > appConfig.backup.maxFileBytes) throw new Error();
              setImported(parseBackup(await file.text()));
            }
          } catch {
            setError(backupText.invalidFile);
          }
          e.target.value = "";
        }}
      />
      {imported && (
        <div className="import-preview">
          <h3>
            {backupText.previewPrefix}
            {imported.project.name}
          </h3>
          <p>
            {backupText.budgetPrefix}
            {money(imported.project.budgetCents)}
          </p>
          {Object.entries(imported.data).map(([k, v]) => (
            <p key={k}>
              {titles[k as Kind]}: {v.length}
            </p>
          ))}
          <button onClick={() => void doImport()}>
            {backupText.confirmImport}
          </button>
          <button className="text-button" onClick={() => setImported(null)}>
            {backupText.cancel}
          </button>
        </div>
      )}
      <hr />
      <h2>{backupText.projectSettings}</h2>
      <button
        className="secondary"
        onClick={() => setEditor({ kind: "projects", initial: project })}
      >
        {backupText.editProject}
      </button>
      <button
        className="text-button danger"
        onClick={() => remove("projects", project)}
      >
        {backupText.deleteProject}
      </button>
      <p className="muted">{backupText.installHint}</p>
      <button
        className="text-button mobile-only"
        onClick={() => void closeSession(pending)}
      >
        {backupText.signOut}
      </button>
    </section>
  );
}
