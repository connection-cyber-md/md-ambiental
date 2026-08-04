export type LicenseStatus = "vencida" | "vence_em_breve" | "valida" | "sem_data";

export function licenseStatus(expiry: string | null): LicenseStatus {
  if (!expiry) return "sem_data";
  const today = new Date().toISOString().slice(0, 10);
  const in30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  if (expiry < today) return "vencida";
  if (expiry <= in30) return "vence_em_breve";
  return "valida";
}

export const LICENSE_STATUS_LABEL: Record<LicenseStatus, string> = {
  vencida: "Vencida",
  vence_em_breve: "Vence em breve",
  valida: "Válida",
  sem_data: "Sem data cadastrada",
};

export const LICENSE_STATUS_CLASSES: Record<LicenseStatus, string> = {
  vencida: "text-red-700 border-red-300",
  vence_em_breve: "text-brand-amber-deep border-brand-amber/40",
  valida: "text-brand-green-deep border-brand-green/40",
  sem_data: "text-steel border-ink/15",
};
