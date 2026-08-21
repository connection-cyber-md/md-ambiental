import { z } from "zod";

export const destinatarioSchema = z.object({
  cnpj: z.string().min(11),
  razao_social: z.string().min(1),
  nome_fantasia: z.string().optional(),
  authorization_number: z.string().optional(),
  authorization_expiry_date: z.string().optional(),
  address_cidade: z.string().optional(),
  address_uf: z.string().length(2).optional(),
  contact_name: z.string().optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type DestinatarioInput = z.infer<typeof destinatarioSchema>;
