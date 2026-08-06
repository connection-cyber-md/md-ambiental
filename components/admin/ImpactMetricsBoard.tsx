"use client";

import { useState } from "react";
import { createImpactMetric, updateImpactMetric, deleteImpactMetric } from "@/app/admin/impacto/actions";

type Metric = {
  id: string;
  metric_key: string;
  label: string;
  unit: string | null;
  value: number;
  computation_mode: string;
  period_label: string | null;
  source: string | null;
  display_order: number;
  is_published: boolean;
};

const MODE_LABEL: Record<string, string> = {
  manual: "Manual",
  auto_collections: "Automático (coletas)",
};

const inputClasses =
  "w-full border border-ink/15 rounded-sm px-2.5 py-1.5 text-[13px] bg-white focus:outline-none focus:border-brand-amber";

function MetricForm({
  metric,
  onCancel,
  action,
}: {
  metric?: Metric;
  onCancel: () => void;
  action: (formData: FormData) => Promise<{ success: true } | { error: string }>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="bg-paper-dim border border-ink/10 rounded-sm p-4 mb-3"
      action={async (formData) => {
        setPending(true);
        setError(null);
        const result = await action(formData);
        setPending(false);
        if ("error" in result) setError(result.error);
        else onCancel();
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <div className="md:col-span-2">
          <label className="block text-[10.5px] text-steel mb-1">Rótulo (exibido no site)</label>
          <input name="label" defaultValue={metric?.label} required className={inputClasses} placeholder="Óleo lubrificante usado coletado" />
        </div>
        <div>
          <label className="block text-[10.5px] text-steel mb-1">Chave interna</label>
          <input name="metric_key" defaultValue={metric?.metric_key} required className={inputClasses} placeholder="oleo_coletado_litros" />
        </div>
        <div>
          <label className="block text-[10.5px] text-steel mb-1">Valor</label>
          <input type="number" step="any" name="value" defaultValue={metric?.value ?? 0} required className={inputClasses} />
        </div>
        <div>
          <label className="block text-[10.5px] text-steel mb-1">Unidade</label>
          <input name="unit" defaultValue={metric?.unit ?? ""} className={inputClasses} placeholder="L" />
        </div>
        <div>
          <label className="block text-[10.5px] text-steel mb-1">Origem do valor</label>
          <select name="computation_mode" defaultValue={metric?.computation_mode ?? "manual"} className={inputClasses}>
            <option value="manual">Manual</option>
            <option value="auto_collections">Automático (coletas)</option>
          </select>
        </div>
        <div>
          <label className="block text-[10.5px] text-steel mb-1">Período (texto livre)</label>
          <input name="period_label" defaultValue={metric?.period_label ?? ""} className={inputClasses} placeholder="Acumulado desde 2020" />
        </div>
        <div>
          <label className="block text-[10.5px] text-steel mb-1">Fonte</label>
          <input name="source" defaultValue={metric?.source ?? ""} className={inputClasses} placeholder="ANP" />
        </div>
        <div>
          <label className="block text-[10.5px] text-steel mb-1">Ordem de exibição</label>
          <input type="number" name="display_order" defaultValue={metric?.display_order ?? 0} className={inputClasses} />
        </div>
        <div className="flex items-end pb-1.5">
          <label className="flex items-center gap-2 text-[13px] text-ink">
            <input type="checkbox" name="is_published" defaultChecked={metric?.is_published ?? false} />
            Publicar na home
          </label>
        </div>
      </div>

      {error && <p className="text-[12px] text-red-700 mb-2">{error}</p>}

      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="font-mono text-[11px] uppercase tracking-[0.05em] border border-ink/15 rounded-full px-3.5 py-1.5">
          Cancelar
        </button>
        <button type="submit" disabled={pending} className="font-mono text-[11px] uppercase tracking-[0.05em] bg-ink text-brand-green border-[1.5px] border-brand-amber rounded-full px-3.5 py-1.5 disabled:opacity-50">
          {pending ? "Salvando…" : "Salvar"}
        </button>
      </div>
    </form>
  );
}

export function ImpactMetricsBoard({ metrics }: { metrics: Metric[] }) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta métrica de impacto?")) return;
    setDeletingId(id);
    const result = await deleteImpactMetric(id);
    setDeletingId(null);
    if ("error" in result) alert(result.error);
  }

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="font-mono text-[11.5px] uppercase tracking-[0.05em] bg-ink text-brand-green border-[1.5px] border-brand-amber rounded-full px-4 py-2"
        >
          {showCreate ? "Fechar" : "+ Nova métrica"}
        </button>
      </div>

      {showCreate && <MetricForm onCancel={() => setShowCreate(false)} action={createImpactMetric} />}

      {metrics.length === 0 ? (
        <div className="bg-white border border-ink/10 p-8 text-[15px] text-steel">Nenhuma métrica cadastrada ainda.</div>
      ) : (
        <div className="bg-white border border-ink/10 divide-y divide-ink/10">
          {metrics.map((m) =>
            editingId === m.id ? (
              <div key={m.id} className="p-4">
                <MetricForm metric={m} onCancel={() => setEditingId(null)} action={updateImpactMetric.bind(null, m.id)} />
              </div>
            ) : (
              <div key={m.id} className="p-4 flex items-center justify-between gap-6 flex-wrap">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className="text-[10.5px] font-mono uppercase tracking-[0.05em] text-brand-amber border border-brand-amber/40 rounded-full px-2.5 py-0.5">
                      {MODE_LABEL[m.computation_mode] ?? m.computation_mode}
                    </span>
                    <span
                      className={`text-[10.5px] font-mono uppercase tracking-[0.05em] rounded-full px-2.5 py-0.5 border ${
                        m.is_published ? "text-green-700 border-green-700/40" : "text-steel border-ink/15"
                      }`}
                    >
                      {m.is_published ? "Publicado" : "Rascunho"}
                    </span>
                  </div>
                  <div className="text-[14.5px] font-medium text-ink">{m.label}</div>
                  <div className="text-[12px] text-steel mt-1">
                    {m.value.toLocaleString("pt-BR")} {m.unit ?? ""}
                    {m.period_label && ` · ${m.period_label}`}
                    {m.source && ` · fonte: ${m.source}`}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button onClick={() => setEditingId(m.id)} aria-label="Editar" className="text-[15px] text-steel hover:text-ink">
                    ✎
                  </button>
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
            )
          )}
        </div>
      )}
    </div>
  );
}
