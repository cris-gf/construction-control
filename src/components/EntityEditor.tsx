import { X } from "lucide-react";
import { useState } from "react";
import { fields, titles } from "../config/recordFields";
import {
  cents,
  fresh,
  localNow,
  money,
  schemas,
  today,
  total,
  type Kind,
  type RecordData,
  type Worker,
} from "../domain";
import { RecordConflictError } from "../domain/errors";
import { commonText } from "../locales/es/common";
import { FieldInput } from "./FieldInput";
export function Editor({
  kind,
  projectId,
  initial,
  workers,
  onClose,
  onSave,
  onReload,
}: {
  kind: Kind;
  projectId: string;
  initial?: Partial<RecordData>;
  workers: Worker[];
  onClose: () => void;
  onSave: (v: RecordData) => void;
  onReload?: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      fields[kind].map((field) => {
        const value = (initial as Record<string, unknown> | undefined)?.[
          field.key
        ];
        return [
          field.key,
          value !== undefined
            ? field.type === "money"
              ? String(Number(value) / 100)
              : field.key === "active"
                ? value
                  ? "activo"
                  : "inactivo"
                : String(value)
            : (field.options?.[0] ??
              (field.type === "money"
                ? "0"
                : field.key === "quantity"
                  ? "1"
                  : field.type === "datetime-local"
                    ? field.key === "date"
                      ? localNow()
                      : ""
                    : field.type === "date"
                      ? field.key === "startDate" || field.key === "date"
                        ? today()
                        : ""
                      : "")),
        ];
      }),
    ),
  );
  const [error, setError] = useState("");
  const [canReload, setCanReload] = useState(false);
  const update = (key: string, value: string) =>
    setValues((v) => ({ ...v, [key]: value }));
  let calculated = 0;
  try {
    calculated =
      kind === "laborPayments"
        ? cents(values.agreedCents || "0")
        : total(values.quantity || "1", cents(values.unitPriceCents || "0"));
  } catch {
    /* Validación al guardar */
  }
  function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const data: Record<string, unknown> = {
        ...fresh(projectId),
        ...initial,
        ...values,
        updatedAt: Date.now(),
        version: initial?.version ? initial.version + 1 : 1,
      };
      for (const field of fields[kind])
        if (field.type === "money")
          data[field.key] = cents(values[field.key] || "0");
      if (kind === "workers") data.active = values.active === "activo";
      onSave(schemas[kind].parse(data));
    } catch (e) {
      setCanReload(e instanceof RecordConflictError);
      setError(
        e instanceof Error
          ? "issues" in e
            ? commonText.invalidAmounts
            : e.message
          : commonText.invalidData,
      );
    }
  }
  return (
    <div className="modal-backdrop">
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={titles[kind]}
      >
        <header>
          <div>
            <span className="eyebrow">
              {initial?.id ? commonText.editRecord : commonText.newRecord}
            </span>
            <h2>{titles[kind]}</h2>
          </div>
          <button
            className="icon"
            aria-label={commonText.closeForm}
            onClick={onClose}
          >
            <X />
          </button>
        </header>
        <form onSubmit={submit}>
          <div className="form-grid">
            {fields[kind].map((field) => (
              <FieldInput
                key={field.key}
                field={field}
                value={values[field.key]}
                workers={workers}
                onChange={(value) => update(field.key, value)}
              />
            ))}
          </div>
          {["purchases", "pendingItems", "laborPayments"].includes(kind) && (
            <div className="calculated">
              <span>
                {commonText.total}
                {kind === "pendingItems" ? commonText.estimated : ""}
              </span>
              <strong>{money(calculated)}</strong>
              {kind !== "pendingItems" && (
                <button
                  type="button"
                  className="text-button"
                  onClick={() => update("paidCents", String(calculated / 100))}
                >
                  {commonText.markPaid}
                </button>
              )}
            </div>
          )}
          {error && (
            <div role="alert" className="error">
              {error}
              {canReload && onReload && (
                <button type="button" onClick={onReload}>
                  {commonText.reloadLatest}
                </button>
              )}
            </div>
          )}
          <footer>
            <button type="button" className="secondary" onClick={onClose}>
              {commonText.cancel}
            </button>
            <button type="submit">
              {commonText.save}
              {titles[kind].toLowerCase()}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
