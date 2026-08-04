import { createClient } from "@/lib/supabase/server";
import { BpoBoard } from "@/components/admin/BpoBoard";

type BpoTask = {
  id: string;
  department: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  assigned_to: string | null;
};

export default async function AdminBpoPage() {
  const supabase = await createClient();

  const tasksRes = await supabase
    .from("bpo_tasks")
    .select("id, department, title, description, status, due_date, assigned_to")
    .order("due_date", { ascending: true, nullsFirst: false });

  const tasks: BpoTask[] = tasksRes.data ?? [];

  const assigneeIds = Array.from(
    new Set(tasks.map((t) => t.assigned_to).filter((id): id is string => Boolean(id)))
  );

  const assigneeNames: Record<string, string> = {};
  if (assigneeIds.length > 0) {
    const profilesRes = await supabase.from("profiles").select("id, full_name").in("id", assigneeIds);
    for (const p of profilesRes.data ?? []) assigneeNames[p.id] = p.full_name;
  }

  // Lista de responsáveis possíveis para o formulário: qualquer perfil
  // interno do tenant (não-cliente) — comercial, operação, admin etc.
  const assigneesRes = await supabase
    .from("profiles")
    .select("id, full_name")
    .neq("role", "client")
    .order("full_name", { ascending: true });

  return (
    <div>
      <p className="eyebrow">Backoffice</p>
      <h1 className="font-display text-[28px] text-ink mb-6">BPO — Tarefas por departamento</h1>

      {tasksRes.error ? (
        <div className="bg-white border border-ink/10 p-8 text-[15px] text-steel">
          <p className="mb-2">Não foi possível carregar as tarefas agora. Tente recarregar a página.</p>
          <p className="font-mono text-[12px] text-brand-amber-deep">
            {tasksRes.error.code}: {tasksRes.error.message}
          </p>
        </div>
      ) : (
        <BpoBoard tasks={tasks} assigneeNames={assigneeNames} assignees={assigneesRes.data ?? []} />
      )}
    </div>
  );
}
