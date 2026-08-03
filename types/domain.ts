export type { Role } from "@/lib/auth/rbac";

export type VehicleStatus = "active" | "maintenance" | "inactive";
export type DriverStatus = "active" | "inactive";
export type CollectionStatus = "scheduled" | "in_progress" | "completed" | "canceled";
export type DocumentType = "CCO" | "MTR";
export type DocumentStatus = "draft" | "issued" | "canceled";
export type BpoDepartment = "comercial" | "operacional" | "administrativo" | "financeiro" | "rh";
export type BpoStatus = "pending" | "in_progress" | "done" | "blocked";
export type RegulatorySphere = "federal" | "estadual" | "municipal";
