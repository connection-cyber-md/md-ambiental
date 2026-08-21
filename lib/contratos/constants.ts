// Labels do módulo de contratos (PRD-OLUC-001 §9.12). Mesmo padrão de
// lib/estoque/constants.ts e lib/expedicao/constants.ts.

export const PARTY_TYPES = ["gerador", "destinatario"] as const;

export const PARTY_TYPE_LABEL: Record<string, string> = {
  gerador: "Gerador (cliente)",
  destinatario: "Destinatário (rerrefinador)",
};

export const CONTRACT_STATUSES = ["draft", "active", "suspended", "terminated"] as const;

export const CONTRACT_STATUS_LABEL: Record<string, string> = {
  draft: "Rascunho",
  active: "Ativo",
  suspended: "Suspenso",
  terminated: "Encerrado",
};

export const CONTRACT_STATUS_CLASSES: Record<string, string> = {
  draft: "text-steel border-ink/15",
  active: "text-brand-green-deep border-brand-green/40",
  suspended: "text-brand-amber-deep border-brand-amber/40",
  terminated: "text-red-700 border-red-600/40",
};
