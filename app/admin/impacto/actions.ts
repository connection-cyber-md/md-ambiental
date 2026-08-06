"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { success: true } | { error: string };

function orNull(v: FormDataEntryValue | null) {
  const s = String(v ?? "").trim();
  return s ? s : null;
}

function readMetricInput(formData: FormData) {
  return {
    metric_key: String(formData.get("metric_key") ?? "").trim(),
    label: String(formData.get("label") ?? "").trim(),
    unit: orNull(formData.get("unit")),
    value: Number(formData.get("value") ?? 0),
    computation_mode: String(formData.get("computation_mode") ?? "manual"),
    period_label: orNull(formData.get("period_label")),
    source: orNull(formData.get("source")),
    display_order: Number(formData.get("display_order") ?? 0),
    is_published: formData.get("is_published") === "on",
  };
}

export async function createImpactMetric(formData: FormData): Promise<ActionResult> {
  const input = readMetricInput(formData);
  if (!input.metric_key || !input.label) {
    return { error: "Chave da métrica e rótulo são obrigatórios." };
  }
  if (Number.isNaN(input.value)) return { error: "Valor inválido." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada — faça login novamente." };

  const profileRes = await supabase.from("profiles").select("tenant_id").eq("id", user.id).single();
  if (!profileRes.data) return { error: "Perfil do usuário não encontrado." };

  const { error } = await supabase.from("impact_metrics").insert({
    tenant_id: profileRes.data.tenant_id,
    ...input,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/impacto");
  revalidatePath("/");
  return { success: true };
}

export async function updateImpactMetric(id: string, formData: FormData): Promise<ActionResult> {
  const input = readMetricInput(formData);
  if (!input.metric_key || !input.label) {
    return { error: "Chave da métrica e rótulo são obrigatórios." };
  }
  if (Number.isNaN(input.value)) return { error: "Valor inválido." };

  const supabase = await createClient();
  const { error } = await supabase.from("impact_metrics").update(input).eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/impacto");
  revalidatePath("/");
  return { success: true };
}

export async function deleteImpactMetric(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("impact_metrics").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/impacto");
  revalidatePath("/");
  return { success: true };
}
