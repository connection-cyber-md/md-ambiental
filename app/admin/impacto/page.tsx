import { createClient } from "@/lib/supabase/server";
import { ImpactMetricsBoard } from "@/components/admin/ImpactMetricsBoard";
import { syncAutoCollectionsMetrics } from "@/lib/impact/autoCollections";
import Link from "next/link";

export const metadata = {
  title: "Impacto Ambiental & Fechamento de Lotes | MD Ambiental",
  description: "Relatórios consolidados de sustentabilidade, métricas de OLUC e gestão de lotes.",
};

interface LotItem {
  id: string;
  lote_code: string;
  status: string;
  total_litros: number | null;
  created_at: string;
  destinatarios: {
    razao_social: string;
  } | null;
}

export default async function AdminImpactoPage() {
  const supabase = await createClient();

  // 1. Consulta das métricas de impacto existentes (Validadas)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const metricsRes = await supabase.from("impact_metrics" as any)
    .select("id, tenant_id, metric_key, label, unit, value, computation_mode, period_label, source, display_order, is_published")
    .order("display_order", { ascending: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const metrics = metricsRes.data ? await syncAutoCollectionsMetrics(supabase, metricsRes.data as any) : [];

  // 2. Consulta dos lotes de expedição e destinação de OLUC (Novo Módulo BPO)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawLots, error: lotsError } = await (supabase.from("lots" as any))
    .select("id, lote_code, status, total_litros, created_at, destinatarios(razao_social)")
    .order("created_at", { ascending: false });

  const lots = (rawLots as unknown as LotItem[]) || [];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Cabeçalho Institucional & BPO */}
      <div className="flex justify-between items-center mb-8 border-b border-ink/10 pb-4">
        <div>
          <span className="font-mono text-[12px] uppercase tracking-wider text-brand-green-deep block mb-1">
            BPO & Relatórios de Sustentabilidade
          </span>
          <h1 className="font-display text-[28px] text-ink">Impacto socioambiental & Lotes de OLUC</h1>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/expedicao"
            className="bg-paper border border-ink/20 px-4 py-2 rounded text-[13px] font-mono hover:bg-ink hover:text-white transition-colors"
          >
            Módulo de Expedição →
          </Link>
          <Link
            href="/admin"
            className="bg-paper border border-ink/20 px-4 py-2 rounded text-[13px] font-mono hover:bg-ink hover:text-white transition-colors"
          >
            ← Painel Principal
          </Link>
        </div>
      </div>

      <p className="text-[14px] text-steel mb-6">
        Métricas exibidas na home institucional. Só linhas marcadas como &quot;Publicar na home&quot; ficam visíveis para o
        público — o restante fica visível apenas aqui, como rascunho.
      </p>

      {metricsRes.error ? (
        <div className="bg-white border border-ink/10 p-8 text-[15px] text-steel mb-8">
          <p className="mb-2">Não foi possível carregar as métricas agora.</p>
          <p className="font-mono text-[12px] text-brand-amber-deep">
            {metricsRes.error.code}: {metricsRes.error.message}
          </p>
        </div>
      ) : (
        <div className="mb-12">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <ImpactMetricsBoard metrics={metrics as any} />
        </div>
      )}

      {/* Seção de Lotes Consolidados para Expedição / Refinaria */}
      <div className="mt-10">
        <h2 className="font-display text-[22px] text-ink mb-4">Fechamento de Lotes & Expedição</h2>
        <div className="bg-white border border-ink/10 rounded-lg overflow-hidden shadow-xs">
          <div className="p-4 bg-paper border-b border-ink/10 font-mono text-[13px] font-medium text-ink flex justify-between items-center">
            <span>Lotes Consolidados para Expedição / Refinaria</span>
            <span className="text-steel">Total Registrado: {lots.length}</span>
          </div>

          {lotsError ? (
            <div className="p-6 text-red-700 font-mono text-[13px]">
              Erro ao carregar os lotes de impacto. Verifique a conexão com o banco de dados.
            </div>
          ) : (
            <div className="divide-y divide-ink/10">
              {lots.map((lot) => (
                <div key={lot.id} className="p-4 flex items-center justify-between hover:bg-paper/50 transition-colors">
                  <div>
                    <div className="font-mono text-[15px] font-semibold text-ink mb-0.5">
                      {lot.lote_code || "Lote sem identificação"}
                    </div>
                    <div className="text-[12px] text-steel font-mono">
                      Destinatário Final: {lot.destinatarios?.razao_social || "Refinaria / Central de Rerrefino"}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="font-mono text-[14px] font-semibold text-brand-green-deep">
                        {lot.total_litros ? `${lot.total_litros.toLocaleString("pt-BR")} L` : "Volume não consolidado"}
                      </div>
                      <div className="text-[11px] font-mono text-steel uppercase">
                        Status: {lot.status}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {lots.length === 0 && (
                <div className="text-center py-16 text-steel font-mono text-[13px]">
                  Nenhum lote de expedição registrado até o momento.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}