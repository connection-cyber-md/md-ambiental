"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generateCcoPdfBytes } from "./pdf";

type ActionResult = { success: true } | { error: string };

const DOCUMENT_TYPES = ["CCO", "MTR"] as const;
type DocumentType = (typeof DOCUMENT_TYPES)[number];

const DOCUMENT_STATUSES = ["draft", "issued", "canceled"] as const;
type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];

function orNull(v: FormDataEntryValue | null) {
  const s = String(v ?? "").trim();
  return s ? s : null;
}

function readDocumentType(formData: FormData): DocumentType | null {
  const v = String(formData.get("type") ?? "").trim();
  return (DOCUMENT_TYPES as readonly string[]).includes(v) ? (v as DocumentType) : null;
}

function readDocumentStatus(formData: FormData): DocumentStatus {
  const v = String(formData.get("status") ?? "draft").trim();
  return (DOCUMENT_STATUSES as readonly string[]).includes(v) ? (v as DocumentStatus) : "draft";
}

function readDocumentInput(formData: FormData) {
  return {
    collection_id: String(formData.get("collection_id") ?? "").trim(),
    type: readDocumentType(formData),
    document_number: orNull(formData.get("document_number")),
    file_url: orNull(formData.get("file_url")),
    issue_date: orNull(formData.get("issue_date")),
    status: readDocumentStatus(formData),
  };
}

export async function createDocument(formData: FormData): Promise<ActionResult> {
  const { collection_id, type, document_number, file_url, issue_date, status } = readDocumentInput(formData);
  if (!collection_id || !type) {
    return { error: "Coleta e tipo de documento são obrigatórios." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada — faça login novamente." };

  const profileRes = await supabase.from("profiles").select("tenant_id").eq("id", user.id).single();
  if (!profileRes.data) return { error: "Perfil do usuário não encontrado." };

  const { error } = await supabase.from("documents").insert({
    tenant_id: profileRes.data.tenant_id,
    collection_id,
    type,
    document_number,
    file_url,
    issue_date,
    status,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/documentos");
  revalidatePath("/portal/documentos");
  return { success: true };
}

export async function updateDocument(id: string, formData: FormData): Promise<ActionResult> {
  const { collection_id, type, document_number, file_url, issue_date, status } = readDocumentInput(formData);
  if (!collection_id || !type) {
    return { error: "Coleta e tipo de documento são obrigatórios." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("documents")
    .update({ collection_id, type, document_number, file_url, issue_date, status })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/documentos");
  revalidatePath("/portal/documentos");
  return { success: true };
}

export async function deleteDocument(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/documentos");
  revalidatePath("/portal/documentos");
  return { success: true };
}

/**
 * Gera o PDF do certificado a partir de dados reais (tenant + empresa +
 * coleta + veículo + motorista), sobe pro bucket "documents" do Storage e
 * atualiza file_url/status do documento. Hoje só suporta CCO — MTR fica
 * pendente para uma etapa futura.
 */
export async function generateDocumentPdf(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada — faça login novamente." };

  const docRes = await supabase
    .from("documents")
    .select(
      `id, tenant_id, type, document_number, issue_date, status,
       collections (
         collection_date, volume_litros,
         companies ( razao_social, cnpj, address_logradouro, address_numero, address_bairro, address_cidade, address_uf, license_number ),
         vehicles ( plate ),
         drivers ( profiles ( full_name ) )
       )`
    )
    .eq("id", id)
    .single();

  if (docRes.error || !docRes.data) return { error: "Documento não encontrado." };
  const doc = docRes.data;

  if (doc.type !== "CCO") {
    return { error: "Geração automática de PDF hoje só está disponível para CCO." };
  }

  const collection = Array.isArray(doc.collections) ? doc.collections[0] : doc.collections;
  if (!collection) return { error: "Coleta vinculada não encontrada." };

  const company = Array.isArray(collection.companies) ? collection.companies[0] : collection.companies;
  if (!company) return { error: "Empresa geradora não encontrada." };

  const vehicle = Array.isArray(collection.vehicles) ? collection.vehicles[0] : collection.vehicles;
  const driverRow = Array.isArray(collection.drivers) ? collection.drivers[0] : collection.drivers;
  const driverProfile = driverRow ? (Array.isArray(driverRow.profiles) ? driverRow.profiles[0] : driverRow.profiles) : null;

  const tenantRes = await supabase
    .from("tenants")
    .select("razao_social, cnpj, address_logradouro, address_cidade, address_uf, anp_authorization_number")
    .eq("id", doc.tenant_id)
    .single();
  if (tenantRes.error || !tenantRes.data) return { error: "Dados do emissor (tenant) não encontrados." };
  const tenant = tenantRes.data;

  const issueDate = doc.issue_date ?? new Date().toISOString().slice(0, 10);

  const pdfBytes = await generateCcoPdfBytes({
    documentId: doc.id,
    documentNumber: doc.document_number,
    issueDate,
    tenant: {
      razaoSocial: tenant.razao_social,
      cnpj: tenant.cnpj,
      logradouro: tenant.address_logradouro,
      cidade: tenant.address_cidade,
      uf: tenant.address_uf,
      anpAuthorizationNumber: tenant.anp_authorization_number,
    },
    company: {
      razaoSocial: company.razao_social,
      cnpj: company.cnpj,
      logradouro: company.address_logradouro,
      numero: company.address_numero,
      bairro: company.address_bairro,
      cidade: company.address_cidade,
      uf: company.address_uf,
      licenseNumber: company.license_number,
    },
    collection: {
      collectionDate: collection.collection_date,
      volumeLitros: collection.volume_litros,
      vehiclePlate: vehicle?.plate ?? null,
      driverName: driverProfile?.full_name ?? null,
    },
  });

  const path = `${doc.tenant_id}/${doc.id}.pdf`;
  const uploadRes = await supabase.storage.from("documents").upload(path, pdfBytes, {
    contentType: "application/pdf",
    upsert: true,
  });
  if (uploadRes.error) return { error: `Falha ao salvar o PDF: ${uploadRes.error.message}` };

  const { data: publicUrlData } = supabase.storage.from("documents").getPublicUrl(path);

  const updateRes = await supabase
    .from("documents")
    .update({
      file_url: publicUrlData.publicUrl,
      issue_date: issueDate,
      status: doc.status === "canceled" ? doc.status : "issued",
    })
    .eq("id", id);
  if (updateRes.error) return { error: updateRes.error.message };

  revalidatePath("/admin/documentos");
  revalidatePath("/portal/documentos");
  return { success: true };
}
