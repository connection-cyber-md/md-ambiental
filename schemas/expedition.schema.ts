import { z } from "zod";

export const expeditionSchema = z.object({
  destinatario_id: z.string().uuid(),
  vehicle_id: z.string().uuid().optional(),
  driver_id: z.string().uuid().optional(),
  expedition_date: z.string().datetime(),
  status: z.enum(["scheduled", "in_transit", "delivered", "reconciled", "canceled"]).default("scheduled"),
  notes: z.string().optional(),
});

export type ExpeditionInput = z.infer<typeof expeditionSchema>;

export const expeditionLotSchema = z.object({
  expedition_id: z.string().uuid(),
  lot_id: z.string().uuid(),
  volume_litros: z.number().positive(),
});

export type ExpeditionLotInput = z.infer<typeof expeditionLotSchema>;
