"use client";

import { useState } from "react";
import { createMaintenance, deleteMaintenance } from "@/app/operacional/frota/actions";

type Vehicle = { id: string; plate: string; model: string | null };

type Maintenance = {
  id: string;
  vehicle_id: string;
  maintenance_type: string;
  description: string | null;
  cost: number;
  maintenance_date: string;
  vehicles: { plate: string } | { plate: string }[] | null;
};

const TYPE_LABEL: Record<string, string> = {
  oleo: "Troca de óleo",
  pneu: "Pneus",
  lavagem: "Lavagem",
  mecanica: "Mecânica geral",
  documento: "Taxas / documentos",
};

const inputClasses =
  "w-full border border-ink/15 rounded-sm px-2.5 py-1.5 text-[13px] bg-white focus:outline-none focus:border-brand-amber";

function MaintenanceForm({ vehicles, onCancel }: { vehicles: Vehicle[]; onCancel: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="bg-paper-dim border border-ink/10 rounded-sm p-4 mb-3"
      action={async (formData) => {
        setPending(true);
        setError(null);
        const result = await createMaintenance(formData);
        setPending(false);
        if ("error" in result) setError(result.error);
        else onCancel();
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-[10.5px] text-steel mb-1">Veículo</label>
          <select name="vehicle_id" required className={inputClasses} defaultValue="">
            <option value="" disabled>
              Selecione a placa…
            </option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.plate} {v.model ? `(${v.model})` : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10.5px] text-steel mb-1">Tipo</label>
          <select name="maintenance_type" required className={inputClasses} defaultValue="oleo">
            {Object.entries(TYPE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10.5px] text-steel mb-1">Custo (R$)</label>
          <input type="number" step="0.01" name="cost" required className={inputClasses} placeholder="0,00" />
        </div>
        <div>
          <label className="block text-[10.5px] text-steel mb-1">Data</label>
          <input
            type="date"
            name="maintenance_date"
            required
            defaultValue={new Date().toISOString().slice(0, 10)}
            className={inputClasses}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-[10.5px] text-steel mb-1">Descrição (opcional)</label>
          <input name="description" className={inputClasses} placeholder="Detalhes do serviço…" />
        </div>
      </div>

      {error && <p className="text-[12px] text-red-700 mb-2">{error}</p>}

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="font-mono text-[11px] uppercase tracking-[0.05em] border border-ink/15 rounded-full px-3.5 py-1.5"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pending}
          className="font-mono text-[11px] uppercase tracking-[0.05em] bg-ink text-white border-[1.5px] border-brand-amber rounded-full px-3.5 py-1.5 disabled:opacity-50"
        >
          {pending ? "Salvando…" : "Salvar"}
        </button>
      </div>
    </form>
  );
}

export function FrotaBoard({ vehicles, maintenances }: { vehicles: Vehicle[]; maintenances: Maintenance[] }) {
  const [showCreate, setShowCreate] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Excluir este lançamento de manutenção?")) return;
    setDeletingId(id);
    const result = await deleteMaintenance(id);
    setDeletingId(null);
    if ("error" in result) alert(result.error);
  }

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="font-mono text-[11.5px] uppercase tracking-[0.05em] bg-ink text-white border-[1.5px] border-brand-amber rounded-full px-4 py-2"
        >
          {showCreate ? "Fechar" : "+ Lançar despesa"}
        </button>
      </div>

      {showCreate && <MaintenanceForm vehicles={vehicles} onCancel={() => setShowCreate(false)} />}

      {maintenances.length === 0 ? (
        <div className="bg-white border border-ink/10 p-8 text-[15px] text-steel">
          Nenhuma despesa registrada ainda.
        </div>
      ) : (
        <div className="bg-white border border-ink/10 divide-y divide-ink/10">
          {maintenances.map((m) => {
            const vehicle = Array.isArray(m.vehicles) ? m.vehicles[0] : m.vehicles;
            return (
              <div key={m.id} className="p-4 flex items-center justify-between gap-6 flex-wrap">
                <div>
                  <div className="text-[14.5px] font-medium text-ink">
                    {TYPE_LABEL[m.maintenance_type] ?? m.maintenance_type} · {vehicle?.plate ?? "—"}
                  </div>
                  <div className="text-[12px] text-steel mt-1">
                    {new Date(m.maintenance_date).toLocaleDateString("pt-BR")}
                    {m.description && ` · ${m.description}`}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[14px] font-medium text-ink whitespace-nowrap">
                    {m.cost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                  <button
                    onClick={() => handleDelete(m.id)}
                    disabled={deletingId === m.id}
                    aria-label="Excluir"
                    className="text-[15px] text-red-700 hover:text-red-900 disabled:opacity-40"
                  >
                    🗑
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
