"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAuthContext } from "@/lib/auth/context";
import { parseLocaleNumber } from "@/lib/format/number";
import { PARTY_TYPES, CONTRACT_STATUSES } from "@/lib/contratos/constants";

type ActionResult = { success: true } | { error: string };

async function currentTenantId(): Promise<{ tenantId: string } | { error: string }> {
  const ctx = await getAuthContext();
  if (!ctx) return { error: "Sessão expirada — faça login novamente." };
  if (!ctx.tenantId) return { error: "Perfil do usuário não encontrado." };
  return { tenantId: ctx.tenantId };
}

function readContractInput(formData: FormData) {
  const party_type = String(formData.get("party_type") ?? "").trim();
  const priceRaw = String(formData.get("price_per_litro") ?? "").trim();
  const slaRaw = String(formData.get("sla_hours") ?? "").trim();

  return {
    party_type: (PARTY_TYPES as readonly string[]).includes(party_type) ? (party_type as (typeof PARTY_TYPES)[number]) : null,
    company_id: String(formData.get("company_id") ?? "").trim() || null,
    destinatario_id: String(formData.get("destinatario_id") ?? "").trim() || null,
    start_date: String(formData.get("start_date") ?? "").trim(),
    end_date: String(formData.get("end_date") ?? "").trim() || null,
    price_per_litro: priceRaw ? parseLocaleNumber(priceRaw) : null,
    sla_hours: slaRaw ? Number(slaRaw) : null,
    status: (CONTRACT_STATUSES as readonly string[]).includes(String(formData.get("status") ?? ""))
      ? (String(formData.get("status")) as (typeof CONTRACT_STATUSES)[number])
      : "draft",
    notes: String(formData.get("notes") ?? "").trim() || null,
  };
}

export async function createContract(formData: FormData): Promise<ActionResult> {
  const input = readContractInput(formData);

  if (!input.party_type) return { error: "Selecione o tipo de contraparte." };
  if (input.party_type === "gerador" && !input.company_id) return { error: "Selecione o gerador." };
  if (input.party_type === "destinatario" && !input.destinatario_id) return { error: "Selecione o destinatário." };
  if (!input.start_date) return { error: "Data de início é obrigatória." };
  // Mesmas regras de schemas/contract.schema.ts (positive()/int().positive()),
  // que este action não importava — preço/SLA negativos ou zerados passavam.
  if (input.price_per_litro !== null && (Number.isNaN(input.price_per_litro) || input.price_per_litro <= 0)) {
    return { error: "Preço por litro inválido." };
  }
  if (
    input.sla_hours !== null &&
    (Number.isNaN(input.sla_hours) || !Number.isInteger(input.sla_hours) || input.sla_hours <= 0)
  ) {
    return { error: "SLA (horas) inválido." };
  }

  const tenantRes = await currentTenantId();
  if ("error" in tenantRes) return tenantRes;

  const supabase = await createClient();
  const { error } = await supabase.from("contracts").insert({
    tenant_id: tenantRes.tenantId,
    party_type: input.party_type,
    // Só a coluna correspondente ao party_type é preenchida — a outra fica
    // null (exigido pela constraint contracts_party_matches_type da 0031).
    company_id: input.party_type === "gerador" ? input.company_id : null,
    destinatario_id: input.party_type === "destinatario" ? input.destinatario_id : null,
    start_date: input.start_date,
    end_date: input.end_date,
    price_per_litro: input.price_per_litro,
    sla_hours: input.sla_hours,
    status: input.status,
    notes: input.notes,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/contratos");
  return { success: true };
}

export async function updateContractStatus(id: string, status: string): Promise<ActionResult> {
  if (!(CONTRACT_STATUSES as readonly string[]).includes(status)) return { error: "Status inválido." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("contracts")
    .update({ status: status as (typeof CONTRACT_STATUSES)[number], updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/contratos");
  return { success: true };
}

export async function deleteContract(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("contracts").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/contratos");
  return { success: true };
}
