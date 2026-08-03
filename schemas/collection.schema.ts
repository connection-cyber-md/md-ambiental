import { z } from "zod";

export const collectionSchema = z.object({
  company_id: z.string().uuid(),
  driver_id: z.string().uuid().optional(),
  vehicle_id: z.string().uuid().optional(),
  collection_date: z.string().datetime(),
  volume_litros: z.number().positive().optional(),
  status: z.enum(["scheduled", "in_progress", "completed", "canceled"]).default("scheduled"),
  notes: z.string().optional(),
});

export type CollectionInput = z.infer<typeof collectionSchema>;
