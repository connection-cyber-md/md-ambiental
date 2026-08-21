"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAuthContext } from "@/lib/auth/context";
import { parseLocaleNumber } from "@/lib/format/number";
import { TANK_STATUSES, MOVEMENT_TYPES, impliedSign } from "@/lib/estoque/constants";

type ActionResult = { success: true } | { error: string };

async function currentTenantId(): Promise<{ tenantId: string } | { error: string }> {
  const ctx = await getAuthContext();
  if (!ctx) return { error: "Sessão expirada — faça login novamente." };
  if (!ctx.tenantId) return { error: "Perfil do usuário não encontrado." };
  return { tenantId: ctx.tenantId };
}

// ---------- Bases ----------

export async function createBase(formData: FormData): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const address_cidade = String(formData.get("address_cidade") ?? "").trim();
  const address_uf = String(formData.get("address_uf") ?? "").trim();
  const capacityRaw = String(formData.get("capacity_total_litros") ?? "").trim();
  const capacity_total_litros = capacityRaw ? parseLocaleNumber(capacityRaw) : null;

  if (!name) return { error: "Nome da base é obrigatório." };
  if (capacityRaw && Number.isNaN(capacity_total_litros)) return { error: "Capacidade total inválida." };

  const tenantRes = await currentTenantId();
  if ("error" in tenantRes) return tenantRes;

  const supabase = await createClient();
  const { error } = await supabase.from("bases").insert({
    tenant_id: tenantRes.tenantId,
    name,
    address_cidade: address_cidade || null,
    address_uf: address_uf || null,
    capacity_total_litros,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/estoque");
  return { success: true };
}

export async function deactivateBase(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("bases").update({ is_active: false }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/estoque");
  return { success: true };
}

// ---------- Tanques ----------

function readTankStatus(formData: FormData) {
  const v = String(formData.get("status") ?? "active").trim();
  return (TANK_STATUSES as readonly string[]).includes(v) ? (v as (typeof TANK_STATUSES)[number]) : "active";
}

export async function createTank(formData: FormData): Promise<ActionResult> {
  const base_id = String(formData.get("base_id") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();
  const capacityRaw = String(formData.get("capacity_litros") ?? "").trim();
  const capacity_litros = parseLocaleNumber(capacityRaw);
  const material_class = String(formData.get("material_class") ?? "").trim();
  const status = readTankStatus(formData);

  if (!base_id) return { error: "Selecione a base." };
  if (!code) return { error: "Código do tanque é obrigatório." };
  if (!capacityRaw || Number.isNaN(capacity_litros) || capacity_litros <= 0) return { error: "Capacidade inválida." };

  const tenantRes = await currentTenantId();
  if ("error" in tenantRes) return tenantRes;

  const supabase = await createClient();
  const { error } = await supabase.from("tanks").insert({
    tenant_id: tenantRes.tenantId,
    base_id,
    code,
    capacity_litros,
    material_class: material_class || null,
    status,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/estoque");
  return { success: true };
}

export async function updateTankStatus(id: string, status: string): Promise<ActionResult> {
  if (!(TANK_STATUSES as readonly string[]).includes(status)) return { error: "Status inválido." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("tanks")
    .update({ status: status as (typeof TANK_STATUSES)[number], updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/estoque");
  return { success: true };
}

// ---------- Lotes ----------

export async function createLot(formData: FormData): Promise<ActionResult> {
  const tank_id = String(formData.get("tank_id") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();
  const quality_classification = String(formData.get("quality_classification") ?? "").trim();

  if (!tank_id) return { error: "Selecione o tanque." };
  if (!code) return { error: "Código do lote é obrigatório." };

  const tenantRes = await currentTenantId();
  if ("error" in tenantRes) return tenantRes;

  const supabase = await createClient();
  const { error } = await supabase.from("lots").insert({
    tenant_id: tenantRes.tenantId,
    tank_id,
    code,
    quality_classification: quality_classification || null,
  });

  if (error) {
    if (error.code === "23505") return { error: "Já existe um lote com esse código." };
    return { error: error.message };
  }

  revalidatePath("/admin/estoque");
  return { success: true };
}

export async function closeLot(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("lots")
    .update({ status: "closed", closed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/estoque");
  return { success: true };
}

// ---------- Movimentações ----------
// Registra a movimentação (trilha de auditoria imutável — regra de negócio
// nº5/13 do PRD) e, quando ligada a um lote, atualiza lots.volume_litros —
// saldo cacheado, não recalculado a cada leitura (mesma escolha de
// financial_accounts.initial_balance + soma de entries, mas aqui a soma já
// vem pronta porque cada tanque pode ter muitos lotes/movimentos históricos).

export async function registerStockMovement(formData: FormData): Promise<ActionResult> {
  const tank_id = String(formData.get("tank_id") ?? "").trim();
  const lot_id = String(formData.get("lot_id") ?? "").trim() || null;
  const typeRaw = String(formData.get("type") ?? "").trim();
  const volumeRaw = String(formData.get("volume_litros") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();

  if (!tank_id) return { error: "Selecione o tanque." };
  if (!(MOVEMENT_TYPES as readonly string[]).includes(typeRaw)) return { error: "Tipo de movimento inválido." };
  const type = typeRaw as (typeof MOVEMENT_TYPES)[number];

  const rawAmount = parseLocaleNumber(volumeRaw);
  if (!volumeRaw || Number.isNaN(rawAmount) || rawAmount === 0) return { error: "Volume inválido." };

  const sign = impliedSign(type);
  // Pra entrada/inventário/perda/expedição o usuário digita sempre positivo e
  // o sinal é implícito pelo tipo; pra ajuste/transferência o próprio valor
  // digitado carrega o sinal (pode ser negativo).
  const volume_litros = sign === null ? rawAmount : sign * Math.abs(rawAmount);

  const tenantRes = await currentTenantId();
  if ("error" in tenantRes) return tenantRes;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error: insertError } = await supabase.from("stock_movements").insert({
    tenant_id: tenantRes.tenantId,
    tank_id,
    lot_id,
    type,
    volume_litros,
    reason: reason || null,
    created_by: user?.id ?? null,
  });

  if (insertError) return { error: insertError.message };

  if (lot_id) {
    const lotRes = await supabase.from("lots").select("volume_litros").eq("id", lot_id).single();
    if (lotRes.data) {
      const newVolume = Number(lotRes.data.volume_litros) + volume_litros;
      const { error: lotUpdateError } = await supabase
        .from("lots")
        .update({ volume_litros: newVolume, updated_at: new Date().toISOString() })
        .eq("id", lot_id);
      // A movimentação já foi gravada (trilha de auditoria imutável); se o
      // saldo cacheado do lote não puder ser atualizado, avisamos o usuário
      // em vez de reportar sucesso com o saldo desatualizado silenciosamente.
      if (lotUpdateError) {
        revalidatePath("/admin/estoque");
        return { error: `Movimentação registrada, mas o saldo do lote não pôde ser atualizado: ${lotUpdateError.message}` };
      }
    } else if (lotRes.error) {
      revalidatePath("/admin/estoque");
      return { error: `Movimentação registrada, mas não foi possível ler o saldo do lote: ${lotRes.error.message}` };
    }
  }

  revalidatePath("/admin/estoque");
  return { success: true };
}
