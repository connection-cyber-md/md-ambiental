import type { createClient } from "@/lib/supabase/server";

// Mesma lista de tabelas que scripts/reset-synthetic-data.ts apaga (mais
// "companies", que o reset também apaga por último). financial_accounts,
// financial_categories, bases, tanks e destinatarios ficam de fora — não têm
// is_synthetic, são estrutura (mesma lógica de 0027/0030).
const SYNTHETIC_TABLES = [
  "companies",
  "vehicles",
  "drivers",
  "collections",
  "documents",
  "bpo_tasks",
  "vehicle_maintenance",
  "financial_entries",
  "evidences",
  "samples",
  "lots",
  "stock_movements",
  "expeditions",
  "expedition_lots",
  "contracts",
] as const;

// Soma quantos registros sintéticos existem no tenant, para o banner global
// em app/admin/layout.tsx. Falha silenciosa por tabela (retorna 0 nela) —
// um erro de contagem não deve derrubar a página inteira.
export async function getSyntheticTotal(supabase: Awaited<ReturnType<typeof createClient>>): Promise<number> {
  const counts = await Promise.all(
    SYNTHETIC_TABLES.map(async (table) => {
      const { count, error } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true })
        .eq("is_synthetic", true);
      if (error) return 0;
      return count ?? 0;
    })
  );
  return counts.reduce((sum, n) => sum + n, 0);
}
