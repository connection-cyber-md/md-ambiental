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
