"use client";

import { useState } from "react";
import { openShift, closeShift } from "@/app/motorista/actions";

type Vehicle = { id: string; plate: string; model: string | null };

type OpenShift = {
  id: string;
  start_time: string;
  start_km: number;
  vehicles: { plate: string } | { plate: string }[] | null;
};

const inputClasses =
  "w-full border border-ink/15 rounded-sm px-2.5 py-1.5 text-[13px] bg-white focus:outline-none focus:border-brand-amber";

export function TurnoBoard({
  vehicles,
  defaultVehicleId,
  shift,
}: {
  vehicles: Vehicle[];
  defaultVehicleId: string | null;
  shift: OpenShift | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (shift) {
    const vehicle = Array.isArray(shift.vehicles) ? shift.vehicles[0] : shift.vehicles;
    return (
      <div className="bg-white border border-ink/10 p-6">
        <div className="mb-4">
          <div className="text-[14.5px] font-medium text-ink">
            Turno aberto — {vehicle?.plate ?? "veículo"}
          </div>
          <div className="text-[12px] text-steel mt-1">
            Iniciado às {new Date(shift.start_time).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            {" · "}KM inicial: {shift.start_km.toLocaleString("pt-BR")}
          </div>
        </div>
        <form
          className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end"
          action={async (formData) => {
            setPending(true);
            setError(null);
            const result = await closeShift(shift.id, formData);
            setPending(false);
            if ("error" in result) setError(result.error);
          }}
        >
          <div>
            <label className="block text-[10.5px] text-steel mb-1">KM final</label>
            <input type="number" step="1" name="end_km" required className={inputClasses} />
          </div>
          <div>
            <label className="block text-[10.5px] text-steel mb-1">Combustível abastecido (L)</label>
            <input type="number" step="0.01" name="fuel_added_liters" className={inputClasses} />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="font-mono text-[11.5px] uppercase tracking-[0.05em] bg-ink text-brand-green border-[1.5px] border-brand-amber rounded-full px-4 py-2 disabled:opacity-50"
          >
            {pending ? "Encerrando…" : "Encerrar turno"}
          </button>
        </form>
        {error && <p className="text-[12px] text-red-700 mt-2">{error}</p>}
      </div>
    );
  }

  return (
    <div className="bg-white border border-ink/10 p-6">
      <div className="text-[14.5px] font-medium text-ink mb-4">Abertura de turno</div>
      <form
        className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end"
        action={async (formData) => {
          setPending(true);
          setError(null);
          const result = await openShift(formData);
          setPending(false);
          if ("error" in result) setError(result.error);
        }}
      >
        <div>
          <label className="block text-[10.5px] text-steel mb-1">Veículo</label>
          <select name="vehicle_id" required className={inputClasses} defaultValue={defaultVehicleId ?? ""}>
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
          <label className="block text-[10.5px] text-steel mb-1">KM inicial</label>
          <input type="number" step="1" name="start_km" required className={inputClasses} />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="font-mono text-[11.5px] uppercase tracking-[0.05em] bg-ink text-brand-green border-[1.5px] border-brand-amber rounded-full px-4 py-2 disabled:opacity-50"
        >
          {pending ? "Abrindo…" : "Abrir turno"}
        </button>
      </form>
      {error && <p className="text-[12px] text-red-700 mt-2">{error}</p>}
      {vehicles.length === 0 && (
        <p className="text-[12px] text-brand-amber-deep mt-3">
          Nenhum veículo regularizado disponível no momento. Fale com o administrador.
        </p>
      )}
    </div>
  );
}
