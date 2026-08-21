import { z } from "zod";

export const contractSchema = z
  .object({
    party_type: z.enum(["gerador", "destinatario"]),
    company_id: z.string().uuid().optional(),
    destinatario_id: z.string().uuid().optional(),
    start_date: z.string(),
    end_date: z.string().optional(),
    price_per_litro: z.number().positive().optional(),
    sla_hours: z.number().int().positive().optional(),
    status: z.enum(["draft", "active", "suspended", "terminated"]).default("draft"),
    notes: z.string().optional(),
  })
  .refine(
    (v) =>
      (v.party_type === "gerador" && v.company_id && !v.destinatario_id) ||
      (v.party_type === "destinatario" && v.destinatario_id && !v.company_id),
    { message: "company_id (gerador) ou destinatario_id (destinatario) deve corresponder ao party_type" }
  );

export type ContractInput = z.infer<typeof contractSchema>;
