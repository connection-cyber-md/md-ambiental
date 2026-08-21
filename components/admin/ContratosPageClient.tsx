"use client";

import { useState } from "react";
import { KpiCard } from "@/components/ui/KpiCard";
import { ContextFooter } from "@/components/ui/ContextFooter";
import { ContratosBoard } from "@/components/admin/ContratosBoard";

type Option = { id: string; razao_social: string };
type Contract = {
  id: string;
  party_type: string;
  company_id: string | null;
  destinatario_id: string | null;
  start_date: string;
  end_date: string | null;
  price_per_litro: number | null;
  sla_hours: number | null;
  status: string;
  notes: string | null;
  is_synthetic?: boolean;
};

const buttonClasses =
  "font-mono text-[11.5px] uppercase tracking-[0.05em] border-[1.5px] rounded-full px-4 py-2 disabled:opacity-40 whitespace-nowrap";

export function ContratosPageClient({
  contracts,
  companies,
  destinatarios,
  kpis,
}: {
  contracts: Contract[];
  companies: Option[];
  destinatarios: Option[];
  kpis: { total: string; active: string; avgPrice: string };
}) {
  const [showCreate, setShowCreate] = useState(false);
  const canCreate = companies.length > 0 || destinatarios.length > 0;

  return (
    <div>
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-[28px] text-black">Contratos</h1>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => setShowCreate((v) => !v)}
            disabled={!canCreate}
            title={canCreate ? undefined : "Cadastre um gerador ou destinatário primeiro"}
            className={`${buttonClasses} bg-ink text-white border-brand-amber`}
          >
            {showCreate ? "Fechar" : "+ Novo contrato"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        <KpiCard label="Contratos" value={kpis.total} borderClassName="border-ink" />
        <KpiCard label="Ativos" value={kpis.active} borderClassName="border-brand-green" />
        <KpiCard label="Preço médio" value={kpis.avgPrice} borderClassName="border-brand-amber" />
      </div>

      <ContratosBoard
        contracts={contracts}
        companies={companies}
        destinatarios={destinatarios}
        showCreate={showCreate}
        onCloseCreate={() => setShowCreate(false)}
      />

      <ContextFooter>
        <span>Contratos: {kpis.total}</span>
        <span>Ativos: {kpis.active}</span>
        <span>Preço médio: {kpis.avgPrice}</span>
      </ContextFooter>
    </div>
  );
}
