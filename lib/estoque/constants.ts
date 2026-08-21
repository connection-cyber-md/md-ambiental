// Labels e convenções do módulo de estoque (PRD-OLUC-001 §9.9). Mesma forma
// que lib/financeiro/constants.ts: arrays "as const" pros selects e records
// de label pra exibição.

export const TANK_STATUSES = ["active", "maintenance", "inactive"] as const;

export const TANK_STATUS_LABEL: Record<string, string> = {
  active: "Ativo",
  maintenance: "Manutenção",
  inactive: "Inativo",
};

export const LOT_STATUSES = ["open", "closed", "expedited", "blocked"] as const;

export const LOT_STATUS_LABEL: Record<string, string> = {
  open: "Aberto",
  closed: "Fechado",
  expedited: "Expedido",
  blocked: "Bloqueado",
};

export const LOT_STATUS_CLASSES: Record<string, string> = {
  open: "text-brand-green-deep border-brand-green/40",
  closed: "text-steel border-ink/15",
  expedited: "text-blue-700 border-blue-600/40",
  blocked: "text-red-700 border-red-600/40",
};

export const MOVEMENT_TYPES = [
  "entrada",
  "transferencia",
  "ajuste",
  "perda",
  "expedicao",
  "inventario",
] as const;

export const MOVEMENT_TYPE_LABEL: Record<string, string> = {
  entrada: "Entrada",
  transferencia: "Transferência",
  ajuste: "Ajuste",
  perda: "Perda",
  expedicao: "Expedição",
  inventario: "Inventário",
};

// Sinal implícito pelo tipo de movimento: entrada/inventário somam,
// perda/expedição subtraem. transferência e ajuste têm sinal livre (o valor
// digitado já vem com o sinal desejado) — transferência porque uma ponta é
// negativa e a outra positiva, ajuste porque corrige tanto pra cima quanto
// pra baixo.
export function impliedSign(type: (typeof MOVEMENT_TYPES)[number]): 1 | -1 | null {
  if (type === "entrada" || type === "inventario") return 1;
  if (type === "perda" || type === "expedicao") return -1;
  return null;
}
