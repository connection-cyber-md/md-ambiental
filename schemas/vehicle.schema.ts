import { z } from "zod";

export const vehicleSchema = z.object({
  plate: z.string().min(7).max(8),
  model: z.string().optional(),
  brand: z.string().optional(),
  capacity_litros: z.number().positive().optional(),
  status: z.enum(["active", "maintenance", "inactive"]).default("active"),
});

export type VehicleInput = z.infer<typeof vehicleSchema>;
