"use client";

import { useState } from "react";
import { createBase, createTank, deactivateBase, updateTankStatus } from "@/app/admin/estoque/actions";
import { TANK_STATUSES, TANK_STATUS_LABEL } from "@/lib/estoque/constants";

type Base = { id: string; name: string; address_cidade: string | null; address_uf: string | null; capacity_total_litros: number | null };
type Tank = { id: string; base_id: string; code: string; capacity_litros: number; material_class: string | null; status: string };

const inputClasses =
  "w-full border border-ink/15 rounded-sm px-2.5 py-1.5 text-[13px] bg-white focus:outline-none focus:border-brand-amber";

function BaseForm({ onDone }: { onDone: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="grid grid-cols-2 gap-2 mb-3"
      action={async (formData) => {
        setPending(true);
        setError(null);
        const result = await createBase(formData);
        setPending(false);
        if ("error" in result) setError(result.error);
        else onDone();
      }}
    >
      <input name="name" placeholder="Nome (ex: Base Piracicaba)" required className={`${inputClasses} col-span-2`} />
      <input name="address_cidade" placeholder="Cidade" className={inputClasses} />
      <input name="address_uf" placeholder="UF" maxLength={2} className={inputClasses} />
      <input name="capacity_total_litros" placeholder="Capacidade total (L, opcional)" className={`${inputClasses} col-span-2`} />
      <button
        type="submit"
        disabled={pending}
        className="font-mono text-[11px] uppercase tracking-[0.05em] bg-ink text-white border-[1.5px] border-brand-amber rounded-full px-3.5 py-1.5 disabled:opacity-50 col-span-2"
      >
        {pending ? "Salvando…" : "+ Base"}
      </button>
      {error && <p className="text-[12px] text-red-700 col-span-2">{error}</p>}
    </form>
  );
}

function TankForm({ bases, onDone }: { bases: Base[]; onDone: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="grid grid-cols-2 gap-2 mb-3"
      action={async (formData) => {
        setPending(true);
        setError(null);
        const result = await createTank(formData);
        setPending(false);
        if ("error" in result) setError(result.error);
        else onDone();
      }}
    >
      <select name="base_id" defaultValue="" required className={`${inputClasses} col-span-2`}>
        <option value="" disabled>
          Base
        </option>
        {bases.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
      <input name="code" placeholder="Código (ex: T-01)" required className={inputClasses} />
      <input name="capacity_litros" placeholder="Capacidade (L)" required className={inputClasses} />
      <input name="material_class" placeholder="Classe de material (opcional)" className={`${inputClasses} col-span-2`} />
      <button
        type="submit"
        disabled={pending || bases.length === 0}
        title={bases.length === 0 ? "Cadastre uma base primeiro" : undefined}
        className="font-mono text-[11px] uppercase tracking-[0.05em] bg-ink text-white border-[1.5px] border-brand-amber rounded-full px-3.5 py-1.5 disabled:opacity-50 col-span-2"
      >
        {pending ? "Salvando…" : "+ Tanque"}
      </button>
      {error && <p className="text-[12px] text-red-700 col-span-2">{error}</p>}
    </form>
  );
}

export function EstoqueBasesTanks({ open, bases, tanks }: { open: boolean; bases: Base[]; tanks: Tank[] }) {
  const baseName = (id: string) => bases.find((b) => b.id === id)?.name ?? "—";

  async function handleDeactivateBase(id: string) {
    if (!confirm("Desativar esta base? Os tanques cadastrados permanecem, mas ela deixa de aparecer no cadastro de novos tanques.")) return;
    await deactivateBase(id);
  }

  async function handleTankStatus(id: string, status: string) {
    await updateTankStatus(id, status);
  }

  if (!open) return null;

  return (
    <div className="bg-white border border-ink/10 p-5 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-[12.5px] font-medium text-ink mb-2">Bases ({bases.length})</h3>
          <BaseForm onDone={() => {}} />
          <div className="flex flex-col gap-1.5">
            {bases.map((b) => (
              <div key={b.id} className="flex items-center justify-between text-[13px] text-steel">
                <span>
                  {b.name}{" "}
                  <span className="text-[11px]">
                    {[b.address_cidade, b.address_uf].filter(Boolean).join("/") || "—"}
                    {b.capacity_total_litros ? ` · ${Number(b.capacity_total_litros).toLocaleString("pt-BR")} L` : ""}
                  </span>
                </span>
                <button onClick={() => handleDeactivateBase(b.id)} className="text-[11px] text-steel hover:text-red-700">
                  desativar
                </button>
              </div>
            ))}
            {bases.length === 0 && <p className="text-[12.5px] text-steel">Nenhuma base cadastrada ainda.</p>}
          </div>
        </div>

        <div>
          <h3 className="text-[12.5px] font-medium text-ink mb-2">Tanques ({tanks.length})</h3>
          <TankForm bases={bases} onDone={() => {}} />
          <div className="flex flex-col gap-1.5">
            {tanks.map((t) => (
              <div key={t.id} className="flex items-center justify-between text-[13px] text-steel">
                <span>
                  {t.code} <span className="text-[11px]">({baseName(t.base_id)} · {Number(t.capacity_litros).toLocaleString("pt-BR")} L)</span>
                </span>
                <select
                  value={t.status}
                  onChange={(e) => handleTankStatus(t.id, e.target.value)}
                  className="text-[11px] border border-ink/15 rounded-sm bg-white px-1.5 py-0.5"
                >
                  {TANK_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {TANK_STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            {tanks.length === 0 && <p className="text-[12.5px] text-steel">Nenhum tanque cadastrado ainda.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
