"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAuthContext } from "@/lib/auth/context";
import { parseLocaleNumber } from "@/lib/format/number";
import { EXPEDITION_STATUSES, EXPEDITION_EDITABLE_STATUSES } from "@/lib/expedicao/constants";

type ActionResult = { success: true } | { error: string };

async function currentTenantId(): Promise<{ tenantId: string } | { error: string }> {
  const ctx = await getAuthContext();
  if (!ctx) return { error: "Sessão expirada — faça login novamente." };
  if (!ctx.tenantId) return { error: "Perfil do usuário não encontrado." };
  return { tenantId: ctx.tenantId };
}

// ---------- Destinatários ----------

export async function createDestinatario(formData: FormData): Promise<ActionResult> {
  const cnpj = String(formData.get("cnpj") ?? "").trim();
  const razao_social = String(formData.get("razao_social") ?? "").trim();
  const nome_fantasia = String(formData.get("nome_fantasia") ?? "").trim();
  const authorization_number = String(formData.get("authorization_number") ?? "").trim();
  const authorization_expiry_date = String(formData.get("authorization_expiry_date") ?? "").trim();
  const address_cidade = String(formData.get("address_cidade") ?? "").trim();
  const address_uf = String(formData.get("address_uf") ?? "").trim();

  if (!cnpj) return { error: "CNPJ é obrigatório." };
  if (!razao_social) return { error: "Razão social é obrigatória." };

  const tenantRes = await currentTenantId();
  if ("error" in tenantRes) return tenantRes;

  const supabase = await createClient();
  const { error } = await supabase.from("destinatarios").insert({
    tenant_id: tenantRes.tenantId,
    cnpj,
    razao_social,
    nome_fantasia: nome_fantasia || null,
    authorization_number: authorization_number || null,
    authorization_expiry_date: authorization_expiry_date || null,
    address_cidade: address_cidade || null,
    address_uf: address_uf || null,
  });

  if (error) {
    if (error.code === "23505") return { error: "Já existe um destinatário com esse CNPJ." };
    return { error: error.message };
  }

  revalidatePath("/admin/expedicao");
  return { success: true };
}

export async function deactivateDestinatario(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("destinatarios").update({ status: "inactive" }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/expedicao");
  return { success: true };
}

// ---------- Expedições ----------

export async function createExpedition(formData: FormData): Promise<ActionResult> {
  const destinatario_id = String(formData.get("destinatario_id") ?? "").trim();
  const vehicle_id = String(formData.get("vehicle_id") ?? "").trim();
  const driver_id = String(formData.get("driver_id") ?? "").trim();
  const expedition_date = String(formData.get("expedition_date") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!destinatario_id) return { error: "Selecione o destinatário." };
  if (!expedition_date) return { error: "Data da expedição é obrigatória." };

  const tenantRes = await currentTenantId();
  if ("error" in tenantRes) return tenantRes;

  const supabase = await createClient();
  const { error } = await supabase.from("expeditions").insert({
    tenant_id: tenantRes.tenantId,
    destinatario_id,
    vehicle_id: vehicle_id || null,
    driver_id: driver_id || null,
    expedition_date,
    total_volume_litros: 0,
    notes: notes || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/expedicao");
  return { success: true };
}

export async function updateExpeditionStatus(id: string, status: string): Promise<ActionResult> {
  if (!(EXPEDITION_STATUSES as readonly string[]).includes(status)) return { error: "Status inválido." };

  const supabase = await createClient();
  const now = new Date().toISOString();

  // Regra do PRD §16 item 8: o certificado de recebimento precisa estar
  // anexado antes de a expedição contar como conciliada/encerrada.
  if (status === "reconciled") {
    const current = await supabase.from("expeditions").select("receipt_document_id").eq("id", id).single();
    if (!current.data?.receipt_document_id) {
      return { error: "Anexe o certificado de recebimento (CRC) antes de conciliar esta expedição." };
    }
  }

  const { error } = await supabase
    .from("expeditions")
    .update({
      status: status as (typeof EXPEDITION_STATUSES)[number],
      updated_at: now,
      ...(status === "reconciled" ? { reconciled_at: now } : {}),
    })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/expedicao");
  return { success: true };
}

// ---------- Certificado de recebimento (CRC) ----------
// PRD §9.10/§9.7: o CRC é emitido pelo destinatário sobre o volume
// consolidado da expedição (não de uma coleta) — ver 0034 pra como
// documents passou a aceitar isso. verification_code é o valor curto que
// vai no QR Code do certificado (rota pública de verificação ainda não
// existe — ver docs/0006-ARQUITETURA-DE-DADOS-OLUC.md).

function generateVerificationCode(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase();
}

export async function attachReceiptCertificate(formData: FormData): Promise<ActionResult> {
  const expedition_id = String(formData.get("expedition_id") ?? "").trim();
  const document_number = String(formData.get("document_number") ?? "").trim();
  const issue_date = String(formData.get("issue_date") ?? "").trim();

  if (!expedition_id) return { error: "Expedição inválida." };

  const tenantRes = await currentTenantId();
  if ("error" in tenantRes) return tenantRes;

  const supabase = await createClient();

  const expeditionRes = await supabase.from("expeditions").select("status, receipt_document_id").eq("id", expedition_id).single();
  if (!expeditionRes.data) return { error: "Expedição não encontrada." };
  if (expeditionRes.data.status !== "delivered") {
    return { error: "Só é possível anexar o certificado depois que a expedição estiver 'Entregue'." };
  }
  if (expeditionRes.data.receipt_document_id) {
    return { error: "Esta expedição já tem um certificado de recebimento anexado." };
  }

  const { data: doc, error: docError } = await supabase
    .from("documents")
    .insert({
      tenant_id: tenantRes.tenantId,
      type: "CRC",
      expedition_id,
      document_number: document_number || null,
      issue_date: issue_date || new Date().toISOString().slice(0, 10),
      verification_code: generateVerificationCode(),
      status: "issued",
    })
    .select("id")
    .single();
  if (docError || !doc) return { error: docError?.message ?? "Falha ao criar o certificado." };

  // Reivindica o slot de certificado de forma atômica (.is receipt_document_id
  // null como guarda): fecha a corrida de duas submissões concorrentes
  // (duplo clique, dois admins) anexando certificados duplicados na mesma
  // expedição (achado do code review) — o check acima (linha 154) só pega o
  // caso comum, não a corrida.
  const linkRes = await supabase
    .from("expeditions")
    .update({ receipt_document_id: doc.id, updated_at: new Date().toISOString() })
    .eq("id", expedition_id)
    .eq("status", "delivered")
    .is("receipt_document_id", null)
    .select("id");
  if (linkRes.error) return { error: linkRes.error.message };
  if (!linkRes.data || linkRes.data.length === 0) {
    // Perdeu a corrida — apaga o certificado órfão que acabamos de criar.
    await supabase.from("documents").delete().eq("id", doc.id);
    return { error: "Esta expedição já tem um certificado de recebimento anexado." };
  }

  revalidatePath("/admin/expedicao");
  return { success: true };
}

// ---------- Composição do lote expedido ----------
// Cada linha aqui debita o volume do lote (PRD §9.9/§9.10: reconciliação
// volumétrica) e registra o efeito no tanque via stock_movements — mesma
// trilha de auditoria usada por app/admin/estoque/actions.ts. Sem "remover
// lote da expedição": desfazer exigiria estornar o movimento de estoque
// silenciosamente, o que o PRD proíbe pra dado regulatório (§9.7, §10 item 6).

export async function addExpeditionLot(formData: FormData): Promise<ActionResult> {
  const expedition_id = String(formData.get("expedition_id") ?? "").trim();
  const lot_id = String(formData.get("lot_id") ?? "").trim();
  const volumeRaw = String(formData.get("volume_litros") ?? "").trim();
  const volume_litros = parseLocaleNumber(volumeRaw);

  if (!expedition_id) return { error: "Selecione a expedição." };
  if (!lot_id) return { error: "Selecione o lote." };
  if (!volumeRaw || Number.isNaN(volume_litros) || volume_litros <= 0) return { error: "Volume inválido." };

  const tenantRes = await currentTenantId();
  if ("error" in tenantRes) return tenantRes;

  const supabase = await createClient();

  const expeditionRes = await supabase.from("expeditions").select("status, total_volume_litros").eq("id", expedition_id).single();
  if (!expeditionRes.data) return { error: "Expedição não encontrada." };
  if (!EXPEDITION_EDITABLE_STATUSES.includes(expeditionRes.data.status)) {
    return { error: "Só é possível compor lotes enquanto a expedição está 'Programada'." };
  }

  const lotRes = await supabase.from("lots").select("tank_id, volume_litros, status").eq("id", lot_id).single();
  if (!lotRes.data) return { error: "Lote não encontrado." };
  if (lotRes.data.status !== "open") return { error: "Só é possível expedir lotes abertos." };
  const currentVolume = Number(lotRes.data.volume_litros);
  if (volume_litros > currentVolume) {
    return { error: `Volume excede o saldo do lote (${currentVolume.toLocaleString("pt-BR")} L).` };
  }

  // Reserva o volume no lote ANTES de compor a expedição, com um "compare-
  // and-swap" contra o saldo lido acima (.eq no valor antigo): fecha a
  // corrida de duas expedições concorrentes debitando o mesmo lote (achado
  // do code review — sem isso, ambas passavam no check de saldo acima e o
  // lote podia ficar negativo). PostgREST reavalia o WHERE contra a linha
  // atual na hora do UPDATE, então a segunda tentativa concorrente encontra
  // 0 linhas e falha em vez de sobrescrever o resultado da primeira.
  const remaining = currentVolume - volume_litros;
  const reserveRes = await supabase
    .from("lots")
    .update({
      volume_litros: remaining,
      status: remaining <= 0.01 ? "expedited" : "open",
      updated_at: new Date().toISOString(),
    })
    .eq("id", lot_id)
    .eq("volume_litros", currentVolume)
    .select("id");
  if (reserveRes.error) return { error: reserveRes.error.message };
  if (!reserveRes.data || reserveRes.data.length === 0) {
    return {
      error: "O saldo do lote mudou nesse meio-tempo (outra composição em andamento). Atualize a página e tente novamente.",
    };
  }

  const { error: linkError } = await supabase.from("expedition_lots").insert({
    tenant_id: tenantRes.tenantId,
    expedition_id,
    lot_id,
    volume_litros,
  });
  if (linkError) {
    // Composição falhou — devolve o volume reservado no lote.
    await supabase
      .from("lots")
      .update({ volume_litros: currentVolume, status: "open", updated_at: new Date().toISOString() })
      .eq("id", lot_id);
    if (linkError.code === "23505") return { error: "Este lote já está nesta expedição." };
    return { error: linkError.message };
  }

  const { error: movementError } = await supabase.from("stock_movements").insert({
    tenant_id: tenantRes.tenantId,
    tank_id: lotRes.data.tank_id,
    lot_id,
    type: "expedicao",
    volume_litros: -volume_litros,
    reason: `Expedição ${expedition_id}`,
  });
  if (movementError) {
    // Desfaz a composição e devolve o volume reservado no lote.
    await supabase.from("expedition_lots").delete().eq("expedition_id", expedition_id).eq("lot_id", lot_id);
    await supabase
      .from("lots")
      .update({ volume_litros: currentVolume, status: "open", updated_at: new Date().toISOString() })
      .eq("id", lot_id);
    return { error: movementError.message };
  }

  // stock_movements (a trilha imutável) já foi gravado acima; este update só
  // mantém o total cacheado da expedição em dia — se falhar, avisamos em vez
  // de reportar sucesso com total desatualizado (não desfazemos mais nada:
  // a movimentação de estoque é auditoria imutável, regra do PRD).
  const { error: expeditionUpdateError } = await supabase
    .from("expeditions")
    .update({
      total_volume_litros: Number(expeditionRes.data.total_volume_litros ?? 0) + volume_litros,
      updated_at: new Date().toISOString(),
    })
    .eq("id", expedition_id);

  revalidatePath("/admin/expedicao");
  revalidatePath("/admin/estoque");

  if (expeditionUpdateError) {
    return { error: `Lote composto na expedição, mas o total não pôde ser totalmente atualizado: ${expeditionUpdateError.message}` };
  }

  return { success: true };
}
