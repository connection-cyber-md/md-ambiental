"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { success: true } | { error: string };

function orNull(v: FormDataEntryValue | null) {
  const s = String(v ?? "").trim();
  return s ? s : null;
}

const MAINTENANCE_TYPES = ["oleo", "pneu", "lavagem", "mecanica", "documento"] as const;
type MaintenanceType = (typeof MAINTENANCE_TYPES)[number];

function readMaintenanceType(formData: FormData): MaintenanceType | null {
  const v = String(formData.get("maintenance_type") ?? "").trim();
  return (MAINTENANCE_TYPES as readonly string[]).includes(v) ? (v as MaintenanceType) : null;
}

function readMaintenanceInput(formData: FormData) {
  return {
    vehicle_id: String(formData.get("vehicle_id") ?? "").trim(),
    maintenance_type: readMaintenanceType(formData),
    description: orNull(formData.get("description")),
    cost: Number(formData.get("cost") ?? 0),
    maintenance_date: String(formData.get("maintenance_date") ?? "").trim(),
  };
}

export async function createMaintenance(formData: FormData): Promise<ActionResult> {
  const { vehicle_id, maintenance_type, description, cost, maintenance_date } = readMaintenanceInput(formData);
  if (!vehicle_id || !maintenance_type || !maintenance_date || cost <= 0) {
    return { error: "Veículo, tipo, data e custo válido são obrigatórios." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada — faça login novamente." };

  const profileRes = await supabase.from("profiles").select("tenant_id").eq("id", user.id).single();
  if (!profileRes.data) return { error: "Perfil do usuário não encontrado." };

  const { error } = await supabase.from("vehicle_maintenance").insert({
    tenant_id: profileRes.data.tenant_id,
    vehicle_id,
    maintenance_type,
    description,
    cost,
    maintenance_date,
  });

  if (error) return { error: error.message };
  revalidatePath("/operacional/frota");
  return { success: true };
}

export async function deleteMaintenance(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("vehicle_maintenance").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/operacional/frota");
  return { success: true };
}
