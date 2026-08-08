"use client";

import type { MonthlyPoint, ProjectedPoint } from "@/lib/financeiro/projection";

export function fmtCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtShort(v: number) {
  const sign = v < 0 ? "-" : "";
  const abs = Math.abs(v);
  if (abs >= 1000) return `${sign}R$${Math.round(abs / 1000)}k`;
  return `${sign}R$${Math.round(abs)}`;
}

const CHART_W = 900;
const CHART_H = 260;
const PAD_TOP = 14;
const PAD_BOTTOM = 34;
const PLOT_H = CHART_H - PAD_TOP - PAD_BOTTOM;

function ProjectionChart({ series, projected }: { series: MonthlyPoint[]; projected: ProjectedPoint[] }) {
  const totalMonths = series.length + projected.length;
  const slotW = CHART_W / totalMonths;

  const allValues = [
    0,
    ...series.flatMap((p) => [p.receita, p.despesa, p.saldoAcumulado]),
    ...projected.map((p) => p.saldoProjetado),
  ];
  const rawMax = Math.max(...allValues);
  const rawMin = Math.min(...allValues);
  const span = rawMax - rawMin || 1;
  const max = rawMax + span * 0.1;
  const min = rawMin - span * 0.1;

  const scaleY = (v: number) => PAD_TOP + PLOT_H - ((v - min) / (max - min)) * PLOT_H;
  const zeroY = scaleY(0);

  const barW = slotW * 0.28;

  const historicalLinePoints = series
    .map((p, i) => `${slotW * (i + 0.5)},${scaleY(p.saldoAcumulado)}`)
    .join(" ");

  const lastHistorical = series[series.length - 1];
  const projectedLinePoints = lastHistorical
    ? [
        `${slotW * (series.length - 0.5)},${scaleY(lastHistorical.saldoAcumulado)}`,
        ...projected.map((p, i) => `${slotW * (series.length + i + 0.5)},${scaleY(p.saldoProjetado)}`),
      ].join(" ")
    : "";

  return (
    <svg
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      className="w-full h-auto"
      role="img"
      aria-label="Gráfico de receita e despesa mensal, saldo acumulado realizado e projeção dos próximos meses"
    >
      <line x1={0} y1={zeroY} x2={CHART_W} y2={zeroY} stroke="#c3c2b7" strokeWidth={1} />

      {series.map((p, i) => {
        const cx = slotW * (i + 0.5);
        return (
          <g key={p.monthKey}>
            <rect
              x={cx - barW - 2}
              y={Math.min(scaleY(p.receita), zeroY)}
              width={barW}
              height={Math.abs(scaleY(p.receita) - zeroY)}
              fill="#2a78d6"
              rx={2}
            />
            <rect
              x={cx + 2}
              y={Math.min(scaleY(p.despesa), zeroY)}
              width={barW}
              height={Math.abs(scaleY(p.despesa) - zeroY)}
              fill="#e34948"
              rx={2}
            />
            <text x={cx} y={CHART_H - 10} textAnchor="middle" fontSize={11} fill="#898781">
              {p.label}
            </text>
          </g>
        );
      })}

      {projected.map((p, i) => (
        <text
          key={p.monthKey}
          x={slotW * (series.length + i + 0.5)}
          y={CHART_H - 10}
          textAnchor="middle"
          fontSize={11}
          fill="#ba7517"
        >
          {p.label}
        </text>
      ))}

      <polyline points={historicalLinePoints} fill="none" stroke="#0b0b0b" strokeWidth={2} />
      <polyline points={projectedLinePoints} fill="none" stroke="#0b0b0b" strokeWidth={2} strokeDasharray="5,4" />

      {series.map((p, i) => (
        <circle key={p.monthKey} cx={slotW * (i + 0.5)} cy={scaleY(p.saldoAcumulado)} r={3} fill="#0b0b0b" />
      ))}
      {projected.map((p, i) => (
        <circle
          key={p.monthKey}
          cx={slotW * (series.length + i + 0.5)}
          cy={scaleY(p.saldoProjetado)}
          r={3}
          fill="#ffffff"
          stroke="#0b0b0b"
          strokeWidth={2}
        />
      ))}

      <text x={4} y={PAD_TOP + 8} fontSize={10} fill="#898781">
        {fmtShort(max)}
      </text>
      <text x={4} y={PAD_TOP + PLOT_H} fontSize={10} fill="#898781">
        {fmtShort(min)}
      </text>
    </svg>
  );
}

// O botão que abre/fecha esta seção agora fica no cabeçalho da página
// (FinanceiroPageClient), não mais aqui — só o conteúdo do gráfico.
export function FinanceiroProjection({
  series,
  projected,
  open,
}: {
  series: MonthlyPoint[];
  projected: ProjectedPoint[];
  open: boolean;
}) {
  if (series.length < 2 || projected.length === 0 || !open) return null;

  const nextMonth = projected[0];

  return (
    <section className="mb-8">
      <div className="mt-4 bg-white border border-ink/10 rounded-lg p-5">
          <div className="flex flex-wrap gap-4 mb-4 text-[12px] text-steel">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#2a78d6]" /> Receita mensal
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#e34948]" /> Despesa mensal
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-[2px] bg-ink" /> Saldo acumulado (realizado)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-[2px] bg-ink" style={{ backgroundImage: "repeating-linear-gradient(90deg,#0b0b0b 0 4px,transparent 4px 7px)" }} />
              Saldo projetado
            </span>
          </div>

          <ProjectionChart series={series} projected={projected} />

          {nextMonth && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">
              <div className="bg-paper-dim rounded-lg p-3">
                <div className="text-[11px] text-steel mb-1">Saldo projetado ({nextMonth.label})</div>
                <div className="font-display text-[18px] text-ink">{fmtCurrency(nextMonth.saldoProjetado)}</div>
              </div>
              <div className="bg-paper-dim rounded-lg p-3">
                <div className="text-[11px] text-steel mb-1">Variação mensal projetada</div>
                <div className={`font-display text-[18px] ${nextMonth.netProjetado >= 0 ? "text-brand-green-deep" : "text-red-700"}`}>
                  {fmtCurrency(nextMonth.netProjetado)}
                </div>
              </div>
              <div className="bg-paper-dim rounded-lg p-3">
                <div className="text-[11px] text-steel mb-1">Horizonte da projeção</div>
                <div className="font-display text-[18px] text-ink">{projected.length} meses</div>
              </div>
            </div>
          )}

          <p className="text-[11.5px] text-steel mt-4">
            Projeção calculada por regressão linear simples sobre o saldo mensal dos últimos meses. É uma
            estimativa, não uma garantia de resultado futuro.
          </p>
        </div>
    </section>
  );
}
