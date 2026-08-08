export const DEPARTMENTS = ["comercial", "operacional", "administrativo", "financeiro", "rh"] as const;

export const DEPARTMENT_LABEL: Record<string, string> = {
  comercial: "Comercial",
  operacional: "Operacional",
  administrativo: "Administrativo",
  financeiro: "Financeiro",
  rh: "RH",
};

export const BPO_STATUSES = ["pending", "in_progress", "done", "blocked"] as const;

export const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  in_progress: "Em andamento",
  done: "Concluída",
  blocked: "Bloqueada",
};

export const STATUS_CLASSES: Record<string, string> = {
  pending: "text-steel border-ink/15",
  in_progress: "text-brand-amber-deep border-brand-amber/40",
  done: "text-brand-green-deep border-brand-green/40",
  blocked: "text-red-700 border-red-300",
};

// Prioritaria: bloqueada (sempre precisa de atencao) ou vencida e ainda nao
// concluida. Usado pros cards de departamento destacarem o que precisa de
// atencao assim que a tela abre, sem precisar clicar em nada.
export function isPriorityTask(task: { status: string; due_date: string | null }): boolean {
  if (task.status === "blocked") return true;
  if (task.status === "done") return false;
  if (!task.due_date) return false;
  const today = new Date().toISOString().slice(0, 10);
  return task.due_date < today;
}
