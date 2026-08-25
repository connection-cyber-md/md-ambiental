"use client";

import { useState } from "react";
import Link from "next/link";
import { KpiCard } from "@/components/ui/KpiCard";

type PriorityTask = { id: string; title: string; due_date: string | null };
type DeptData = { department: string; label: string; total: number; priorityTasks: PriorityTask[] };

export function VisaoGeralPageClient({
  kpis,
  departments,
  clientes,
  frota,
  crmDealsCount = 0,
}: {
  kpis: { totalCollections: number; completedCollections: number; totalVolume: number; activeCompanies: number; expiringLicenses: number };
  departments: DeptData[];
  clientes: { ativos: number; vencidas: number };
  frota: { motoristas: number; veiculos: number; alertas: number };
  crmDealsCount?: number;
}) {
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const selected = departments.find((d) => d.department === selectedDept) ?? null;

  return (
    <div>
      {/* Título "Visão geral" na esquerda e Card "Manual de Instruções" visível apenas em desktop (hidden md:block) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="font-display text-[28px] text-black m-0">Visão geral</h1>
        
        <Link
          href="/admin/manual"
          className="hidden md:block bg-white border-[1.5px] border-[#000000] rounded-lg p-4 hover:border-brand-green transition-all md:w-[450px]"
        >
          <div className="font-mono text-[10px] uppercase tracking-wider text-brand-green-deep font-bold mb-0.5">
            DOCUMENTAÇÃO & USO
          </div>
          <div className="font-display text-[15px] text-ink font-semibold flex items-center justify-between">
            <span>Manual de Instruções</span>
            <span>→</span>
          </div>
        </Link>
      </div>

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

      {/* Cards Inferiores com Fontes Padronizadas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border-[1.5px] border-[#000000] rounded-lg p-6 flex flex-col justify-between">
          <div>
            <span className="text-[11px] text-[#000000] mb-1 block">Clientes</span>
            <div className="font-display text-[22px] font-bold text-ink mb-2">{clientes.ativos}</div>
          </div>
          {clientes.vencidas > 0 ? (
            <Link
              href="/admin/compliance?filtro=licencas_vencidas"
              className="text-[12px] font-semibold text-brand-amber-deep hover:underline inline-flex items-center gap-1 mt-2"
            >
              {clientes.vencidas} licença{clientes.vencidas > 1 ? "s" : ""} vencida{clientes.vencidas > 1 ? "s" : ""} →
            </Link>
          ) : (
            <span className="text-[12px] text-steel mt-2 block">Nenhuma licença vencida</span>
          )}
        </div>

        <div className="bg-white border-[1.5px] border-[#000000] rounded-lg p-6 flex flex-col justify-between">
          <div>
            <span className="text-[11px] text-[#000000] mb-1 block">Motoristas e frota</span>
            <div className="font-display text-[22px] font-bold text-ink mb-2">{frota.motoristas} · {frota.veiculos}</div>
          </div>
          {frota.alertas > 0 ? (
            <Link
              href="/admin/expedicao?filtro=alertas_vencimento"
              className="text-[12px] font-semibold text-brand-amber-deep hover:underline inline-flex items-center gap-1 mt-2"
            >
              {frota.alertas} alerta{frota.alertas > 1 ? "s" : ""} de vencimento →
            </Link>
          ) : (
            <span className="text-[12px] text-steel mt-2 block">Nenhum alerta pendente</span>
          )}
        </div>

        <div className="bg-white border-[1.5px] border-[#000000] rounded-lg p-6 flex flex-col justify-between">
          <div>
            <span className="text-[11px] text-[#000000] mb-1 block">CRM & Atendimento</span>
            <div className="font-display text-[22px] font-bold text-ink mb-2">Pipeline OLUC</div>
          </div>
          <Link
            href="/admin/crm"
            className="text-[12px] font-semibold text-brand-green-deep hover:underline inline-flex items-center gap-1 mt-2"
          >
            Acessar Funil de Coletas →
          </Link>
        </div>
      </div>
    </div>
  );
}