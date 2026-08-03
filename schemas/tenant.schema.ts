import { z } from "zod";

export const tenantSchema = z.object({
  cnpj: z.string().min(14, "CNPJ inválido."),
  razao_social: z.string().min(2),
  nome_fantasia: z.string().optional(),
  status: z.enum(["active", "suspended"]).default("active"),
});

export type TenantInput = z.infer<typeof tenantSchema>;
