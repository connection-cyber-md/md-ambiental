"use client";

import { useState } from "react";
import { KpiCard } from "@/components/ui/KpiCard";
import { ContextFooter } from "@/components/ui/ContextFooter";
import { FinanceiroAccountsCategories } from "@/components/admin/FinanceiroAccountsCategories";
import { FinanceiroBoard } from "@/components/admin/FinanceiroBoard";
import { FinanceiroProjection, fmtCurrency } from "@/components/admin/FinanceiroProjection";
import type { MonthlyPoint, ProjectedPoint } from "@/lib/financeiro/projection";

type Account = { id: string; name: string; kind: string; bank_name: string | null; initial_balance: number };
type Category = { id: string; name: string; type: string };
type Entry = {
  id: string;
  account_id: string;
  category_id: string;
  type: string;
  description: string;
  amount: number;
  entry_date: string;
  due_date: string | null;
  status: string;
  is_synthetic?: boolean;
};

const buttonClasses =
  "font-mono text-[11.5px] uppercase tracking-[0.05em] border-[1.5px] rounded-full px-4 py-2 disabled:opacity-40 whitespace-nowrap";

export function FinanceiroPageClient({
  accounts,
  categories,
  entries,
  kpis,
  projection,
}: {
  accounts: Account[];
  categories: Category[];
  entries: Entry[];
  kpis: { saldoTotal: string; receitasMes: string; despesasMes: string; aPagar: string; aReceber: string };
  projection: { series: MonthlyPoint[]; projected: ProjectedPoint[] };
}) {
  const [accountsOpen, setAccountsOpen] = useState(accounts.length === 0 || categories.length === 0);
  const [showCreate, setShowCreate] = useState(false);
  const [projectionOpen, setProjectionOpen] = useState(false);
  const canCreate = accounts.length > 0 && categories.length > 0;

  const showProjectionButton = projection.series.length >= 2 && projection.projected.length > 0;
  const projectionTooltip = showProjectionButton
    ? `Baseado em ${projection.series.length} meses de histórico — saldo projetado em ${
        projection.projected.length
      } meses: ${fmtCurrency(projection.projected[projection.projected.length - 1]!.saldoProjetado)}`
    : "";

  return (
    <div>
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-[28px] text-black">Financeiro</h1>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => window.print()}
            className={`${buttonClasses} bg-white text-ink border-ink/15`}
          >
            Relatórios
          </button>
          <button
            onClick={() => setAccountsOpen((v) => !v)}
            className={`${buttonClasses} bg-white text-ink border-ink/15`}
          >
            {accountsOpen ? "Fechar contas" : "Contas e categorias"}
          </button>
          {showProjectionButton && (
            <div className="relative group">
              <button
                onClick={() => setProjectionOpen((v) => !v)}
                className={`${buttonClasses} bg-ink text-white border-brand-amber`}
              >
                {projectionOpen ? "Fechar projeção" : "Projeção"}
              </button>
              <div className="pointer-events-none absolute right-0 top-full mt-2 w-[280px] rounded-lg border border-brand-amber bg-ink text-white text-[12px] leading-relaxed p-3.5 opacity-0 scale-95 origin-top-right transition-all duration-150 group-hover:opacity-100 group-hover:scale-100 z-20">
                <strong className="text-brand-amber">Tendência</strong> — {projectionTooltip}
              </div>
            </div>
          )}
          <button
            onClick={() => setShowCreate((v) => !v)}
            disabled={!canCreate}
            title={canCreate ? undefined : "Cadastre ao menos uma conta e uma categoria primeiro"}
            className={`${buttonClasses} bg-ink text-white border-brand-amber`}
          >
            {showCreate ? "Fechar" : "+ Novo lançamento"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        <KpiCard label="Saldo total" value={kpis.saldoTotal} borderClassName="border-ink" />
        <KpiCard label="Receitas (mês)" value={kpis.receitasMes} borderClassName="border-blue-600" />
        <KpiCard label="Despesas (mês)" value={kpis.despesasMes} borderClassName="border-red-600" />
        <KpiCard label="Cta a pagar" value={kpis.aPagar} borderClassName="border-ink" />
        <KpiCard label="Cta a receber" value={kpis.aReceber} borderClassName="border-ink" />
      </div>

      <FinanceiroProjection series={projection.series} projected={projection.projected} open={projectionOpen} />

      <FinanceiroAccountsCategories open={accountsOpen} accounts={accounts} categories={categories} />

      <FinanceiroBoard
        entries={entries}
        accounts={accounts}
        categories={categories}
        showCreate={showCreate}
        onCloseCreate={() => setShowCreate(false)}
      />

      <ContextFooter>
        <span>Saldo total: {kpis.saldoTotal}</span>
        <span>Receitas (mês): {kpis.receitasMes}</span>
        <span>Despesas (mês): {kpis.despesasMes}</span>
        <span>Cta a pagar: {kpis.aPagar}</span>
        <span>Cta a receber: {kpis.aReceber}</span>
      </ContextFooter>
    </div>
  );
}
