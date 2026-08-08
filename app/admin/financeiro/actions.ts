"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ACCOUNT_KINDS, ENTRY_TYPES, ENTRY_STATUSES } from "@/lib/financeiro/constants";

type ActionResult = { success: true } | { error: string };

type AccountKind = (typeof ACCOUNT_KINDS)[number];
type EntryType = (typeof ENTRY_TYPES)[number];
type EntryStatus = (typeof ENTRY_STATUSES)[number];

function readAccountKind(formData: FormData): AccountKind | null {
  const v = String(formData.get("kind") ?? "").trim();
  return (ACCOUNT_KINDS as readonly string[]).includes(v) ? (v as AccountKind) : null;
}

function readEntryType(formData: FormData): EntryType | null {
  const v = String(formData.get("type") ?? "").trim();
  return (ENTRY_TYPES as readonly string[]).includes(v) ? (v as EntryType) : null;
}

function readEntryStatus(formData: FormData): EntryStatus {
  const v = String(formData.get("status") ?? "pending").trim();
  return (ENTRY_STATUSES as readonly string[]).includes(v) ? (v as EntryStatus) : "pending";
}

async function currentTenantId(): Promise<{ tenantId: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada — faça login novamente." };

  const profileRes = await supabase.from("profiles").select("tenant_id").eq("id", user.id).single();
  if (!profileRes.data) return { error: "Perfil do usuário não encontrado." };
  return { tenantId: profileRes.data.tenant_id };
}

// ---------- Contas (bancária/caixa) ----------

export async function createFinancialAccount(formData: FormData): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const kind = readAccountKind(formData);
  const bankName = String(formData.get("bank_name") ?? "").trim();
  const initialBalanceRaw = String(formData.get("initial_balance") ?? "0").trim();
  const initialBalance = Number(initialBalanceRaw.replace(",", "."));

  if (!name || !kind) return { error: "Nome e tipo da conta são obrigatórios." };
  if (Number.isNaN(initialBalance)) return { error: "Saldo inicial inválido." };

  const tenantRes = await currentTenantId();
  if ("error" in tenantRes) return tenantRes;

  const supabase = await createClient();
  const { error } = await supabase.from("financial_accounts").insert({
    tenant_id: tenantRes.tenantId,
    name,
    kind,
    bank_name: bankName || null,
    initial_balance: initialBalance,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/financeiro");
  return { success: true };
}

export async function deactivateFinancialAccount(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("financial_accounts").update({ is_active: false }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/financeiro");
  return { success: true };
}

// ---------- Categorias (plano de contas) ----------

export async function createFinancialCategory(formData: FormData): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const type = readEntryType(formData);

  if (!name || !type) return { error: "Nome e tipo da categoria são obrigatórios." };

  const tenantRes = await currentTenantId();
  if ("error" in tenantRes) return tenantRes;

  const supabase = await createClient();
  const { error } = await supabase.from("financial_categories").insert({
    tenant_id: tenantRes.tenantId,
    name,
    type,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/financeiro");
  return { success: true };
}

export async function deactivateFinancialCategory(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("financial_categories").update({ is_active: false }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/financeiro");
  return { success: true };
}

// ---------- Lançamentos ----------

function readEntryInput(formData: FormData) {
  const amountRaw = String(formData.get("amount") ?? "").trim();
  return {
    account_id: String(formData.get("account_id") ?? "").trim(),
    category_id: String(formData.get("category_id") ?? "").trim(),
    type: readEntryType(formData),
    description: String(formData.get("description") ?? "").trim(),
    amount: Number(amountRaw.replace(",", ".")),
    entry_date: String(formData.get("entry_date") ?? ""),
    due_date: String(formData.get("due_date") ?? ""),
    status: readEntryStatus(formData),
  };
}

export async function createFinancialEntry(formData: FormData): Promise<ActionResult> {
  const input = readEntryInput(formData);

  if (!input.account_id || !input.category_id || !input.type) {
    return { error: "Conta, categoria e tipo são obrigatórios." };
  }
  if (!input.description) return { error: "Descrição é obrigatória." };
  if (!input.entry_date) return { error: "Data do lançamento é obrigatória." };
  if (Number.isNaN(input.amount) || input.amount <= 0) return { error: "Valor inválido." };

  const tenantRes = await currentTenantId();
  if ("error" in tenantRes) return tenantRes;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("financial_entries").insert({
    tenant_id: tenantRes.tenantId,
    account_id: input.account_id,
    category_id: input.category_id,
    type: input.type,
    description: input.description,
    amount: input.amount,
    entry_date: input.entry_date,
    due_date: input.due_date || null,
    status: input.status,
    paid_date: input.status === "paid" ? input.entry_date : null,
    created_by: user?.id ?? null,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/financeiro");
  revalidatePath("/admin");
  return { success: true };
}

export async function updateFinancialEntry(id: string, formData: FormData): Promise<ActionResult> {
  const input = readEntryInput(formData);

  if (!input.account_id || !input.category_id || !input.type) {
    return { error: "Conta, categoria e tipo são obrigatórios." };
  }
  if (!input.description) return { error: "Descrição é obrigatória." };
  if (!input.entry_date) return { error: "Data do lançamento é obrigatória." };
  if (Number.isNaN(input.amount) || input.amount <= 0) return { error: "Valor inválido." };

  const supabase = await createClient();

  const existingRes = await supabase.from("financial_entries").select("paid_date").eq("id", id).single();
  const previousPaidDate = existingRes.data?.paid_date ?? null;

  const { error } = await supabase
    .from("financial_entries")
    .update({
      account_id: input.account_id,
      category_id: input.category_id,
      type: input.type,
      description: input.description,
      amount: input.amount,
      entry_date: input.entry_date,
      due_date: input.due_date || null,
      status: input.status,
      paid_date: input.status === "paid" ? previousPaidDate ?? input.entry_date : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/financeiro");
  revalidatePath("/admin");
  return { success: true };
}

export async function markFinancialEntryPaid(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("financial_entries")
    .update({ status: "paid", paid_date: new Date().toISOString().slice(0, 10) })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/financeiro");
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteFinancialEntry(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("financial_entries").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/financeiro");
  revalidatePath("/admin");
  return { success: true };
}
