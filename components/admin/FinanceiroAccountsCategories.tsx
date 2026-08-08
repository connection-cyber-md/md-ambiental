"use client";

import { useState } from "react";
import {
  createFinancialAccount,
  createFinancialCategory,
  deactivateFinancialAccount,
  deactivateFinancialCategory,
} from "@/app/admin/financeiro/actions";
import { ACCOUNT_KINDS, ACCOUNT_KIND_LABEL, ENTRY_TYPES, ENTRY_TYPE_LABEL } from "@/lib/financeiro/constants";

type Account = { id: string; name: string; kind: string; bank_name: string | null; initial_balance: number };
type Category = { id: string; name: string; type: string };

const inputClasses =
  "w-full border border-ink/15 rounded-sm px-2.5 py-1.5 text-[13px] bg-white focus:outline-none focus:border-brand-amber";

function AccountForm({ onDone }: { onDone: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="grid grid-cols-2 gap-2 mb-3"
      action={async (formData) => {
        setPending(true);
        setError(null);
        const result = await createFinancialAccount(formData);
        setPending(false);
        if ("error" in result) setError(result.error);
        else onDone();
      }}
    >
      <input name="name" placeholder="Nome (ex: Itaú CC, Caixa loja)" required className={`${inputClasses} col-span-2`} />
      <select name="kind" defaultValue={ACCOUNT_KINDS[0]} className={inputClasses}>
        {ACCOUNT_KINDS.map((k) => (
          <option key={k} value={k}>
            {ACCOUNT_KIND_LABEL[k]}
          </option>
        ))}
      </select>
      <input name="bank_name" placeholder="Banco (opcional)" className={inputClasses} />
      <input name="initial_balance" placeholder="Saldo inicial" defaultValue="0" className={inputClasses} />
      <button
        type="submit"
        disabled={pending}
        className="font-mono text-[11px] uppercase tracking-[0.05em] bg-ink text-white border-[1.5px] border-brand-amber rounded-full px-3.5 py-1.5 disabled:opacity-50"
      >
        {pending ? "Salvando…" : "+ Conta"}
      </button>
      {error && <p className="text-[12px] text-red-700 col-span-2">{error}</p>}
    </form>
  );
}

function CategoryForm({ onDone }: { onDone: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="grid grid-cols-2 gap-2 mb-3"
      action={async (formData) => {
        setPending(true);
        setError(null);
        const result = await createFinancialCategory(formData);
        setPending(false);
        if ("error" in result) setError(result.error);
        else onDone();
      }}
    >
      <input name="name" placeholder="Nome (ex: Coleta OLUC, Combustível)" required className={`${inputClasses} col-span-2`} />
      <select name="type" defaultValue={ENTRY_TYPES[0]} className={inputClasses}>
        {ENTRY_TYPES.map((t) => (
          <option key={t} value={t}>
            {ENTRY_TYPE_LABEL[t]}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={pending}
        className="font-mono text-[11px] uppercase tracking-[0.05em] bg-ink text-white border-[1.5px] border-brand-amber rounded-full px-3.5 py-1.5 disabled:opacity-50"
      >
        {pending ? "Salvando…" : "+ Categoria"}
      </button>
      {error && <p className="text-[12px] text-red-700 col-span-2">{error}</p>}
    </form>
  );
}

export function FinanceiroAccountsCategories({
  open,
  accounts,
  categories,
}: {
  open: boolean;
  accounts: Account[];
  categories: Category[];
}) {
  async function handleDeactivateAccount(id: string) {
    await deactivateFinancialAccount(id);
  }

  async function handleDeactivateCategory(id: string) {
    await deactivateFinancialCategory(id);
  }

  if (!open) return null;

  return (
    <div className="bg-white border border-ink/10 p-5 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-[12.5px] font-medium text-ink mb-2">Contas ({accounts.length})</h3>
            <AccountForm onDone={() => {}} />
            <div className="flex flex-col gap-1.5">
              {accounts.map((a) => (
                <div key={a.id} className="flex items-center justify-between text-[13px] text-steel">
                  <span>
                    {a.name} <span className="text-[11px]">({ACCOUNT_KIND_LABEL[a.kind] ?? a.kind})</span>
                  </span>
                  <button
                    onClick={() => handleDeactivateAccount(a.id)}
                    className="text-[11px] text-steel hover:text-red-700"
                  >
                    desativar
                  </button>
                </div>
              ))}
              {accounts.length === 0 && (
                <p className="text-[12.5px] text-steel">Nenhuma conta cadastrada ainda.</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-[12.5px] font-medium text-ink mb-2">Categorias ({categories.length})</h3>
            <CategoryForm onDone={() => {}} />
            <div className="flex flex-col gap-1.5">
              {categories.map((c) => (
                <div key={c.id} className="flex items-center justify-between text-[13px] text-steel">
                  <span>
                    {c.name} <span className="text-[11px]">({ENTRY_TYPE_LABEL[c.type] ?? c.type})</span>
                  </span>
                  <button
                    onClick={() => handleDeactivateCategory(c.id)}
                    className="text-[11px] text-steel hover:text-red-700"
                  >
                    desativar
                  </button>
                </div>
              ))}
              {categories.length === 0 && (
                <p className="text-[12.5px] text-steel">Nenhuma categoria cadastrada ainda.</p>
              )}
            </div>
          </div>
      </div>
    </div>
  );
}
