import { createClient } from "@/lib/supabase/server";
import { ImpactMetricsBoard } from "@/components/admin/ImpactMetricsBoard";
import { syncAutoCollectionsMetrics } from "@/lib/impact/autoCollections";

export default async function AdminImpactPage() {
  const supabase = await createClient();

  const metricsRes = await supabase
    .from("impact_metrics")
    .select("id, tenant_id, metric_key, label, unit, value, computation_mode, period_label, source, display_order, is_published")
    .order("display_order", { ascending: true });

  const metrics = metricsRes.data ? await syncAutoCollectionsMetrics(supabase, metricsRes.data) : [];

  return (
    <div>
      <p className="eyebrow">Backoffice</p>
      <h1 className="font-display text-[28px] text-ink mb-2">Impacto socioambiental</h1>
      <p className="text-[14px] text-steel mb-6">
        Métricas exibidas na home institucional. Só linhas marcadas como &quot;Publicar na home&quot; ficam visíveis para o
        público — o restante fica visível apenas aqui, como rascunho.
      </p>

      {metricsRes.error ? (
        <div className="bg-white border border-ink/10 p-8 text-[15px] text-steel">
          <p className="mb-2">Não foi possível carregar as métricas agora.</p>
          <p className="font-mono text-[12px] text-brand-amber-deep">
            {metricsRes.error.code}: {metricsRes.error.message}
          </p>
        </div>
      ) : (
        <ImpactMetricsBoard metrics={metrics} />
      )}
    </div>
  );
}
