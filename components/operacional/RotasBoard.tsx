"use client";

import { useState } from "react";
import { createCollectionOS, cancelCollectionOS } from "@/app/operacional/rotas/actions";

type Company = { id: string; razao_social: string; address_bairro: string | null; address_cidade: string | null };
type Driver = { id: string; profiles: { full_name: string } | { full_name: string }[] | null };

type CollectionOS = {
  id: string;
  collection_date: string;
  notes: string | null;
  companies: Company | Company[] | null;
  drivers: { profiles: { full_name: string } | { full_name: string }[] | null } | { profiles: { full_name: string } | { full_name: string }[] | null }[] | null;
};

const inputClasses =
  "w-full border border-ink/15 rounded-sm px-2.5 py-1.5 text-[13px] bg-white focus:outline-none focus:border-brand-amber";

function driverName(d: Driver) {
  const p = Array.isArray(d.profiles) ? d.profiles[0] : d.profiles;
  return p?.full_name ?? "Motorista";
}

export function RotasBoard({ companies, drivers, pending }: { companies: Company[]; drivers: Driver[]; pending: CollectionOS[] }) {
  const [error, setError] = useState<string | null>(null);
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  async function handleCancel(id: string) {
    if (!confirm("Cancelar esta ordem de serviço?")) return;
    setCancelingId(id);
    const result = await cancelCollectionOS(id);
    setCancelingId(null);
    if ("error" in result) alert(result.error);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="bg-white border border-ink/10 p-6 lg:col-span-1 h-fit">
        <div className="text-[14.5px] font-medium text-ink mb-4">Agendar nova coleta</div>
        <form
          className="space-y-3"
          action={async (formData) => {
            setPendingSubmit(true);
            setError(null);
            const result = await createCollectionOS(formData);
            setPendingSubmit(false);
            if ("error" in result) setError(result.error);
          }}
        >
          <div>
            <label className="block text-[10.5px] text-steel mb-1">Cliente (gerador)</label>
            <select name="company_id" required className={inputClasses} defaultValue="">
              <option value="" disabled>
                Selecione o cliente…
              </option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.razao_social} {c.address_bairro ? `(${c.address_bairro})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10.5px] text-steel mb-1">Data da coleta</label>
            <input type="date" name="collection_date" required className={inputClasses} />
          </div>
          <div>
            <label className="block text-[10.5px] text-steel mb-1">Atribuir motorista (opcional)</label>
            <select name="driver_id" className={inputClasses} defaultValue="">
              <option value="">Sem atribuição ainda</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {driverName(d)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10.5px] text-steel mb-1">Observações</label>
            <textarea name="notes" rows={3} className={inputClasses} placeholder="Restrição de horário, coletar nos fundos…" />
          </div>
          {error && <p className="text-[12px] text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={pendingSubmit}
            className="w-full font-mono text-[11.5px] uppercase tracking-[0.05em] bg-ink text-brand-green border-[1.5px] border-brand-amber rounded-full px-4 py-2 disabled:opacity-50"
          >
            {pendingSubmit ? "Gerando…" : "Gerar ordem de serviço"}
          </button>
        </form>
      </div>

      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-mono text-[11.5px] uppercase tracking-[0.06em] text-steel">Coletas pendentes</h2>
          <span className="text-[11.5px] font-mono text-steel">{pending.length} OS abertas</span>
        </div>
        {pending.length === 0 ? (
          <div className="bg-white border border-ink/10 p-8 text-[15px] text-steel">Nenhuma ordem de serviço pendente.</div>
        ) : (
          <div className="bg-white border border-ink/10 divide-y divide-ink/10">
            {pending.map((os) => {
              const company = Array.isArray(os.companies) ? os.companies[0] : os.companies;
              const driverRow = Array.isArray(os.drivers) ? os.drivers[0] : os.drivers;
              const driverProfile = driverRow ? (Array.isArray(driverRow.profiles) ? driverRow.profiles[0] : driverRow.profiles) : null;
              return (
                <div key={os.id} className="p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="text-[14.5px] font-medium text-ink">{company?.razao_social ?? "Cliente"}</div>
                      <div className="text-[12.5px] text-steel mt-1">
                        {new Date(os.collection_date).toLocaleDateString("pt-BR")}
                        {" · "}
                        {company?.address_bairro}, {company?.address_cidade}
                        {" · "}
                        {driverProfile ? `motorista: ${driverProfile.full_name}` : "sem motorista atribuído"}
                      </div>
                      {os.notes && <div className="text-[12px] text-steel mt-1 italic">&quot;{os.notes}&quot;</div>}
                    </div>
                    <button
                      onClick={() => handleCancel(os.id)}
                      disabled={cancelingId === os.id}
                      className="font-mono text-[11px] uppercase tracking-[0.05em] border border-red-300 text-red-700 rounded-full px-3 py-1.5 disabled:opacity-40 whitespace-nowrap"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
