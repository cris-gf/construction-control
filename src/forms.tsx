import { useState } from "react";
import { X } from "lucide-react";
import {
  cents,
  money,
  total,
  fresh,
  schemas,
  localNow,
  today,
  pendingStates,
  type Kind,
  type RecordData,
  type Worker,
} from "./domain";
type Field = {
  key: string;
  label: string;
  type?: string;
  options?: string[];
  required?: boolean;
};
const f = (
  key: string,
  label: string,
  type = "text",
  required = false,
): Field => ({ key, label, type, required });
export const fields: Record<Kind, Field[]> = {
  projects: [
    f("name", "Nombre de la obra", "text", true),
    f("description", "Descripción"),
    f("location", "Ubicación"),
    f("budgetCents", "Presupuesto (Q)", "money", true),
    f("startDate", "Fecha de inicio", "date", true),
    f("endDate", "Finalización estimada", "date"),
    {
      key: "status",
      label: "Estado",
      options: ["planificación", "activa", "pausada", "finalizada"],
    },
  ],
  purchases: [
    f("date", "Fecha y hora", "datetime-local", true),
    f("material", "Material o servicio", "text", true),
    f("category", "Categoría"),
    f("quantity", "Cantidad", "quantity", true),
    f("unit", "Unidad", "text", true),
    f("unitPriceCents", "Precio unitario (Q)", "money", true),
    f("supplier", "Proveedor"),
    f("paidCents", "Monto pagado (Q)", "money", true),
    f("paymentMethod", "Forma de pago"),
    f("reference", "Factura o referencia"),
    f("notes", "Notas"),
  ],
  pendingItems: [
    {
      key: "type",
      label: "Tipo",
      options: ["comprar", "recibir", "solicitar", "pagar", "otro"],
    },
    f("material", "Material o descripción", "text", true),
    f("quantity", "Cantidad", "quantity"),
    f("unit", "Unidad"),
    f("unitPriceCents", "Precio estimado (Q)", "money"),
    f("supplier", "Proveedor"),
    f("dueDate", "Fecha límite", "datetime-local"),
    f("buyDate", "Compra prevista", "datetime-local"),
    f("receiveDate", "Recepción prevista", "datetime-local"),
    {
      key: "priority",
      label: "Prioridad",
      options: ["baja", "normal", "alta", "urgente"],
    },
    { key: "status", label: "Estado", options: [...pendingStates] },
    f("notes", "Notas"),
  ],
  workers: [
    f("name", "Nombre", "text", true),
    f("role", "Oficio"),
    f("phone", "Teléfono", "tel"),
    {
      key: "agreement",
      label: "Acuerdo",
      options: ["diario", "semanal", "por actividad", "otro"],
    },
    f("rateCents", "Tarifa habitual (Q)", "money"),
    { key: "active", label: "Estado", options: ["activo", "inactivo"] },
    f("notes", "Notas"),
  ],
  laborPayments: [
    f("workerId", "Trabajador", "worker", true),
    f("period", "Período o semana"),
    f("description", "Trabajo realizado"),
    f("agreedCents", "Monto acordado (Q)", "money", true),
    f("paidCents", "Monto pagado (Q)", "money", true),
    f("date", "Fecha del pago", "date"),
    f("paymentMethod", "Forma de pago"),
    f("reference", "Referencia"),
    f("notes", "Notas"),
  ],
  suppliers: [
    f("name", "Nombre", "text", true),
    f("phone", "Teléfono"),
    f("notes", "Notas"),
  ],
  materials: [
    f("name", "Material", "text", true),
    f("unit", "Unidad"),
    f("category", "Categoría"),
  ],
};
export const titles: Record<Kind, string> = {
  projects: "Obra",
  purchases: "Compra",
  pendingItems: "Pendiente",
  workers: "Trabajador",
  laborPayments: "Pago de mano de obra",
  suppliers: "Proveedor",
  materials: "Material",
};
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
      setError(
        e instanceof Error
          ? "issues" in e
            ? "Revisa los campos y montos: el abono no debe exceder el total."
            : e.message
          : "Revisa los datos.",
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
              {initial?.id ? "EDITAR REGISTRO" : "NUEVO REGISTRO"}
            </span>
            <h2>{titles[kind]}</h2>
          </div>
          <button
            className="icon"
            aria-label="Cerrar formulario"
            onClick={onClose}
          >
            <X />
          </button>
        </header>
        <form onSubmit={submit}>
          <div className="form-grid">
            {fields[kind].map((field) => (
              <label key={field.key}>
                {field.label}
                {field.required ? " *" : ""}
                {field.options ? (
                  <select
                    value={values[field.key]}
                    onChange={(e) => update(field.key, e.target.value)}
                  >
                    {field.options.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                ) : field.type === "worker" ? (
                  <select
                    required
                    value={values[field.key]}
                    onChange={(e) => update(field.key, e.target.value)}
                  >
                    <option value="">Selecciona un trabajador</option>
                    {workers.map((w) => (
                      <option value={w.id} key={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    required={field.required}
                    maxLength={
                      field.key === "notes" || field.key === "description"
                        ? 1000
                        : 160
                    }
                    type={
                      ["money", "quantity"].includes(field.type || "")
                        ? "text"
                        : field.type
                    }
                    inputMode={
                      ["money", "quantity"].includes(field.type || "")
                        ? "decimal"
                        : undefined
                    }
                    value={values[field.key]}
                    onChange={(e) => update(field.key, e.target.value)}
                  />
                )}
              </label>
            ))}
          </div>
          {["purchases", "pendingItems", "laborPayments"].includes(kind) && (
            <div className="calculated">
              <span>Total {kind === "pendingItems" ? "estimado" : ""}</span>
              <strong>{money(calculated)}</strong>
              {kind !== "pendingItems" && (
                <button
                  type="button"
                  className="text-button"
                  onClick={() => update("paidCents", String(calculated / 100))}
                >
                  Marcar pagado
                </button>
              )}
            </div>
          )}
          {error && (
            <div role="alert" className="error">
              {error}
              {error.includes("cambió") && onReload && (
                <button type="button" onClick={onReload}>
                  Recargar versión reciente
                </button>
              )}
            </div>
          )}
          <footer>
            <button type="button" className="secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit">Guardar {titles[kind].toLowerCase()}</button>
          </footer>
        </form>
      </section>
    </div>
  );
}
