// Labels do módulo de expedição/destinação (PRD-OLUC-001 §9.10). Mesmo
// padrão de lib/estoque/constants.ts e lib/financeiro/constants.ts.

export const EXPEDITION_STATUSES = [
  "scheduled",
  "in_transit",
  "delivered",
  "reconciled",
  "canceled",
] as const;

export const EXPEDITION_STATUS_LABEL: Record<string, string> = {
  scheduled: "Programada",
  in_transit: "Em trânsito",
  delivered: "Entregue",
  reconciled: "Conciliada",
  canceled: "Cancelada",
};

export const EXPEDITION_STATUS_CLASSES: Record<string, string> = {
  scheduled: "text-steel border-ink/15",
  in_transit: "text-brand-amber-deep border-brand-amber/40",
  delivered: "text-blue-700 border-blue-600/40",
  reconciled: "text-brand-green-deep border-brand-green/40",
  canceled: "text-red-700 border-red-600/40",
};

// Composição (expedition_lots) só é editável enquanto a expedição ainda não
// saiu — depois de "in_transit" o volume expedido já está em trânsito e não
// deve mudar silenciosamente (mesma lógica de "certificado emitido" do PRD §9.7).
export const EXPEDITION_EDITABLE_STATUSES: readonly string[] = ["scheduled"];
