import { z } from "zod";
import {
  laborSchema,
  materialSchema,
  pendingSchema,
  projectSchema,
  purchaseSchema,
  supplierSchema,
  workerSchema,
} from "./schemas";
export interface UserProfile {
  id: string;
  email: string;
  createdAt: number;
  updatedAt: number;
}
export type Project = z.infer<typeof projectSchema>;
export type Purchase = z.infer<typeof purchaseSchema>;
export type PendingItem = z.infer<typeof pendingSchema>;
export type Worker = z.infer<typeof workerSchema>;
export type LaborPayment = z.infer<typeof laborSchema>;
export type Supplier = z.infer<typeof supplierSchema>;
export type Material = z.infer<typeof materialSchema>;
export const schemas = {
  projects: projectSchema,
  purchases: purchaseSchema,
  pendingItems: pendingSchema,
  workers: workerSchema,
  laborPayments: laborSchema,
  suppliers: supplierSchema,
  materials: materialSchema,
};
export type Kind = keyof typeof schemas;
export type RecordData =
  | Project
  | Purchase
  | PendingItem
  | Worker
  | LaborPayment
  | Supplier
  | Material;
export interface ProjectData {
  purchases: Purchase[];
  pendingItems: PendingItem[];
  workers: Worker[];
  laborPayments: LaborPayment[];
  suppliers: Supplier[];
  materials: Material[];
}
export const emptyData: ProjectData = {
  purchases: [],
  pendingItems: [],
  workers: [],
  laborPayments: [],
  suppliers: [],
  materials: [],
};
