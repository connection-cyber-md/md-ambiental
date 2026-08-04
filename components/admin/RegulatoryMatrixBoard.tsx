"use client";

import { useState } from "react";
import { createRegulatoryRule, updateRegulatoryRule, deleteRegulatoryRule } from "@/app/admin/compliance/actions";

type Rule = {
  id: string;
  ibge_code: string | null;
  uf: string | null;
  sphere: string;
  rule_title: string;
  rule_description: string | null;
  required_documents: string[] | null;
  blocking_condition: string | null;
  reference_law: string | null;
};

const SPHERE_LABEL: Record<string, string> = {
  federal: "Federal",
  estadual: "Estadual",
  municipal: "Municipal",
};

const inputClasses =
  "w-full border border-ink/15 rounded-sm px-2.5 py-1.5 text-[13px] bg-white focus:outline-none focus:border-brand-amber";

function RuleForm({
  rule,
  onCancel,
  action,
}: {
  rule?: Rule;
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
          <label className="block text-[10.5px] text-steel mb-1">Título da regra</label>
          <input name="rule_title" defaultValue={rule?.rule_title} required className={inputClasses} />
        </div>
        <div>
          <label className="block text-[10.5px] text-steel mb-1">Esfera</label>
          <select name="sphere" defaultValue={rule?.sphere ?? "federal"} className={inputClasses}>
            <option value="federal">Federal</option>
            <option value="estadual">Estadual</option>
            <option value="municipal">Municipal</option>
          </select>
        </div>
        <div>
          <label className="block text-[10.5px] text-steel mb-1">UF (vazio = nacional)</label>
          <input name="uf" defaultValue={rule?.uf ?? ""} maxLength={2} className={inputClasses} placeholder="SP" />
        </div>
        <div>
          <label className="block text-[10.5px] text-steel mb-1">Código IBGE (vazio = nacional)</label>
          <input name="ibge_code" defaultValue={rule?.ibge_code ?? ""} className={inputClasses} />
        </div>
        <div>
          <label className="block text-[10.5px] text-steel mb-1">Lei/norma de referência</label>
          <input name="reference_law" defaultValue={rule?.reference_law ?? ""} className={inputClasses} />
        </div>
        <div className="md:col-span-3">
          <label className="block text-[10.5px] text-steel mb-1">Descrição</label>
          <textarea name="rule_description" defaultValue={rule?.rule_description ?? ""} rows={2} className={inputClasses} />
        </div>
        <div>
          <label className="block text-[10.5px] text-steel mb-1">Documentos exigidos (separados por vírgula)</label>
          <input
            name="required_documents"
            defaultValue={rule?.required_documents?.join(", ") ?? ""}
            className={inputClasses}
            placeholder="MTR, CDF"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-[10.5px] text-steel mb-1">Condição de bloqueio (opcional)</label>
          <input name="blocking_condition" defaultValue={rule?.blocking_condition ?? ""} className={inputClasses} />
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

export function RegulatoryMatrixBoard({ rules }: { rules: Rule[] }) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta regra da matriz regulatória?")) return;
    setDeletingId(id);
    const result = await deleteRegulatoryRule(id);
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
          {showCreate ? "Fechar" : "+ Nova regra"}
        </button>
      </div>

      {showCreate && <RuleForm onCancel={() => setShowCreate(false)} action={createRegulatoryRule} />}

      {rules.length === 0 ? (
        <div className="bg-white border border-ink/10 p-8 text-[15px] text-steel">Nenhuma regra cadastrada ainda.</div>
      ) : (
        <div className="bg-white border border-ink/10 divide-y divide-ink/10">
          {rules.map((rule) =>
            editingId === rule.id ? (
              <div key={rule.id} className="p-4">
                <RuleForm rule={rule} onCancel={() => setEditingId(null)} action={updateRegulatoryRule.bind(null, rule.id)} />
              </div>
            ) : (
              <div key={rule.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5 mb-1">
                      <span className="text-[10.5px] font-mono uppercase tracking-[0.05em] text-brand-amber border border-brand-amber/40 rounded-full px-2.5 py-0.5">
                        {SPHERE_LABEL[rule.sphere] ?? rule.sphere}
                      </span>
                      <span className="text-[10.5px] font-mono text-steel uppercase tracking-[0.05em]">
                        {rule.uf ?? "Nacional"}
                      </span>
                    </div>
                    <div className="text-[14.5px] font-medium text-ink">{rule.rule_title}</div>
                    {rule.rule_description && <div className="text-[13px] text-steel mt-1">{rule.rule_description}</div>}
                    {rule.blocking_condition && (
                      <div className="text-[12px] text-brand-amber-deep mt-1.5">
                        Condição de bloqueio: {rule.blocking_condition}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button onClick={() => setEditingId(rule.id)} aria-label="Editar" className="text-[15px] text-steel hover:text-ink">
                      ✎
                    </button>
                    <button
                      onClick={() => handleDelete(rule.id)}
                      disabled={deletingId === rule.id}
                      aria-label="Excluir"
                      className="text-[15px] text-red-700 hover:text-red-900 disabled:opacity-40"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
