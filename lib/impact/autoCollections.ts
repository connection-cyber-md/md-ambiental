import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

/**
 * Soma o volume (litros) de todas as coletas concluídas do tenant.
 * Única fonte de "valor automático" disponível hoje — usada para preencher
 * métricas de impact_metrics com computation_mode = 'auto_collections'.
 *
 * Depende de RLS: só funciona com um client autenticado que tenha permissão
 * de leitura em collections (staff interno). Um visitante anônimo do site
 * não consegue rodar isto — por isso o valor é recalculado e GRAVADO em
 * impact_metrics.value sempre que um admin abre /admin/impacto, e é esse
 * valor já salvo (não um cálculo ao vivo) que a home pública lê depois.
 */
export async function getCollectedVolumeTotal(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<number> {
  const { data, error } = await supabase
    .from("collections")
    .select("volume_litros")
    .eq("tenant_id", tenantId)
    .eq("status", "completed");

  if (error || !data) return 0;
  return data.reduce((sum, row) => sum + (row.volume_litros ?? 0), 0);
}

/**
 * Para cada métrica com computation_mode = 'auto_collections', recalcula o
 * valor a partir das coletas reais e sincroniza com o banco se mudou.
 * Retorna a lista já com os valores atualizados, pronta para renderizar.
 */
export async function syncAutoCollectionsMetrics<
  T extends { id: string; tenant_id: string; computation_mode: string; value: number }
>(supabase: SupabaseClient<Database>, metrics: T[]): Promise<T[]> {
  const autoMetrics = metrics.filter((m) => m.computation_mode === "auto_collections");
  if (autoMetrics.length === 0) return metrics;

  const tenantIds = [...new Set(autoMetrics.map((m) => m.tenant_id))];
  const totals = new Map<string, number>();
  for (const tenantId of tenantIds) {
    totals.set(tenantId, await getCollectedVolumeTotal(supabase, tenantId));
  }

  const updated = await Promise.all(
    metrics.map(async (m) => {
      if (m.computation_mode !== "auto_collections") return m;
      const computed = totals.get(m.tenant_id) ?? m.value;
      if (computed !== m.value) {
        await supabase.from("impact_metrics").update({ value: computed }).eq("id", m.id);
      }
      return { ...m, value: computed };
    })
  );

  return updated;
}
