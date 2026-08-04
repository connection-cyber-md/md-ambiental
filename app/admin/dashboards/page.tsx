import { createClient } from "@/lib/supabase/server";

const SCOPE_LABEL: Record<string, string> = {
  comercial: "Comercial",
  operacional: "Operacional",
  compliance: "Compliance",
  financeiro: "Financeiro",
  rh: "RH",
  ceo: "Painel executivo",
};

const SCOPES = ["comercial", "operacional", "compliance", "financeiro", "rh", "ceo"] as const;

const METRIC_LABEL: Record<string, string> = {
  fleet_efficiency_l_per_km: "Eficiência de frota (L/km)",
  compliance_rate: "Taxa de conformidade",
  nps: "NPS",
};

function formatMetric(key: string, value: number) {
  if (key === "compliance_rate") return `${Math.round(value * 100)}%`;
  return value.toLocaleString("pt-BR");
}

export default async function AdminDashboardsPage() {
  const supabase = await createClient();

  const metricsRes = await supabase
    .from("dashboards_metrics")
    .select("id, metric_key, metric_value, scope, period_start, period_end")
    .order("period_start", { ascending: false });

  const metrics = metricsRes.data ?? [];

  return (
    <div>
      <p className="eyebrow">Backoffice</p>
      <h1 className="font-display text-[28px] text-ink mb-6">Dashboards</h1>

      {metricsRes.error ? (
        <div className="bg-white border border-ink/10 p-8 text-[15px] text-steel">
          <p className="mb-2">Não foi possível carregar as métricas agora.</p>
          <p className="font-mono text-[12px] text-brand-amber-deep">
            {metricsRes.error.code}: {metricsRes.error.message}
          </p>
        </div>
      ) : metrics.length === 0 ? (
        <div className="bg-white border border-ink/10 p-8 text-[15px] text-steel">
          Nenhuma métrica cadastrada ainda. Essa tela consulta{" "}
          <code className="bg-paper-dim px-1.5 py-0.5">dashboards_metrics</code> — assim que houver linhas
          para o tenant, elas aparecem aqui automaticamente.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SCOPES.map((scope) => {
            const scopeMetrics = metrics.filter((m) => m.scope === scope);
            if (scopeMetrics.length === 0) return null;

            return (
              <div key={scope} className="bg-white border border-ink/10 p-5">
                <h2 className="font-mono text-[11.5px] uppercase tracking-[0.06em] text-steel mb-3">
                  {SCOPE_LABEL[scope] ?? scope}
                </h2>
                <div className="flex flex-col gap-3">
                  {scopeMetrics.map((m) => (
                    <div key={m.id} className="flex items-center justify-between">
                      <span className="text-[13.5px] text-ink">{METRIC_LABEL[m.metric_key] ?? m.metric_key}</span>
                      <span className="font-display text-[18px] text-ink">
                        {formatMetric(m.metric_key, m.metric_value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
