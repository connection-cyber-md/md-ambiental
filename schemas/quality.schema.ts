import { z } from "zod";

export const sampleSchema = z.object({
  collection_id: z.string().uuid(),
  seal_code: z.string().optional(),
  classification: z.string().optional(),
  contaminants_declared: z.string().optional(),
  status: z.enum(["pending", "approved", "quarantine", "rejected"]).default("pending"),
  notes: z.string().optional(),
});

export type SampleInput = z.infer<typeof sampleSchema>;

export const evidenceSchema = z.object({
  collection_id: z.string().uuid(),
  type: z.enum(["photo", "signature", "geolocation", "document"]),
  file_url: z.string().url().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export type EvidenceInput = z.infer<typeof evidenceSchema>;
