"use client";

import { useState } from "react";
import { KpiCard } from "@/components/ui/KpiCard";
import { ContextFooter } from "@/components/ui/ContextFooter";
import { EstoqueBasesTanks } from "@/components/admin/EstoqueBasesTanks";
import { EstoqueLotsMovements } from "@/components/admin/EstoqueLotsMovements";

type Base = { id: string; name: string; address_cidade: string | null; address_uf: string | null; capacity_total_litros: number | null };
type Tank = { id: string; base_id: string; code: string; capacity_litros: number; material_class: string | null; status: string };
type Lot = {
  id: string;
  tank_id: string;
  code: string;
  quality_classification: string | null;
  volume_litros: number;
  status: string;
  opened_at: string;
  is_synthetic?: boolean;
};
type Movement = {
  id: string;
  tank_id: string;
  lot_id: string | null;
  type: string;
  volume_litros: number;
  reason: string | null;
  created_at: string;
  is_synthetic?: boolean;
};

const buttonClasses =
  "font-mono text-[11.5px] uppercase tracking-[0.05em] border-[1.5px] rounded-full px-4 py-2 disabled:opacity-40 whitespace-nowrap";

export function EstoquePageClient({
  bases,
  tanks,
  lots,
  movements,
  kpis,
}: {
  bases: Base[];
  tanks: Tank[];
  lots: Lot[];
  movements: Movement[];
  kpis: { totalCapacity: string; totalStock: string; openLots: string; occupancyPct: string };
}) {
  const [structureOpen, setStructureOpen] = useState(bases.length === 0 || tanks.length === 0);
  const [showCreateLot, setShowCreateLot] = useState(false);
  const [showCreateMovement, setShowCreateMovement] = useState(false);
  const canOperate = tanks.length > 0;

  return (
    <div>
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-[28px] text-black">Estoque</h1>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => setStructureOpen((v) => !v)}
            className={`${buttonClasses} bg-white text-ink border-ink/15`}
          >
            {structureOpen ? "Fechar bases e tanques" : "Bases e tanques"}
          </button>
          <button
            onClick={() => setShowCreateLot((v) => !v)}
            disabled={!canOperate}
            title={canOperate ? undefined : "Cadastre um tanque primeiro"}
            className={`${buttonClasses} bg-white text-ink border-ink/15`}
          >
            {showCreateLot ? "Fechar" : "+ Lote"}
          </button>
          <button
            onClick={() => setShowCreateMovement((v) => !v)}
            disabled={!canOperate}
            title={canOperate ? undefined : "Cadastre um tanque primeiro"}
            className={`${buttonClasses} bg-ink text-white border-brand-amber`}
          >
            {showCreateMovement ? "Fechar" : "+ Movimentação"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <KpiCard label="Capacidade total" value={kpis.totalCapacity} borderClassName="border-ink" />
        <KpiCard label="Estoque atual" value={kpis.totalStock} borderClassName="border-blue-600" />
        <KpiCard label="Lotes abertos" value={kpis.openLots} borderClassName="border-ink" />
        <KpiCard label="Ocupação" value={kpis.occupancyPct} borderClassName="border-brand-amber" />
      </div>

      <EstoqueBasesTanks open={structureOpen} bases={bases} tanks={tanks} />

      <EstoqueLotsMovements
        tanks={tanks}
        lots={lots}
        movements={movements}
        showCreateLot={showCreateLot}
        showCreateMovement={showCreateMovement}
        onCloseCreateLot={() => setShowCreateLot(false)}
        onCloseCreateMovement={() => setShowCreateMovement(false)}
      />

      <ContextFooter>
        <span>Capacidade total: {kpis.totalCapacity}</span>
        <span>Estoque atual: {kpis.totalStock}</span>
        <span>Lotes abertos: {kpis.openLots}</span>
        <span>Ocupação: {kpis.occupancyPct}</span>
      </ContextFooter>
    </div>
  );
}
