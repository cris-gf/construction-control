import { z } from "zod";
import { appConfig } from "../config/appConfig";
import { validationText } from "../locales/es/validation";
import { total } from "./money";
import {
  pendingTypes,
  priorities,
  projectStates,
  workerAgreements,
} from "./options";
const text = z.string().max(appConfig.validation.longTextLength);
const short = z.string().max(appConfig.validation.shortTextLength);
const amount = z.number().int().min(0).max(appConfig.validation.maxAmountCents);
const date = z
  .string()
  .max(30)
  .refine(
    (v) =>
      !v ||
      (/^\d{4}-\d{2}-\d{2}(T([01]\d|2[0-3]):[0-5]\d)?$/.test(v) &&
        Number.isFinite(Date.parse(v.slice(0, 10) + "T12:00:00Z")) &&
        new Date(v.slice(0, 10) + "T12:00:00Z")
          .toISOString()
          .startsWith(v.slice(0, 10))),
    validationText.invalidDate,
  );
const base = {
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
  version: z.number().int().positive(),
  deleted: z.boolean().default(false),
};
export const projectSchema = z.object({
  ...base,
  name: short.min(1),
  description: text,
  location: short,
  budgetCents: amount,
  startDate: date,
  endDate: date,
  status: z.enum(projectStates),
});
export const purchaseSchema = z
  .object({
    ...base,
    date: date.min(1),
    category: short,
    material: short.min(1),
    quantity: z.string().regex(/^\d{1,7}(\.\d{1,3})?$/),
    unit: short.min(1),
    unitPriceCents: amount,
    supplier: short,
    paidCents: amount,
    paymentMethod: short,
    reference: short,
    notes: text,
    pendingItemId: z.string().max(36).default(""),
  })
  .refine((p) => p.paidCents <= total(p.quantity, p.unitPriceCents), {
    message: validationText.paymentExceedsTotal,
    path: ["paidCents"],
  });
export const pendingStates = [
  "solicitado",
  "pendiente de compra",
  "comprado",
  "en camino",
  "recibido",
  "completado",
  "cancelado",
] as const;
export const pendingSchema = z.object({
  ...base,
  type: z.enum(pendingTypes),
  material: short.min(1),
  quantity: z.string().regex(/^\d{1,7}(\.\d{1,3})?$/),
  unit: short,
  unitPriceCents: amount,
  supplier: short,
  dueDate: date,
  buyDate: date,
  receiveDate: date,
  priority: z.enum(priorities),
  status: z.enum(pendingStates),
  notes: text,
  purchaseId: z.string().max(36).default(""),
});
export const workerSchema = z.object({
  ...base,
  name: short.min(1),
  role: short,
  phone: z.string().max(40),
  agreement: z.enum(workerAgreements),
  rateCents: amount,
  active: z.boolean(),
  notes: text,
});
export const laborSchema = z
  .object({
    ...base,
    workerId: z.string().uuid(),
    period: short,
    description: text,
    agreedCents: amount,
    paidCents: amount,
    date: date,
    paymentMethod: short,
    reference: short,
    notes: text,
  })
  .refine((p) => p.paidCents <= p.agreedCents, {
    message: validationText.paymentExceedsAgreement,
    path: ["paidCents"],
  });
export const supplierSchema = z.object({
  ...base,
  name: short.min(1),
  phone: short,
  notes: text,
});
export const materialSchema = z.object({
  ...base,
  name: short.min(1),
  unit: short,
  category: short,
});
