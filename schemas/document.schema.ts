import { z } from "zod";

export const documentSchema = z.object({
  collection_id: z.string().uuid(),
  type: z.enum(["CCO", "MTR"]),
  document_number: z.string().optional(),
  file_url: z.string().url().optional(),
  issue_date: z.string().date().optional(),
  status: z.enum(["draft", "issued", "canceled"]).default("draft"),
});

export type DocumentInput = z.infer<typeof documentSchema>;
