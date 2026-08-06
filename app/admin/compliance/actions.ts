"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { success: true } | { error: string };

function orNull(v: FormDataEntryValue | null) {
  const s = String(v ?? "").trim();
  return s ? s : null;
}

// -------------------- Companies (clientes/licenças) --------------------

const COMPANY_STATUSES = ["active", "inactive"] as const;
type CompanyStatus = (typeof COMPANY_STATUSES)[number];

function readCompanyStatus(formData: FormData): CompanyStatus {
  const v = String(formData.get("status") ?? "active").trim();
  return (COMPANY_STATUSES as readonly string[]).includes(v) ? (v as CompanyStatus) : "active";
}

function readCompanyInput(formData: FormData) {
  return {
    cnpj: String(formData.get("cnpj") ?? "").trim(),
    razao_social: String(formData.get("razao_social") ?? "").trim(),
    nome_fantasia: orNull(formData.get("nome_fantasia")),
    license_number: orNull(formData.get("license_number")),
    license_type: orNull(formData.get("license_type")),
    license_issuing_agency: orNull(formData.get("license_issuing_agency")),
    license_issue_date: orNull(formData.get("license_issue_date")),
    license_expiry_date: orNull(formData.get("license_expiry_date")),
    contact_name: orNull(formData.get("contact_name")),
    contact_email: orNull(formData.get("contact_email")),
    contact_phone: orNull(formData.get("contact_phone")),
    status: readCompanyStatus(formData),
  };
}

export async function createCompany(formData: FormData): Promise<ActionResult> {
  const input = readCompanyInput(formData);
  if (!input.razao_social || !input.cnpj) {
    return { error: "Razão social e CNPJ são obrigatórios." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada — faça login novamente." };

  const profileRes = await supabase.from("profiles").select("tenant_id").eq("id", user.id).single();
  if (!profileRes.data) return { error: "Perfil do usuário não encontrado." };

  const { error } = await supabase.from("companies").insert({
    tenant_id: profileRes.data.tenant_id,
    ...input,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/compliance");
  revalidatePath("/portal");
  return { success: true };
}

export async function updateCompany(id: string, formData: FormData): Promise<ActionResult> {
  const input = readCompanyInput(formData);
  if (!input.razao_social || !input.cnpj) {
    return { error: "Razão social e CNPJ são obrigatórios." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("companies").update(input).eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/compliance");
  revalidatePath("/portal");
  return { success: true };
}

export async function deleteCompany(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("companies").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/compliance");
  return { success: true };
}

// -------------------- Regulatory matrix --------------------

const REGULATORY_SPHERES = ["federal", "estadual", "municipal"] as const;
type RegulatorySphere = (typeof REGULATORY_SPHERES)[number];

function readSphere(formData: FormData): RegulatorySphere {
  const v = String(formData.get("sphere") ?? "federal").trim();
  return (REGULATORY_SPHERES as readonly string[]).includes(v) ? (v as RegulatorySphere) : "federal";
}

function readRuleInput(formData: FormData) {
  const docsRaw = String(formData.get("required_documents") ?? "").trim();
  return {
    ibge_code: orNull(formData.get("ibge_code")),
    uf: orNull(formData.get("uf")),
    sphere: readSphere(formData),
    rule_title: String(formData.get("rule_title") ?? "").trim(),
    rule_description: orNull(formData.get("rule_description")),
    required_documents: docsRaw ? docsRaw.split(",").map((s) => s.trim()).filter(Boolean) : [],
    blocking_condition: orNull(formData.get("blocking_condition")),
    reference_law: orNull(formData.get("reference_law")),
    effective_date: orNull(formData.get("effective_date")),
  };
}

export async function createRegulatoryRule(formData: FormData): Promise<ActionResult> {
  const input = readRuleInput(formData);
  if (!input.rule_title) return { error: "Título da regra é obrigatório." };

  const supabase = await createClient();
  const { error } = await supabase.from("regulatory_matrix").insert(input);

  if (error) return { error: error.message };
  revalidatePath("/admin/compliance");
  return { success: true };
}

export async function updateRegulatoryRule(id: string, formData: FormData): Promise<ActionResult> {
  const input = readRuleInput(formData);
  if (!input.rule_title) return { error: "Título da regra é obrigatório." };

  const supabase = await createClient();
  const { error } = await supabase.from("regulatory_matrix").update(input).eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/compliance");
  return { success: true };
}

export async function deleteRegulatoryRule(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("regulatory_matrix").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/compliance");
  return { success: true };
}
