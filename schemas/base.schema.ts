import { z } from "zod";

export const baseSchema = z.object({
  name: z.string().min(1),
  address_logradouro: z.string().optional(),
  address_numero: z.string().optional(),
  address_bairro: z.string().optional(),
  address_cidade: z.string().optional(),
  address_uf: z.string().length(2).optional(),
  address_cep: z.string().optional(),
  capacity_total_litros: z.number().positive().optional(),
  is_active: z.boolean().default(true),
});

export type BaseInput = z.infer<typeof baseSchema>;

export const tankSchema = z.object({
  base_id: z.string().uuid(),
  code: z.string().min(1),
  capacity_litros: z.number().positive(),
  material_class: z.string().optional(),
  status: z.enum(["active", "maintenance", "inactive"]).default("active"),
});

export type TankInput = z.infer<typeof tankSchema>;
