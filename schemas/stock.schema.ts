import { z } from "zod";

export const lotSchema = z.object({
  tank_id: z.string().uuid(),
  code: z.string().min(1),
  quality_classification: z.string().optional(),
  status: z.enum(["open", "closed", "expedited", "blocked"]).default("open"),
});

export type LotInput = z.infer<typeof lotSchema>;

export const stockMovementSchema = z.object({
  tank_id: z.string().uuid(),
  lot_id: z.string().uuid().optional(),
  collection_id: z.string().uuid().optional(),
  related_movement_id: z.string().uuid().optional(),
  type: z.enum(["entrada", "transferencia", "ajuste", "perda", "expedicao", "inventario"]),
  volume_litros: z.number().refine((v) => v !== 0, "Volume não pode ser zero"),
  reason: z.string().optional(),
});

export type StockMovementInput = z.infer<typeof stockMovementSchema>;
