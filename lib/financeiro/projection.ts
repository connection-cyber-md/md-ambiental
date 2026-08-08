// Fase 5 do módulo financeiro: agrega lançamentos pagos por mês e projeta os
// próximos meses por regressão linear simples sobre o saldo líquido mensal
// (receita - despesa). Método simples e auditável de propósito — nada de
// caixa-preta, só mínimos quadrados sobre os últimos meses disponíveis.

export type MonthlyEntry = {
  type: string;
  status: string;
  amount: number;
  entry_date: string;
  paid_date: string | null;
};

export type MonthlyPoint = {
  monthKey: string; // "2026-01"
  label: string; // "Jan/26"
  receita: number;
  despesa: number;
  net: number;
  saldoAcumulado: number;
};

export type ProjectedPoint = {
  monthKey: string;
  label: string;
  netProjetado: number;
  saldoProjetado: number;
};

const MONTH_LABEL = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function monthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-");
  const idx = Number(month) - 1;
  return `${MONTH_LABEL[idx] ?? month}/${year!.slice(2)}`;
}

export function buildMonthlySeries(entries: MonthlyEntry[], saldoInicial: number): MonthlyPoint[] {
  const paid = entries.filter((e) => e.status === "paid");

  const byMonth = new Map<string, { receita: number; despesa: number }>();
  for (const e of paid) {
    const date = e.paid_date ?? e.entry_date;
    const monthKey = date.slice(0, 7);
    const bucket = byMonth.get(monthKey) ?? { receita: 0, despesa: 0 };
    if (e.type === "receita") bucket.receita += Number(e.amount);
    else bucket.despesa += Number(e.amount);
    byMonth.set(monthKey, bucket);
  }

  const monthKeys = Array.from(byMonth.keys()).sort();

  let saldo = saldoInicial;
  const series: MonthlyPoint[] = [];
  for (const monthKey of monthKeys) {
    const bucket = byMonth.get(monthKey);
    if (!bucket) continue;
    const net = bucket.receita - bucket.despesa;
    saldo += net;
    series.push({
      monthKey,
      label: monthLabel(monthKey),
      receita: bucket.receita,
      despesa: bucket.despesa,
      net,
      saldoAcumulado: saldo,
    });
  }

  return series;
}

function linearRegression(values: number[]): { slope: number; intercept: number } {
  const n = values.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (let i = 0; i < n; i++) {
    const y = values[i] ?? 0;
    sumX += i;
    sumY += y;
    sumXY += i * y;
    sumXX += i * i;
  }
  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return { slope: 0, intercept: sumY / n };
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

function nextMonthKey(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  const y = year ?? 0;
  const m = month ?? 1;
  const next = m === 12 ? { y: y + 1, m: 1 } : { y, m: m + 1 };
  return `${next.y}-${String(next.m).padStart(2, "0")}`;
}

// Projeta os próximos `horizon` meses a partir da tendência do saldo líquido
// mensal (regressão sobre no máximo os últimos 6 meses disponíveis, pra não
// deixar meses muito antigos puxarem a reta). Retorna [] se não houver
// histórico suficiente (mínimo 2 meses) para uma tendência minimamente
// confiável.
export function projectNextMonths(series: MonthlyPoint[], horizon = 3): ProjectedPoint[] {
  if (series.length < 2) return [];

  const recent = series.slice(-6);
  const { slope, intercept } = linearRegression(recent.map((p) => p.net));

  const last = series[series.length - 1];
  if (!last) return [];

  let saldo = last.saldoAcumulado;
  let monthKey = last.monthKey;
  const projected: ProjectedPoint[] = [];

  for (let i = 0; i < horizon; i++) {
    const x = recent.length + i;
    const netProjetado = intercept + slope * x;
    saldo += netProjetado;
    monthKey = nextMonthKey(monthKey);
    projected.push({
      monthKey,
      label: `${monthLabel(monthKey)} (proj.)`,
      netProjetado,
      saldoProjetado: saldo,
    });
  }

  return projected;
}
