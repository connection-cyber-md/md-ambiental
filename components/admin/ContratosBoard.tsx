"use client";

import { useState } from "react";
import { createContract, updateContractStatus, deleteContract } from "@/app/admin/contratos/actions";
import {
  PARTY_TYPES,
  PARTY_TYPE_LABEL,
  CONTRACT_STATUSES,
  CONTRACT_STATUS_LABEL,
  CONTRACT_STATUS_CLASSES,
} from "@/lib/contratos/constants";
import { SyntheticBadge } from "@/components/ui/SyntheticBadge";

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

const inputClasses =
  "w-full border border-ink/15 rounded-sm px-2.5 py-1.5 text-[13px] bg-white focus:outline-none focus:border-brand-amber";

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("pt-BR");
}

function ContractForm({
  companies,
  destinatarios,
  onDone,
}: {
  companies: Option[];
  destinatarios: Option[];
  onDone: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [partyType, setPartyType] = useState<(typeof PARTY_TYPES)[number]>(PARTY_TYPES[0]);

  return (
    <form
      className="grid grid-cols-2 gap-2 mb-4"
      action={async (formData) => {
        setPending(true);
        setError(null);
        const result = await createContract(formData);
        setPending(false);
        if ("error" in result) setError(result.error);
        else onDone();
      }}
    >
      <select
        name="party_type"
        value={partyType}
        onChange={(e) => setPartyType(e.target.value as (typeof PARTY_TYPES)[number])}
        className={`${inputClasses} col-span-2`}
      >
        {PARTY_TYPES.map((t) => (
          <option key={t} value={t}>
            {PARTY_TYPE_LABEL[t]}
          </option>
        ))}
      </select>

      {partyType === "gerador" ? (
        <select name="company_id" defaultValue="" required className={`${inputClasses} col-span-2`}>
          <option value="" disabled>
            Gerador
          </option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.razao_social}
            </option>
          ))}
        </select>
      ) : (
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
      )}

      <input type="date" name="start_date" required className={inputClasses} />
      <input type="date" name="end_date" placeholder="Fim (opcional)" className={inputClasses} />
      <input name="price_per_litro" placeholder="Preço por litro (R$, opcional)" className={inputClasses} />
      <input name="sla_hours" placeholder="SLA (horas, opcional)" className={inputClasses} />
      <select name="status" defaultValue="draft" className={inputClasses}>
        {CONTRACT_STATUSES.map((s) => (
          <option key={s} value={s}>
            {CONTRACT_STATUS_LABEL[s]}
          </option>
        ))}
      </select>
      <input name="notes" placeholder="Observações (opcional)" className={inputClasses} />

      <button
        type="submit"
        disabled={pending}
        className="font-mono text-[11px] uppercase tracking-[0.05em] bg-ink text-white border-[1.5px] border-brand-amber rounded-full px-3.5 py-1.5 disabled:opacity-50 col-span-2"
      >
        {pending ? "Salvando…" : "+ Contrato"}
      </button>
      {error && <p className="text-[12px] text-red-700 col-span-2">{error}</p>}
    </form>
  );
}

export function ContratosBoard({
  contracts,
  companies,
  destinatarios,
  showCreate,
  onCloseCreate,
}: {
  contracts: Contract[];
  companies: Option[];
  destinatarios: Option[];
  showCreate: boolean;
  onCloseCreate: () => void;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);

  const partyName = (c: Contract) => {
    if (c.party_type === "gerador") return companies.find((x) => x.id === c.company_id)?.razao_social ?? "—";
    return destinatarios.find((x) => x.id === c.destinatario_id)?.razao_social ?? "—";
  };

  async function handleStatusChange(id: string, status: string) {
    setBusyId(id);
    const result = await updateContractStatus(id, status);
    setBusyId(null);
    if ("error" in result) alert(result.error);
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este contrato? Essa ação não pode ser desfeita.")) return;
    setBusyId(id);
    const result = await deleteContract(id);
    setBusyId(null);
    if ("error" in result) alert(result.error);
  }

  return (
    <div>
      {showCreate && <ContractForm companies={companies} destinatarios={destinatarios} onDone={onCloseCreate} />}

      {contracts.length === 0 ? (
        <div className="bg-white border border-ink/10 p-8 text-[15px] text-steel">Nenhum contrato cadastrado ainda.</div>
      ) : (
        <div className="bg-white border border-ink/10 divide-y divide-ink/10">
          {contracts.map((c) => (
            <div key={c.id} className="p-4 flex items-start justify-between gap-6 flex-wrap">
              <div className="min-w-[240px]">
                <div className="text-[14.5px] font-medium text-ink">
                  {partyName(c)} <span className="text-[11.5px] text-steel font-normal">({PARTY_TYPE_LABEL[c.party_type]})</span>
                </div>
                <div className="text-[12px] text-steel mt-1.5">
                  {fmtDate(c.start_date)} — {fmtDate(c.end_date)}
                  {c.price_per_litro !== null && ` · R$ ${Number(c.price_per_litro).toFixed(2)}/L`}
                  {c.sla_hours !== null && ` · SLA ${c.sla_hours}h`}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {c.is_synthetic && <SyntheticBadge />}
                <select
                  value={c.status}
                  onChange={(e) => handleStatusChange(c.id, e.target.value)}
                  disabled={busyId === c.id}
                  className={`text-[11.5px] font-mono uppercase tracking-[0.04em] border rounded-full px-3 py-1 whitespace-nowrap bg-white disabled:opacity-40 ${
                    CONTRACT_STATUS_CLASSES[c.status] ?? "text-steel border-ink/15"
                  }`}
                >
                  {CONTRACT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {CONTRACT_STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleDelete(c.id)}
                  disabled={busyId === c.id}
                  aria-label="Excluir"
                  className="text-[15px] text-red-700 hover:text-red-900 disabled:opacity-40"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
