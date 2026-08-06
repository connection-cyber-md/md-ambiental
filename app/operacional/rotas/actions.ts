"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { success: true } | { error: string };

export async function createCollectionOS(formData: FormData): Promise<ActionResult> {
  const company_id = String(formData.get("company_id") ?? "").trim();
  const collection_date = String(formData.get("collection_date") ?? "").trim();
  const driver_id = String(formData.get("driver_id") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!company_id || !collection_date) {
    return { error: "Cliente e data da coleta são obrigatórios." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada — faça login novamente." };

  const profileRes = await supabase.from("profiles").select("tenant_id").eq("id", user.id).single();
  if (!profileRes.data) return { error: "Perfil do usuário não encontrado." };

  // Atribuir motorista já atribui o veículo padrão dele (drivers.vehicle_id),
  // pra essa OS aparecer na "rota do dia" que ele vê em /motorista.
  let vehicle_id: string | null = null;
  if (driver_id) {
    const driverRes = await supabase.from("drivers").select("vehicle_id").eq("id", driver_id).single();
    vehicle_id = driverRes.data?.vehicle_id ?? null;
  }

  const { error } = await supabase.from("collections").insert({
    tenant_id: profileRes.data.tenant_id,
    company_id,
    collection_date,
    driver_id: driver_id || null,
    vehicle_id,
    notes: notes || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/operacional/rotas");
  revalidatePath("/motorista");
  return { success: true };
}

export async function cancelCollectionOS(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("collections").update({ status: "canceled" }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/operacional/rotas");
  revalidatePath("/motorista");
  return { success: true };
}
