import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata = {
  title: "Dashboards Executivos & BI | MD Ambiental",
  description: "Painel de inteligência de negócios, volumetria de OLUC e indicadores estratégicos.",
};

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

  // Consultas paralelas para consolidação de BI, Indicadores Executivos e Métricas do Tenant
  const [collectionsRes, financialRes, vehiclesRes, driversRes, companiesRes, metricsRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase.from("collections" as any).select("id, status, volume_litros, collection_date"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase.from("financial_entries" as any).select("id, type, amount, status, entry_date"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase.from("vehicles" as any).select("id, status, capacity_liters"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase.from("drivers" as any).select("id, status"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase.from("companies" as any).select("id, status, is_synthetic"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase.from("dashboards_metrics" as any)
      .select("id, metric_key, metric_value, scope, period_start, period_end")
      .order("period_start", { ascending: false }),
  ]);

  const hasError = Boolean(
    collectionsRes.error || financialRes.error || vehiclesRes.error || driversRes.error || companiesRes.error
  );

  const debugErrors = [
    collectionsRes.error,
    financialRes.error,
    vehiclesRes.error,
    driversRes.error,
    companiesRes.error,
    metricsRes.error,
  ]
    .filter(Boolean)
    .map((e) => `${e!.code ?? "?"}: ${e!.message}`);

  if (hasError) {
    console.error("[/admin/dashboards] query errors:", debugErrors);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const collections = (collectionsRes.data ?? []) as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const financial = (financialRes.data ?? []) as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vehicles = (vehiclesRes.data ?? []) as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const drivers = (driversRes.data ?? []) as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const companies = (companiesRes.data ?? []) as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const metrics = (metricsRes.data ?? []) as any[];

  // Cálculos de BI & KPIs Executivos
  const totalVolumeLiters = collections.reduce((acc, curr) => acc + Number(curr.volume_litros || 0), 0);
  const totalColetasRealizadas = collections.filter((c) => c.status === "completed" || c.status === "realizada").length;
  
  const totalReceitas = financial
    .filter((f) => f.type === "receita" && f.status === "paid")
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const totalDespesas = financial
    .filter((f) => f.type === "despesa" && f.status === "paid")
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const saldoOperacional = totalReceitas - totalDespesas;

  const frotaAtiva = vehicles.filter((v) => v.status === "active" || v.status === "disponivel").length;
  const motoristasAtivos = drivers.filter((d) => d.status === "active").length;
  const geradoresAtivos = companies.filter((c) => c.status === "active").length;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Cabeçalho Executivo */}
      <div className="flex justify-between items-center mb-8 border-b border-ink/10 pb-4">
        <div>
          <span className="font-mono text-[12px] uppercase tracking-wider text-brand-green-deep block mb-1">
            Business Intelligence & Governança
          </span>
          <h1 className="font-display text-[28px] text-ink">Dashboards Executivos & BI</h1>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/financeiro"
            className="bg-paper border border-ink/20 px-4 py-2 rounded text-[13px] font-mono hover:bg-ink hover:text-white transition-colors"
          >
            Ver Financeiro →
          </Link>
          <Link
            href="/admin"
            className="bg-paper border border-ink/20 px-4 py-2 rounded text-[13px] font-mono hover:bg-ink hover:text-white transition-colors"
          >
            Painel Principal
          </Link>
        </div>
      </div>

      {hasError && (
        <div className="bg-white border border-ink/10 p-6 text-[14px] text-brand-amber-deep mb-8 font-mono">
          Aviso: Alguns indicadores podem estar parciais devido a restrições em tabelas de suporte. Detalhes: {debugErrors.join(" | ")}
        </div>
      )}

      {/* Grid de KPIs Estratégicos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-lg border border-ink/10 shadow-xs">
          <span className="font-mono text-[11px] uppercase text-steel block mb-1">Volumetria Total OLUC</span>
          <div className="font-display text-[28px] text-brand-green-deep">
            {totalVolumeLiters.toLocaleString("pt-BR")} <span className="text-[14px] font-mono">Litros</span>
          </div>
          <p className="text-[12px] text-steel mt-2">Óleo lubrificante coletado e destinado.</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-ink/10 shadow-xs">
          <span className="font-mono text-[11px] uppercase text-steel block mb-1">Saldo Operacional (Caixa)</span>
          <div className={`font-display text-[28px] ${saldoOperacional >= 0 ? 'text-ink' : 'text-amber-700'}`}>
            R$ {saldoOperacional.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[12px] text-steel mt-2">Receitas pagas menos despesas quitadas.</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-ink/10 shadow-xs">
          <span className="font-mono text-[11px] uppercase text-steel block mb-1">Operações Concluídas</span>
          <div className="font-display text-[28px] text-ink">
            {totalColetasRealizadas} <span className="text-[14px] font-mono">Coletas</span>
          </div>
          <p className="text-[12px] text-steel mt-2">Ordens de serviço executadas com sucesso.</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-ink/10 shadow-xs">
          <span className="font-mono text-[11px] uppercase text-steel block mb-1">Ecossistema Ativo</span>
          <div className="font-display text-[28px] text-brand-green-deep">
            {geradoresAtivos} <span className="text-[14px] font-mono">Geradores</span>
          </div>
          <p className="text-[12px] text-steel mt-2">{frotaAtiva} veículos e {motoristasAtivos} motoristas.</p>
        </div>
      </div>

      {/* Seção de Métricas por Escopo (dashboards_metrics) */}
      <div className="mb-10">
        <h2 className="font-mono text-[13px] uppercase tracking-wider text-ink mb-4 pb-2 border-b border-ink/10">
          Métricas Corporativas por Escopo
        </h2>
        {metrics.length === 0 ? (
          <div className="bg-white border border-ink/10 p-8 text-[15px] text-steel rounded-lg">
            Nenhuma métrica cadastrada ainda na tabela <code className="bg-paper px-1.5 py-0.5 font-mono text-[13px]">dashboards_metrics</code>. As linhas aparecerão automaticamente assim que populadas.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {SCOPES.map((scope) => {
              const scopeMetrics = metrics.filter((m) => m.scope === scope);
              if (scopeMetrics.length === 0) return null;

              return (
                <div key={scope} className="bg-white border-[1.5px] border-ink/20 rounded-lg p-5 shadow-xs">
                  <h3 className="font-mono text-[11.5px] uppercase tracking-[0.06em] text-ink mb-3">
                    {SCOPE_LABEL[scope] ?? scope}
                  </h3>
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

      {/* Seção de Análise Analítica & Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white border border-ink/10 rounded-lg p-6 shadow-xs">
          <h2 className="font-mono text-[13px] uppercase tracking-wider text-ink mb-4 pb-2 border-b border-ink/10">
            Eficiência de Frota & Logística
          </h2>
          <div className="space-y-4 text-[14px] text-steel">
            <div className="flex justify-between items-center">
              <span>Caminhões-Tanque em Operação:</span>
              <span className="font-mono font-semibold text-ink">{frotaAtiva} / {vehicles.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Motoristas Escalados:</span>
              <span className="font-mono font-semibold text-ink">{motoristasAtivos} / {drivers.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Taxa de Ocupação da Frota:</span>
              <span className="font-mono font-semibold text-brand-green-deep">
                {vehicles.length > 0 ? `${((frotaAtiva / vehicles.length) * 100).toFixed(1)}%` : "0%"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-ink/10 rounded-lg p-6 shadow-xs">
          <h2 className="font-mono text-[13px] uppercase tracking-wider text-ink mb-4 pb-2 border-b border-ink/10">
            Resumo Financeiro Consolidado
          </h2>
          <div className="space-y-4 text-[14px] text-steel">
            <div className="flex justify-between items-center">
              <span>Total de Entradas (Receitas):</span>
              <span className="font-mono font-semibold text-brand-green-deep">
                R$ {totalReceitas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Total de Saídas (Despesas):</span>
              <span className="font-mono font-semibold text-amber-700">
                R$ {totalDespesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-ink/10 pt-3">
              <span className="font-semibold text-ink">Balanço Líquido:</span>
              <span className={`font-mono font-bold ${saldoOperacional >= 0 ? 'text-brand-green-deep' : 'text-amber-700'}`}>
                R$ {saldoOperacional.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}