export const ACCOUNT_KINDS = ["banco", "caixa"] as const;

export const ACCOUNT_KIND_LABEL: Record<string, string> = {
  banco: "Conta bancária",
  caixa: "Caixa",
};

export const ENTRY_TYPES = ["receita", "despesa"] as const;

export const ENTRY_TYPE_LABEL: Record<string, string> = {
  receita: "Receita",
  despesa: "Despesa",
};

export const ENTRY_STATUSES = ["pending", "paid", "canceled"] as const;

export const ENTRY_STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  paid: "Pago",
  canceled: "Cancelado",
};

export const ENTRY_STATUS_CLASSES: Record<string, string> = {
  pending: "text-brand-amber-deep border-brand-amber/40",
  paid: "text-brand-green-deep border-brand-green/40",
  canceled: "text-steel border-ink/15",
};
