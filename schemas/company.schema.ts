import { z } from "zod";

export const companySchema = z.object({
  cnpj: z.string().min(14, "CNPJ inválido."),
  razao_social: z.string().min(2),
  nome_fantasia: z.string().optional(),
  address_logradouro: z.string().optional(),
  address_numero: z.string().optional(),
  address_bairro: z.string().optional(),
  address_cidade: z.string().optional(),
  address_uf: z.string().length(2).optional(),
  address_cep: z.string().optional(),
  ibge_code: z.string().optional(),
  license_number: z.string().optional(),
  license_type: z.string().optional(),
  license_issuing_agency: z.string().optional(),
  license_issue_date: z.string().date().optional(),
  license_expiry_date: z.string().date().optional(),
  contact_name: z.string().optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().optional(),
});

export type CompanyInput = z.infer<typeof companySchema>;
