"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { success: true } | { error: string };

function isExpired(date: string | null): boolean {
  if (!date) return false;
  return date < new Date().toISOString().slice(0, 10);
}

export async function openShift(formData: FormData): Promise<ActionResult> {
  const vehicle_id = String(formData.get("vehicle_id") ?? "").trim();
  const start_km = Number(formData.get("start_km") ?? "");

  if (!vehicle_id || !Number.isFinite(start_km) || start_km < 0) {
    return { error: "Veículo e KM inicial válidos são obrigatórios." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada — faça login novamente." };

  const [profileRes, driverRes, vehicleRes] = await Promise.all([
    supabase.from("profiles").select("tenant_id").eq("id", user.id).single(),
    supabase.from("drivers").select("id, cnh_expiry, mopp_expiry").eq("profile_id", user.id).single(),
    supabase.from("vehicles").select("license_expiry_date, insurance_expiry_date").eq("id", vehicle_id).single(),
  ]);

  if (!profileRes.data) return { error: "Perfil do usuário não encontrado." };
  if (!driverRes.data) return { error: "Cadastro de motorista não encontrado para este usuário." };
  if (!vehicleRes.data) return { error: "Veículo não encontrado." };

  // Bloqueio rígido: não abre turno com documentação vencida, mesmo que a
  // tela já filtre — esta é a checagem de verdade (a UI é só conveniência).
  if (isExpired(driverRes.data.cnh_expiry) || isExpired(driverRes.data.mopp_expiry)) {
    return { error: "Sua CNH ou MOPP está vencida. Regularize antes de abrir turno." };
  }
  if (isExpired(vehicleRes.data.license_expiry_date) || isExpired(vehicleRes.data.insurance_expiry_date)) {
    return { error: "O licenciamento ou seguro deste veículo está vencido." };
  }

  const { error } = await supabase.from("vehicle_shifts").insert({
    tenant_id: profileRes.data.tenant_id,
    driver_id: driverRes.data.id,
    vehicle_id,
    start_km,
  });

  if (error) return { error: error.message };
  revalidatePath("/motorista");
  return { success: true };
}

export async function closeShift(id: string, formData: FormData): Promise<ActionResult> {
  const end_km = Number(formData.get("end_km") ?? "");
  const fuel_added_liters_raw = String(formData.get("fuel_added_liters") ?? "").trim();

  if (!Number.isFinite(end_km) || end_km < 0) {
    return { error: "KM final válido é obrigatório." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("vehicle_shifts")
    .update({
      end_time: new Date().toISOString(),
      end_km,
      fuel_added_liters: fuel_added_liters_raw ? Number(fuel_added_liters_raw) : null,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/motorista");
  return { success: true };
}
