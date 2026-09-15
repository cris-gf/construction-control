import { appConfig } from "../config/appConfig";
import type { Field } from "../config/recordFields";
import type { Worker } from "../domain";
import { commonText } from "../locales/es/common";
export function FieldInput({
  field,
  value,
  workers,
  onChange,
}: {
  field: Field;
  value: string;
  workers: Worker[];
  onChange: (value: string) => void;
}) {
  return (
    <label>
      {field.label}
      {field.required ? " *" : ""}
      {field.options ? (
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {field.options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      ) : field.type === "worker" ? (
        <select
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">{commonText.selectWorker}</option>
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
              ? appConfig.validation.longTextLength
              : appConfig.validation.shortTextLength
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
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}
