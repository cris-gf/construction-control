import { pendingStates, type Kind } from "../domain";
import {
  pendingTypes,
  priorities,
  projectStates,
  workerActivity,
  workerAgreements,
} from "../domain/options";
import { fieldsText } from "../locales/es/fields";
export type FieldType =
  | "text"
  | "money"
  | "quantity"
  | "date"
  | "datetime-local"
  | "tel"
  | "worker";
export type Field = {
  key: string;
  label: string;
  type?: FieldType;
  options?: string[];
  required?: boolean;
};
const f = (
  key: string,
  label: string,
  type: FieldType = "text",
  required = false,
): Field => ({ key, label, type, required });
export const fields: Record<Kind, Field[]> = {
  projects: [
    f("name", fieldsText.projectName, "text", true),
    f("description", fieldsText.description),
    f("location", fieldsText.location),
    f("budgetCents", fieldsText.budget, "money", true),
    f("startDate", fieldsText.startDate, "date", true),
    f("endDate", fieldsText.endDate, "date"),
    {
      key: "status",
      label: fieldsText.status,
      options: [...projectStates],
    },
  ],
  purchases: [
    f("date", fieldsText.dateTime, "datetime-local", true),
    f("material", fieldsText.materialOrService, "text", true),
    f("category", fieldsText.category),
    f("quantity", fieldsText.quantity, "quantity", true),
    f("unit", fieldsText.unit, "text", true),
    f("unitPriceCents", fieldsText.unitPrice, "money", true),
    f("supplier", fieldsText.supplier),
    f("paidCents", fieldsText.paidAmount, "money", true),
    f("paymentMethod", fieldsText.paymentMethod),
    f("reference", fieldsText.invoiceReference),
    f("notes", fieldsText.notes),
  ],
  pendingItems: [
    {
      key: "type",
      label: fieldsText.type,
      options: [...pendingTypes],
    },
    f("material", fieldsText.materialOrDescription, "text", true),
    f("quantity", fieldsText.quantity, "quantity"),
    f("unit", fieldsText.unit),
    f("unitPriceCents", fieldsText.estimatedPrice, "money"),
    f("supplier", fieldsText.supplier),
    f("dueDate", fieldsText.dueDate, "datetime-local"),
    f("buyDate", fieldsText.buyDate, "datetime-local"),
    f("receiveDate", fieldsText.receiveDate, "datetime-local"),
    {
      key: "priority",
      label: fieldsText.priority,
      options: [...priorities],
    },
    { key: "status", label: fieldsText.status, options: [...pendingStates] },
    f("notes", fieldsText.notes),
  ],
  workers: [
    f("name", fieldsText.name, "text", true),
    f("role", fieldsText.role),
    f("phone", fieldsText.phone, "tel"),
    {
      key: "agreement",
      label: fieldsText.agreement,
      options: [...workerAgreements],
    },
    f("rateCents", fieldsText.usualRate, "money"),
    {
      key: "active",
      label: fieldsText.status,
      options: [...workerActivity],
    },
    f("notes", fieldsText.notes),
  ],
  laborPayments: [
    f("workerId", fieldsText.worker, "worker", true),
    f("period", fieldsText.period),
    f("description", fieldsText.workDescription),
    f("agreedCents", fieldsText.agreedAmount, "money", true),
    f("paidCents", fieldsText.paidAmount, "money", true),
    f("date", fieldsText.paymentDate, "date"),
    f("paymentMethod", fieldsText.paymentMethod),
    f("reference", fieldsText.reference),
    f("notes", fieldsText.notes),
  ],
  suppliers: [
    f("name", fieldsText.name, "text", true),
    f("phone", fieldsText.phone),
    f("notes", fieldsText.notes),
  ],
  materials: [
    f("name", fieldsText.material, "text", true),
    f("unit", fieldsText.unit),
    f("category", fieldsText.category),
  ],
};
export const titles: Record<Kind, string> = {
  projects: fieldsText.project,
  purchases: fieldsText.purchase,
  pendingItems: fieldsText.pending,
  workers: fieldsText.worker,
  laborPayments: fieldsText.laborPayment,
  suppliers: fieldsText.supplier,
  materials: fieldsText.material,
};
