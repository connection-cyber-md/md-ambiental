import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { BadgeCheckIcon } from "@/components/ui/BadgeCheckIcon";
import { ShieldCheckIcon } from "@/components/ui/ShieldCheckIcon";
import { HardHatIcon } from "@/components/ui/HardHatIcon";
import { transparencyContent, portalCta } from "@/features/institutional/content/site-copy";

// Um ícone por item, na mesma ordem de transparencyContent.items
// (autorização, conformidade normativa, equipe treinada/equipada).
const TRANSPARENCY_ICONS = [BadgeCheckIcon, ShieldCheckIcon, HardHatIcon];

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

// Une ImpactCountersSection ("Impacto socioambiental") e
// TransparenciaLicensesSection ("Transparência") em duas colunas dentro do
// mesmo espaço, por pedido explícito — antes eram duas seções empilhadas.
// A coluna de impacto depende de dado do Supabase e some se não houver
// métrica publicada; a de transparência é conteúdo estático e sempre aparece.
export async function ImpactTransparencySection() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("impact_metrics")
    .select("id, label, unit, value, period_label, source")
    .eq("is_published", true)
    .order("display_order", { ascending: true });

  const metrics = (data ?? []) as PublicMetric[];
  const sourceNote = [...new Set(metrics.map((m) => m.source).filter(Boolean))].join(" · ");
  const periodNote = [...new Set(metrics.map((m) => m.period_label).filter(Boolean))][0];

  return (
    <section className="py-[50px] md:py-[70px] bg-brand-green-deep" id="impacto">
      <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-14">
        <div>
          <p className="eyebrow">Impacto socioambiental</p>
          <h2 className="font-display font-semibold text-[clamp(24px,2.6vw,32px)] leading-tight text-paper mb-8">
            Nossa operação em números
          </h2>
          {metrics.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-8">
                {metrics.map((metric) => (
                  <div key={metric.id}>
                    <div className="font-display text-[clamp(22px,2.6vw,30px)] text-brand-amber">
                      {formatValue(metric.value)}
                      {metric.unit ? ` ${metric.unit}` : ""}
                    </div>
                    <div className="text-[13px] text-steel-light mt-1.5 leading-snug">{metric.label}</div>
                  </div>
                ))}
              </div>
              {(periodNote || sourceNote) && (
                <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-steel-light mt-8">
                  {periodNote}
                  {periodNote && sourceNote && " · "}
                  {sourceNote && `fonte: ${sourceNote}`}
                </p>
              )}
            </>
          ) : (
            <p className="text-[14px] text-steel-light">Métricas em atualização.</p>
          )}

          <div className="mt-10 pt-8 border-t border-white/10">
            <p className="eyebrow">{portalCta.eyebrow}</p>
            <h3 className="font-display font-semibold text-[22px] text-paper mb-2">{portalCta.title}</h3>
            <p className="text-steel-light text-[14px] mb-5 max-w-[440px]">{portalCta.body}</p>
            <Button href="/login" variant="ghost-dark">
              {portalCta.ctaLabel} →
            </Button>
          </div>
        </div>

        <div>
          <p className="eyebrow">{transparencyContent.eyebrow}</p>
          <h2 className="font-display font-semibold text-[clamp(24px,2.6vw,32px)] leading-tight text-paper mb-4">
            {transparencyContent.title}
          </h2>
          <p className="text-[14.5px] text-steel-light mb-6">{transparencyContent.lead}</p>
          <ul className="flex flex-col gap-4">
            {transparencyContent.items.map((item, i) => {
              const ItemIcon = TRANSPARENCY_ICONS[i] ?? BadgeCheckIcon;
              return (
                <li
                  key={item}
                  className="bg-transparent rounded-lg border border-brand-amber/50 p-5 text-[14.5px] font-medium text-paper flex gap-3.5 items-center"
                >
                  <div className="w-9 h-9 rounded-full border border-brand-amber bg-black flex items-center justify-center shrink-0">
                    <ItemIcon className="w-[16px] h-[16px] text-brand-green" />
                  </div>
                  {item}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}