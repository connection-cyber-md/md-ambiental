"use client";

import { useState } from "react";
import { KpiCard } from "@/components/ui/KpiCard";

type PriorityTask = { id: string; title: string; due_date: string | null };
type DeptData = { department: string; label: string; total: number; priorityTasks: PriorityTask[] };

export function VisaoGeralPageClient({
  kpis,
  departments,
  clientes,
  frota,
}: {
  kpis: { totalCollections: number; completedCollections: number; totalVolume: number; activeCompanies: number; expiringLicenses: number };
  departments: DeptData[];
  clientes: { ativos: number; vencidas: number };
  frota: { motoristas: number; veiculos: number; alertas: number };
}) {
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const selected = departments.find((d) => d.department === selectedDept) ?? null;

  return (
    <div>
      <h1 className="font-display text-[28px] text-black mb-6">Visão geral</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard
          label="Coletas (mês)"
          value={String(kpis.totalCollections)}
          hint={`${kpis.completedCollections} concluídas`}
          borderClassName="border-[#000000]"
          labelClassName="text-[#000000]"
        />
        <KpiCard
          label="Volume total"
          value={`${kpis.totalVolume.toLocaleString("pt-BR")} L`}
          borderClassName="border-[#000000]"
          labelClassName="text-[#000000]"
        />
        <KpiCard
          label="Clientes ativos"
          value={String(kpis.activeCompanies)}
          borderClassName="border-[#000000]"
          labelClassName="text-[#000000]"
        />
        <KpiCard
          label="Licenças vencendo"
          value={String(kpis.expiringLicenses)}
          hint="próx. 30 dias"
          accent={kpis.expiringLicenses > 0}
          borderClassName="border-[#000000]"
          labelClassName="text-[#000000]"
        />
      </div>

      <div className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-steel mb-2">
        Tarefas BPO por departamento
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        {departments.map((d) => (
          <button
            key={d.department}
            onClick={() => setSelectedDept(selectedDept === d.department ? null : d.department)}
            className={`text-left border-[1.5px] border-[#000000] rounded-lg p-4 transition-colors ${
              selectedDept === d.department ? "bg-paper-dim" : "bg-white"
            }`}
          >
            <div className="text-[11px] text-[#000000] mb-1">{d.label}</div>
            <div className="font-display text-[22px] text-ink">{d.total}</div>
            {d.priorityTasks.length > 0 && (
              <div className="text-[11px] text-red-700 mt-0.5">
                {d.priorityTasks.length} prioritária{d.priorityTasks.length > 1 ? "s" : ""}
              </div>
            )}
          </button>
        ))}
      </div>

      {selected && (
        <div className="bg-white border border-ink/10 p-4 mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12.5px] text-steel">{selected.label} · prioritárias em aberto</span>
            <a
              href="/admin/bpo"
              className="text-[11px] font-mono uppercase tracking-[0.05em] text-steel hover:text-ink"
            >
              Ver no BPO →
            </a>
          </div>
          {selected.priorityTasks.length === 0 ? (
            <div className="text-[13px] text-steel">Nenhuma tarefa prioritária em aberto neste departamento.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {selected.priorityTasks.map((t) => (
                <div key={t.id} className="text-[13px] text-ink flex items-center justify-between gap-4">
                  <span>{t.title}</span>
                  {t.due_date && (
                    <span className="text-[11.5px] text-steel whitespace-nowrap">
                      vence em {new Date(t.due_date).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <KpiCard
          label="Clientes"
          value={String(clientes.ativos)}
          hint={clientes.vencidas > 0 ? `${clientes.vencidas} licença${clientes.vencidas > 1 ? "s" : ""} vencida${clientes.vencidas > 1 ? "s" : ""}` : undefined}
          accent={clientes.vencidas > 0}
          borderClassName="border-[#000000]"
          labelClassName="text-[#000000]"
        />
        <KpiCard
          label="Motoristas e frota"
          value={`${frota.motoristas} · ${frota.veiculos}`}
          hint={frota.alertas > 0 ? `${frota.alertas} alerta${frota.alertas > 1 ? "s" : ""} de vencimento` : undefined}
          accent={frota.alertas > 0}
          borderClassName="border-[#000000]"
          labelClassName="text-[#000000]"
        />
      </div>
    </div>
  );
}
