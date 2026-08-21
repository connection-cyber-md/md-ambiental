"use client";

import { useState } from "react";
import { createExpedition, updateExpeditionStatus, addExpeditionLot, attachReceiptCertificate } from "@/app/admin/expedicao/actions";
import {
  EXPEDITION_STATUSES,
  EXPEDITION_STATUS_LABEL,
  EXPEDITION_STATUS_CLASSES,
  EXPEDITION_EDITABLE_STATUSES,
} from "@/lib/expedicao/constants";
import { SyntheticBadge } from "@/components/ui/SyntheticBadge";

type Destinatario = { id: string; razao_social: string };
type Vehicle = { id: string; plate: string };
type Driver = { id: string; profiles: { full_name: string } | { full_name: string }[] | null };
type OpenLot = {
  id: string;
  tank_id: string;
  code: string;
  volume_litros: number;
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

const inputClasses =
  "w-full border border-ink/15 rounded-sm px-2.5 py-1.5 text-[13px] bg-white focus:outline-none focus:border-brand-amber";

function driverName(d: Driver) {
  const p = Array.isArray(d.profiles) ? d.profiles[0] : d.profiles;
  return p?.full_name ?? "—";
}

function lotTankCode(l: OpenLot) {
  const t = Array.isArray(l.tanks) ? l.tanks[0] : l.tanks;
  return t?.code ?? "—";
}

function receiptDoc(exp: Expedition) {
  return Array.isArray(exp.receipt_document) ? exp.receipt_document[0] : exp.receipt_document;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

function ExpeditionForm({
  destinatarios,
  vehicles,
  drivers,
  onDone,
}: {
  destinatarios: Destinatario[];
  vehicles: Vehicle[];
  drivers: Driver[];
  onDone: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="grid grid-cols-2 gap-2 mb-4"
      action={async (formData) => {
        setPending(true);
        setError(null);
        const result = await createExpedition(formData);
        setPending(false);
        if ("error" in result) setError(result.error);
        else onDone();
      }}
    >
      <select name="destinatario_id" defaultValue="" required className={`${inputClasses} col-span-2`}>
        <option value="" disabled>
          Destinatário
        </option>
        {destinatarios.map((d) => (
          <option key={d.id} value={d.id}>
            {d.razao_social}
          </option>
        ))}
      </select>
      <input type="date" name="expedition_date" required className={inputClasses} />
      <select name="vehicle_id" defaultValue="" className={inputClasses}>
        <option value="">Veículo (opcional)</option>
        {vehicles.map((v) => (
          <option key={v.id} value={v.id}>
            {v.plate}
          </option>
        ))}
      </select>
      <select name="driver_id" defaultValue="" className={`${inputClasses} col-span-2`}>
        <option value="">Motorista (opcional)</option>
        {drivers.map((d) => (
          <option key={d.id} value={d.id}>
            {driverName(d)}
          </option>
        ))}
      </select>
      <input name="notes" placeholder="Observações (opcional)" className={`${inputClasses} col-span-2`} />
      <button
        type="submit"
        disabled={pending || destinatarios.length === 0}
        title={destinatarios.length === 0 ? "Cadastre um destinatário primeiro" : undefined}
        className="font-mono text-[11px] uppercase tracking-[0.05em] bg-ink text-white border-[1.5px] border-brand-amber rounded-full px-3.5 py-1.5 disabled:opacity-50 col-span-2"
      >
        {pending ? "Criando…" : "+ Expedição"}
      </button>
      {error && <p className="text-[12px] text-red-700 col-span-2">{error}</p>}
    </form>
  );
}

function AddLotForm({ expeditionId, openLots, onDone }: { expeditionId: string; openLots: OpenLot[]; onDone: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="grid grid-cols-3 gap-2 mt-2 mb-1"
      action={async (formData) => {
        setPending(true);
        setError(null);
        const result = await addExpeditionLot(formData);
        setPending(false);
        if ("error" in result) setError(result.error);
        else onDone();
      }}
    >
      <input type="hidden" name="expedition_id" value={expeditionId} />
      <select name="lot_id" defaultValue="" required className={`${inputClasses} col-span-2`}>
        <option value="" disabled>
          Lote disponível
        </option>
        {openLots.map((l) => (
          <option key={l.id} value={l.id}>
            {l.code} — {lotTankCode(l)} ({Number(l.volume_litros).toLocaleString("pt-BR")} L)
          </option>
        ))}
      </select>
      <input name="volume_litros" placeholder="Volume (L)" required className={inputClasses} />
      <button
        type="submit"
        disabled={pending || openLots.length === 0}
        title={openLots.length === 0 ? "Não há lotes abertos com saldo" : undefined}
        className="font-mono text-[10.5px] uppercase tracking-[0.05em] bg-white text-ink border border-ink/15 rounded-full px-3 py-1.5 disabled:opacity-50 col-span-3"
      >
        {pending ? "Adicionando…" : "+ Compor lote nesta expedição"}
      </button>
      {error && <p className="text-[12px] text-red-700 col-span-3">{error}</p>}
    </form>
  );
}

function CertificateForm({ expeditionId, onDone }: { expeditionId: string; onDone: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="flex flex-wrap items-center gap-2 mt-2"
      action={async (formData) => {
        setPending(true);
        setError(null);
        const result = await attachReceiptCertificate(formData);
        setPending(false);
        if ("error" in result) setError(result.error);
        else onDone();
      }}
    >
      <input type="hidden" name="expedition_id" value={expeditionId} />
      <input name="document_number" placeholder="Nº do certificado (opcional)" className={`${inputClasses} w-[220px]`} />
      <input type="date" name="issue_date" className={`${inputClasses} w-[160px]`} />
      <button
        type="submit"
        disabled={pending}
        className="font-mono text-[10.5px] uppercase tracking-[0.05em] bg-ink text-white border-[1.5px] border-brand-amber rounded-full px-3 py-1.5 disabled:opacity-50"
      >
        {pending ? "Anexando…" : "Anexar CRC"}
      </button>
      {error && <p className="text-[12px] text-red-700 w-full">{error}</p>}
    </form>
  );
}

export function ExpedicaoBoard({
  destinatarios,
  expeditions,
  expeditionLots,
  lots,
  openLots,
  vehicles,
  drivers,
  showCreate,
  onCloseCreate,
}: {
  destinatarios: Destinatario[];
  expeditions: Expedition[];
  expeditionLots: ExpeditionLot[];
  lots: { id: string; code: string }[];
  openLots: OpenLot[];
  vehicles: Vehicle[];
  drivers: Driver[];
  showCreate: boolean;
  onCloseCreate: () => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const destinatarioName = (id: string) => destinatarios.find((d) => d.id === id)?.razao_social ?? "—";
  const lotCode = (id: string) => lots.find((l) => l.id === id)?.code ?? id.slice(0, 8);
  const lotsFor = (expeditionId: string) => expeditionLots.filter((el) => el.expedition_id === expeditionId);

  async function handleStatusChange(id: string, status: string) {
    setBusyId(id);
    const result = await updateExpeditionStatus(id, status);
    setBusyId(null);
    if ("error" in result) alert(result.error);
  }

  return (
    <div>
      {showCreate && <ExpeditionForm destinatarios={destinatarios} vehicles={vehicles} drivers={drivers} onDone={onCloseCreate} />}

      {expeditions.length === 0 ? (
        <div className="bg-white border border-ink/10 p-8 text-[15px] text-steel">Nenhuma expedição cadastrada ainda.</div>
      ) : (
        <div className="bg-white border border-ink/10 divide-y divide-ink/10">
          {expeditions.map((exp) => {
            const composition = lotsFor(exp.id);
            const editable = EXPEDITION_EDITABLE_STATUSES.includes(exp.status);
            const expanded = expandedId === exp.id;

            return (
              <div key={exp.id} className="p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="text-[14.5px] font-medium text-ink">{destinatarioName(exp.destinatario_id)}</div>
                    <div className="text-[12px] text-steel mt-1.5">
                      {fmtDate(exp.expedition_date)} · {Number(exp.total_volume_litros ?? 0).toLocaleString("pt-BR")} L ·{" "}
                      {composition.length} lote(s)
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {exp.is_synthetic && <SyntheticBadge />}
                    <select
                      value={exp.status}
                      onChange={(e) => handleStatusChange(exp.id, e.target.value)}
                      disabled={busyId === exp.id}
                      className={`text-[11.5px] font-mono uppercase tracking-[0.04em] border rounded-full px-3 py-1 whitespace-nowrap bg-white disabled:opacity-40 ${
                        EXPEDITION_STATUS_CLASSES[exp.status] ?? "text-steel border-ink/15"
                      }`}
                    >
                      {EXPEDITION_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {EXPEDITION_STATUS_LABEL[s]}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setExpandedId(expanded ? null : exp.id)}
                      className="text-[11px] font-mono uppercase tracking-[0.04em] text-steel hover:text-ink"
                    >
                      {expanded ? "fechar" : "compor lotes"}
                    </button>
                  </div>
                </div>

                {exp.status === "delivered" && !exp.receipt_document_id && (
                  <CertificateForm expeditionId={exp.id} onDone={() => {}} />
                )}
                {exp.receipt_document_id && (
                  <p className="text-[11.5px] text-brand-green-deep mt-2">
                    CRC anexado{receiptDoc(exp)?.document_number ? ` — nº ${receiptDoc(exp)!.document_number}` : ""}
                    {receiptDoc(exp)?.verification_code ? ` · código ${receiptDoc(exp)!.verification_code}` : ""}
                  </p>
                )}

                {expanded && (
                  <div className="mt-3 bg-paper-dim border border-ink/10 rounded-sm p-3">
                    {composition.length === 0 ? (
                      <p className="text-[12.5px] text-steel mb-1">Nenhum lote composto nesta expedição ainda.</p>
                    ) : (
                      <div className="flex flex-col gap-1 mb-1">
                        {composition.map((c) => (
                          <div key={c.id} className="text-[12.5px] text-steel flex justify-between">
                            <span>lote {lotCode(c.lot_id)}</span>
                            <span className="font-mono">{Number(c.volume_litros).toLocaleString("pt-BR")} L</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {editable ? (
                      <AddLotForm expeditionId={exp.id} openLots={openLots} onDone={() => {}} />
                    ) : (
                      <p className="text-[11.5px] text-steel">
                        Composição travada — expedição já está &ldquo;{EXPEDITION_STATUS_LABEL[exp.status]}&rdquo;.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
