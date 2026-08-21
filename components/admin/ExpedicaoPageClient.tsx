"use client";

import { useState } from "react";
import { KpiCard } from "@/components/ui/KpiCard";
import { ContextFooter } from "@/components/ui/ContextFooter";
import { ExpedicaoDestinatarios } from "@/components/admin/ExpedicaoDestinatarios";
import { ExpedicaoBoard } from "@/components/admin/ExpedicaoBoard";

type Destinatario = {
  id: string;
  cnpj: string;
  razao_social: string;
  nome_fantasia: string | null;
  authorization_number: string | null;
  authorization_expiry_date: string | null;
  address_cidade: string | null;
  address_uf: string | null;
};
type Vehicle = { id: string; plate: string };
type Driver = { id: string; profiles: { full_name: string } | { full_name: string }[] | null };
type Lot = {
  id: string;
  tank_id: string;
  code: string;
  volume_litros: number;
  status: string;
  tanks: { code: string } | { code: string }[] | null;
};
type ReceiptDocument = { document_number: string | null; verification_code: string | null; issue_date: string | null };
type Expedition = {
  id: string;
  destinatario_id: string;
  vehicle_id: string | null;
  driver_id: string | null;
  expedition_date: string;
  total_volume_litros: number | null;
  status: string;
  notes: string | null;
  is_synthetic?: boolean;
  receipt_document_id: string | null;
  receipt_document: ReceiptDocument | ReceiptDocument[] | null;
};
type ExpeditionLot = { id: string; expedition_id: string; lot_id: string; volume_litros: number };

const buttonClasses =
  "font-mono text-[11.5px] uppercase tracking-[0.05em] border-[1.5px] rounded-full px-4 py-2 disabled:opacity-40 whitespace-nowrap";

export function ExpedicaoPageClient({
  destinatarios,
  expeditions,
  expeditionLots,
  lots,
  openLots,
  vehicles,
  drivers,
  kpis,
}: {
  destinatarios: Destinatario[];
  expeditions: Expedition[];
  expeditionLots: ExpeditionLot[];
  lots: Lot[];
  openLots: Lot[];
  vehicles: Vehicle[];
  drivers: Driver[];
  kpis: { totalExpedited: string; inTransit: string; awaitingReconciliation: string; expeditionsCount: string };
}) {
  const [destinatariosOpen, setDestinatariosOpen] = useState(destinatarios.length === 0);
  const [showCreate, setShowCreate] = useState(false);
  const canCreate = destinatarios.length > 0;

  return (
    <div>
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-[28px] text-black">Expedição</h1>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => setDestinatariosOpen((v) => !v)}
            className={`${buttonClasses} bg-white text-ink border-ink/15`}
          >
            {destinatariosOpen ? "Fechar destinatários" : "Destinatários"}
          </button>
          <button
            onClick={() => setShowCreate((v) => !v)}
            disabled={!canCreate}
            title={canCreate ? undefined : "Cadastre um destinatário primeiro"}
            className={`${buttonClasses} bg-ink text-white border-brand-amber`}
          >
            {showCreate ? "Fechar" : "+ Nova expedição"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <KpiCard label="Total expedido" value={kpis.totalExpedited} borderClassName="border-ink" />
        <KpiCard label="Em trânsito" value={kpis.inTransit} borderClassName="border-brand-amber" />
        <KpiCard label="Aguardando conciliação" value={kpis.awaitingReconciliation} borderClassName="border-blue-600" />
        <KpiCard label="Expedições" value={kpis.expeditionsCount} borderClassName="border-ink" />
      </div>

      <ExpedicaoDestinatarios open={destinatariosOpen} destinatarios={destinatarios} />

      <ExpedicaoBoard
        destinatarios={destinatarios}
        expeditions={expeditions}
        expeditionLots={expeditionLots}
        lots={lots}
        openLots={openLots}
        vehicles={vehicles}
        drivers={drivers}
        showCreate={showCreate}
        onCloseCreate={() => setShowCreate(false)}
      />

      <ContextFooter>
        <span>Total expedido: {kpis.totalExpedited}</span>
        <span>Em trânsito: {kpis.inTransit}</span>
        <span>Aguardando conciliação: {kpis.awaitingReconciliation}</span>
        <span>Expedições: {kpis.expeditionsCount}</span>
      </ContextFooter>
    </div>
  );
}
