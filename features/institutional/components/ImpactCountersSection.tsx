import { createClient } from "@/lib/supabase/server";

type PublicMetric = {
  id: string;
  label: string;
  unit: string | null;
  value: number;
  period_label: string | null;
  source: string | null;
};

function formatValue(value: number) {
  return value.toLocaleString("pt-BR");
}

export async function ImpactCountersSection() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("impact_metrics")
    .select("id, label, unit, value, period_label, source")
    .eq("is_published", true)
    .order("display_order", { ascending: true });

  const metrics = (data ?? []) as PublicMetric[];
  if (metrics.length === 0) return null;

  const sourceNote = [...new Set(metrics.map((m) => m.source).filter(Boolean))].join(" · ");
  const periodNote = [...new Set(metrics.map((m) => m.period_label).filter(Boolean))][0];

  return (
    <section className="py-[50px] md:py-[70px] bg-ink" id="impacto">
      <div className="max-w-[1440px] mx-auto px-6">
        <p className="eyebrow text-brand-amber">Impacto socioambiental</p>
        <h2 className="font-display font-semibold text-[clamp(26px,3.2vw,38px)] leading-tight text-paper mb-9 max-w-[680px]">
          Nossa operação em números
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {metrics.map((metric) => (
            <div key={metric.id}>
              <div className="font-display text-[clamp(24px,3vw,34px)] text-brand-amber">
                {formatValue(metric.value)}
                {metric.unit ? ` ${metric.unit}` : ""}
              </div>
              <div className="text-[13px] text-steel-light mt-1.5 leading-snug">{metric.label}</div>
            </div>
          ))}
        </div>
        {(periodNote || sourceNote) && (
          <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-steel-light mt-9">
            {periodNote}
            {periodNote && sourceNote && " · "}
            {sourceNote && `fonte: ${sourceNote}`}
          </p>
        )}
      </div>
    </section>
  );
}
