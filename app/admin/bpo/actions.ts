"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { success: true } | { error: string };

const BPO_DEPARTMENTS = ["comercial", "operacional", "administrativo", "financeiro", "rh"] as const;
type BpoDepartment = (typeof BPO_DEPARTMENTS)[number];

const BPO_STATUSES = ["pending", "in_progress", "done", "blocked"] as const;
type BpoStatus = (typeof BPO_STATUSES)[number];

function readDepartment(formData: FormData): BpoDepartment | null {
  const v = String(formData.get("department") ?? "").trim();
  return (BPO_DEPARTMENTS as readonly string[]).includes(v) ? (v as BpoDepartment) : null;
}

function readBpoStatus(formData: FormData): BpoStatus {
  const v = String(formData.get("status") ?? "pending").trim();
  return (BPO_STATUSES as readonly string[]).includes(v) ? (v as BpoStatus) : "pending";
}

function readInput(formData: FormData) {
  return {
    department: readDepartment(formData),
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    status: readBpoStatus(formData),
    due_date: String(formData.get("due_date") ?? ""),
    assigned_to: String(formData.get("assigned_to") ?? ""),
  };
}

export async function createBpoTask(formData: FormData): Promise<ActionResult> {
  const input = readInput(formData);
  if (!input.title || !input.department) {
    return { error: "Título e departamento são obrigatórios." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada — faça login novamente." };

  const profileRes = await supabase.from("profiles").select("tenant_id").eq("id", user.id).single();
  if (!profileRes.data) return { error: "Perfil do usuário não encontrado." };

  const { error } = await supabase.from("bpo_tasks").insert({
    tenant_id: profileRes.data.tenant_id,
    department: input.department,
    title: input.title,
    description: input.description || null,
    status: input.status,
    due_date: input.due_date || null,
    assigned_to: input.assigned_to || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/bpo");
  revalidatePath("/admin");
  return { success: true };
}

export async function updateBpoTask(id: string, formData: FormData): Promise<ActionResult> {
  const input = readInput(formData);
  if (!input.title || !input.department) {
    return { error: "Título e departamento são obrigatórios." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("bpo_tasks")
    .update({
      department: input.department,
      title: input.title,
      description: input.description || null,
      status: input.status,
      due_date: input.due_date || null,
      assigned_to: input.assigned_to || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/bpo");
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteBpoTask(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("bpo_tasks").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/bpo");
  revalidatePath("/admin");
  return { success: true };
}
