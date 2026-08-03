import { z } from "zod";

export const driverSchema = z.object({
  profile_id: z.string().uuid(),
  cnh_number: z.string().min(5),
  cnh_category: z.string().optional(),
  cnh_expiry: z.string().date().optional(),
  vehicle_id: z.string().uuid().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type DriverInput = z.infer<typeof driverSchema>;
