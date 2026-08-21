"use client";

import { useState } from "react";
import { createLot, closeLot, registerStockMovement } from "@/app/admin/estoque/actions";
import { MOVEMENT_TYPES, MOVEMENT_TYPE_LABEL, LOT_STATUS_LABEL, LOT_STATUS_CLASSES } from "@/lib/estoque/constants";
import { SyntheticBadge } from "@/components/ui/SyntheticBadge";

type Tank = { id: string; code: string; status: string };
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

const inputClasses =
  "w-full border border-ink/15 rounded-sm px-2.5 py-1.5 text-[13px] bg-white focus:outline-none focus:border-brand-amber";

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR");
}

function LotForm({ tanks, onDone }: { tanks: Tank[]; onDone: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="grid grid-cols-2 gap-2 mb-3"
      action={async (formData) => {
        setPending(true);
        setError(null);
        const result = await createLot(formData);
        setPending(false);
        if ("error" in result) setError(result.error);
        else onDone();
      }}
    >
      <select name="tank_id" defaultValue="" required className={inputClasses}>
        <option value="" disabled>
          Tanque
        </option>
        {tanks.map((t) => (
          <option key={t.id} value={t.id}>
            {t.code}
          </option>
        ))}
      </select>
      <input name="code" placeholder="Código do lote" required className={inputClasses} />
      <input name="quality_classification" placeholder="Classificação de qualidade (opcional)" className={`${inputClasses} col-span-2`} />
      <button
        type="submit"
        disabled={pending || tanks.length === 0}
        title={tanks.length === 0 ? "Cadastre um tanque primeiro" : undefined}
        className="font-mono text-[11px] uppercase tracking-[0.05em] bg-ink text-white border-[1.5px] border-brand-amber rounded-full px-3.5 py-1.5 disabled:opacity-50 col-span-2"
      >
        {pending ? "Salvando…" : "+ Lote"}
      </button>
      {error && <p className="text-[12px] text-red-700 col-span-2">{error}</p>}
    </form>
  );
}

function MovementForm({ tanks, lots, onDone }: { tanks: Tank[]; lots: Lot[]; onDone: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [tankId, setTankId] = useState("");

  const tankLots = lots.filter((l) => l.tank_id === tankId && l.status === "open");

  return (
    <form
      className="grid grid-cols-2 gap-2 mb-3"
      action={async (formData) => {
        setPending(true);
        setError(null);
        const result = await registerStockMovement(formData);
        setPending(false);
        if ("error" in result) setError(result.error);
        else onDone();
      }}
    >
      <select
        name="tank_id"
        value={tankId}
        onChange={(e) => setTankId(e.target.value)}
        required
        className={inputClasses}
      >
        <option value="" disabled>
          Tanque
        </option>
        {tanks.map((t) => (
          <option key={t.id} value={t.id}>
            {t.code}
          </option>
        ))}
      </select>
      <select name="lot_id" defaultValue="" className={inputClasses}>
        <option value="">Sem lote específico</option>
        {tankLots.map((l) => (
          <option key={l.id} value={l.id}>
            {l.code} ({Number(l.volume_litros).toLocaleString("pt-BR")} L)
          </option>
        ))}
      </select>
      <select name="type" defaultValue={MOVEMENT_TYPES[0]} className={inputClasses}>
        {MOVEMENT_TYPES.map((t) => (
          <option key={t} value={t}>
            {MOVEMENT_TYPE_LABEL[t]}
          </option>
        ))}
      </select>
      <input name="volume_litros" placeholder="Volume (L)" required className={inputClasses} />
      <input name="reason" placeholder="Motivo/observação (opcional)" className={`${inputClasses} col-span-2`} />
      <button
        type="submit"
        disabled={pending || tanks.length === 0}
        className="font-mono text-[11px] uppercase tracking-[0.05em] bg-ink text-white border-[1.5px] border-brand-amber rounded-full px-3.5 py-1.5 disabled:opacity-50 col-span-2"
      >
        {pending ? "Registrando…" : "+ Movimentação"}
      </button>
      {error && <p className="text-[12px] text-red-700 col-span-2">{error}</p>}
    </form>
  );
}

export function EstoqueLotsMovements({
  tanks,
  lots,
  movements,
  showCreateLot,
  showCreateMovement,
  onCloseCreateLot,
  onCloseCreateMovement,
}: {
  tanks: Tank[];
  lots: Lot[];
  movements: Movement[];
  showCreateLot: boolean;
  showCreateMovement: boolean;
  onCloseCreateLot: () => void;
  onCloseCreateMovement: () => void;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);

  const tankCode = (id: string) => tanks.find((t) => t.id === id)?.code ?? "—";
  const lotCode = (id: string | null) => (id ? lots.find((l) => l.id === id)?.code ?? "—" : "—");

  async function handleCloseLot(id: string) {
    if (!confirm("Fechar este lote? Ele deixa de receber novas movimentações e fica pronto para expedição.")) return;
    setBusyId(id);
    const result = await closeLot(id);
    setBusyId(null);
    if ("error" in result) alert(result.error);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h3 className="text-[13px] font-medium text-ink mb-2">Lotes ({lots.length})</h3>
        {showCreateLot && <LotForm tanks={tanks} onDone={onCloseCreateLot} />}
        {lots.length === 0 ? (
          <div className="bg-white border border-ink/10 p-6 text-[14px] text-steel">Nenhum lote cadastrado ainda.</div>
        ) : (
          <div className="bg-white border border-ink/10 divide-y divide-ink/10">
            {lots.map((l) => (
              <div key={l.id} className="p-3.5 flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-[13.5px] font-medium text-ink">
                    {l.code} <span className="text-[11.5px] text-steel font-normal">— {tankCode(l.tank_id)}</span>
                  </div>
                  <div className="text-[11.5px] text-steel mt-1">
                    {Number(l.volume_litros).toLocaleString("pt-BR")} L
                    {l.quality_classification ? ` · ${l.quality_classification}` : ""} · aberto em {fmtDateTime(l.opened_at)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {l.is_synthetic && <SyntheticBadge />}
                  <span
                    className={`text-[11px] font-mono uppercase tracking-[0.04em] border rounded-full px-2.5 py-1 whitespace-nowrap ${
                      LOT_STATUS_CLASSES[l.status] ?? "text-steel border-ink/15"
                    }`}
                  >
                    {LOT_STATUS_LABEL[l.status] ?? l.status}
                  </span>
                  {l.status === "open" && (
                    <button
                      onClick={() => handleCloseLot(l.id)}
                      disabled={busyId === l.id}
                      className="text-[11px] font-mono uppercase tracking-[0.04em] text-steel hover:text-ink disabled:opacity-40"
                    >
                      fechar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-[13px] font-medium text-ink mb-2">Movimentações recentes</h3>
        {showCreateMovement && <MovementForm tanks={tanks} lots={lots} onDone={onCloseCreateMovement} />}
        {movements.length === 0 ? (
          <div className="bg-white border border-ink/10 p-6 text-[14px] text-steel">Nenhuma movimentação registrada ainda.</div>
        ) : (
          <div className="bg-white border border-ink/10 divide-y divide-ink/10 max-h-[560px] overflow-y-auto">
            {movements.map((m) => (
              <div key={m.id} className="p-3 flex items-center justify-between gap-3 text-[13px]">
                <div>
                  <span className="text-ink">{MOVEMENT_TYPE_LABEL[m.type] ?? m.type}</span>{" "}
                  <span className="text-steel text-[11.5px]">
                    {tankCode(m.tank_id)}
                    {m.lot_id ? ` · ${lotCode(m.lot_id)}` : ""} · {fmtDateTime(m.created_at)}
                  </span>
                </div>
                <span className={`font-mono text-[12.5px] ${Number(m.volume_litros) >= 0 ? "text-brand-green-deep" : "text-red-700"}`}>
                  {Number(m.volume_litros) >= 0 ? "+" : ""}
                  {Number(m.volume_litros).toLocaleString("pt-BR")} L
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
