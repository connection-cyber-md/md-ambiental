"use client";

import { useState } from "react";
import {
  createFinancialEntry,
  updateFinancialEntry,
  deleteFinancialEntry,
  markFinancialEntryPaid,
} from "@/app/admin/financeiro/actions";
import {
  ENTRY_TYPES,
  ENTRY_TYPE_LABEL,
  ENTRY_STATUSES,
  ENTRY_STATUS_LABEL,
  ENTRY_STATUS_CLASSES,
} from "@/lib/financeiro/constants";
import { SyntheticBadge } from "@/components/ui/SyntheticBadge";

type Entry = {
  id: string;
  account_id: string;
  category_id: string;
  type: string;
  description: string;
  amount: number;
  entry_date: string;
  due_date: string | null;
  status: string;
  is_synthetic?: boolean;
};

type Option = { id: string; name: string };

const inputClasses =
  "w-full border border-ink/15 rounded-sm px-2.5 py-1.5 text-[13px] bg-white focus:outline-none focus:border-brand-amber";

function fmtCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("pt-BR");
}

function EntryForm({
  entry,
  accounts,
  categories,
  onCancel,
  action,
}: {
  entry?: Entry;
  accounts: Option[];
  categories: (Option & { type: string })[];
  onCancel: () => void;
  action: (formData: FormData) => Promise<{ success: true } | { error: string }>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [type, setType] = useState(entry?.type ?? ENTRY_TYPES[0]);

  const filteredCategories = categories.filter((c) => c.type === type);

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
        <div className="md:col-span-3">
          <label className="block text-[10.5px] text-steel mb-1">Descrição</label>
          <input name="description" defaultValue={entry?.description} required className={inputClasses} />
        </div>
        <div>
          <label className="block text-[10.5px] text-steel mb-1">Tipo</label>
          <select
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={inputClasses}
          >
            {ENTRY_TYPES.map((t) => (
              <option key={t} value={t}>
                {ENTRY_TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10.5px] text-steel mb-1">Categoria</label>
          <select name="category_id" defaultValue={entry?.category_id ?? ""} required className={inputClasses}>
            <option value="" disabled>
              Selecione
            </option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10.5px] text-steel mb-1">Conta</label>
          <select name="account_id" defaultValue={entry?.account_id ?? ""} required className={inputClasses}>
            <option value="" disabled>
              Selecione
            </option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10.5px] text-steel mb-1">Valor (R$)</label>
          <input name="amount" defaultValue={entry?.amount} required className={inputClasses} />
        </div>
        <div>
          <label className="block text-[10.5px] text-steel mb-1">Data do lançamento</label>
          <input type="date" name="entry_date" defaultValue={entry?.entry_date} required className={inputClasses} />
        </div>
        <div>
          <label className="block text-[10.5px] text-steel mb-1">Vencimento (opcional)</label>
          <input type="date" name="due_date" defaultValue={entry?.due_date ?? ""} className={inputClasses} />
        </div>
        <div>
          <label className="block text-[10.5px] text-steel mb-1">Status</label>
          <select name="status" defaultValue={entry?.status ?? "pending"} className={inputClasses}>
            {ENTRY_STATUSES.map((s) => (
              <option key={s} value={s}>
                {ENTRY_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
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

export function FinanceiroBoard({
  entries,
  accounts,
  categories,
  showCreate,
  onCloseCreate,
}: {
  entries: Entry[];
  accounts: Option[];
  categories: (Option & { type: string })[];
  showCreate: boolean;
  onCloseCreate: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const accountName = (id: string) => accounts.find((a) => a.id === id)?.name ?? "—";
  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? "—";

  async function handleDelete(id: string) {
    if (!confirm("Excluir este lançamento? Essa ação não pode ser desfeita.")) return;
    setBusyId(id);
    const result = await deleteFinancialEntry(id);
    setBusyId(null);
    if ("error" in result) alert(result.error);
  }

  async function handleMarkPaid(id: string) {
    setBusyId(id);
    const result = await markFinancialEntryPaid(id);
    setBusyId(null);
    if ("error" in result) alert(result.error);
  }

  return (
    <div>
      {showCreate && (
        <EntryForm
          accounts={accounts}
          categories={categories}
          onCancel={onCloseCreate}
          action={createFinancialEntry}
        />
      )}

      {entries.length === 0 ? (
        <div className="bg-white border border-ink/10 p-8 text-[15px] text-steel">
          Nenhum lançamento cadastrado ainda.
        </div>
      ) : (
        <div className="bg-white border border-ink/10 divide-y divide-ink/10">
          {entries.map((entry) =>
            editingId === entry.id ? (
              <div key={entry.id} className="p-4">
                <EntryForm
                  entry={entry}
                  accounts={accounts}
                  categories={categories}
                  onCancel={() => setEditingId(null)}
                  action={updateFinancialEntry.bind(null, entry.id)}
                />
              </div>
            ) : (
              <div key={entry.id} className="p-4 flex items-start justify-between gap-6 flex-wrap">
                <div className="min-w-[240px]">
                  <div className="text-[14.5px] font-medium text-ink">{entry.description}</div>
                  <div className="text-[12px] text-steel mt-1.5">
                    {categoryName(entry.category_id)} · {accountName(entry.account_id)} ·{" "}
                    {fmtDate(entry.entry_date)}
                    {entry.due_date && ` · vence em ${fmtDate(entry.due_date)}`}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {entry.is_synthetic && <SyntheticBadge />}
                  <span
                    className={`text-[13px] font-mono ${
                      entry.type === "receita" ? "text-brand-green-deep" : "text-red-700"
                    }`}
                  >
                    {entry.type === "receita" ? "+" : "−"} {fmtCurrency(entry.amount)}
                  </span>
                  <span
                    className={`text-[11.5px] font-mono uppercase tracking-[0.04em] border rounded-full px-3 py-1 whitespace-nowrap ${
                      ENTRY_STATUS_CLASSES[entry.status] ?? "text-steel border-ink/15"
                    }`}
                  >
                    {ENTRY_STATUS_LABEL[entry.status] ?? entry.status}
                  </span>
                  {entry.status === "pending" && (
                    <button
                      onClick={() => handleMarkPaid(entry.id)}
                      disabled={busyId === entry.id}
                      className="text-[11px] font-mono uppercase tracking-[0.04em] text-brand-green-deep hover:underline disabled:opacity-40"
                    >
                      marcar pago
                    </button>
                  )}
                  <button
                    onClick={() => setEditingId(entry.id)}
                    aria-label="Editar"
                    className="text-[15px] text-steel hover:text-ink"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    disabled={busyId === entry.id}
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
