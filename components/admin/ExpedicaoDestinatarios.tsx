"use client";

import { useState } from "react";
import { createDestinatario, deactivateDestinatario } from "@/app/admin/expedicao/actions";

type Destinatario = {
  id: string;
  cnpj: string;
  razao_social: string;
  nome_fantasia: string | null;
  authorization_number: string | null;
  authorization_expiry_date: string | null;
  address_cidade: string | null;
  address_uf: string | null;
};

const inputClasses =
  "w-full border border-ink/15 rounded-sm px-2.5 py-1.5 text-[13px] bg-white focus:outline-none focus:border-brand-amber";

function DestinatarioForm({ onDone }: { onDone: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="grid grid-cols-2 gap-2 mb-3"
      action={async (formData) => {
        setPending(true);
        setError(null);
        const result = await createDestinatario(formData);
        setPending(false);
        if ("error" in result) setError(result.error);
        else onDone();
      }}
    >
      <input name="razao_social" placeholder="Razão social" required className={`${inputClasses} col-span-2`} />
      <input name="cnpj" placeholder="CNPJ" required className={inputClasses} />
      <input name="nome_fantasia" placeholder="Nome fantasia (opcional)" className={inputClasses} />
      <input name="authorization_number" placeholder="Nº autorização/licença (opcional)" className={inputClasses} />
      <input type="date" name="authorization_expiry_date" placeholder="Validade da autorização" className={inputClasses} />
      <input name="address_cidade" placeholder="Cidade" className={inputClasses} />
      <input name="address_uf" placeholder="UF" maxLength={2} className={inputClasses} />
      <button
        type="submit"
        disabled={pending}
        className="font-mono text-[11px] uppercase tracking-[0.05em] bg-ink text-white border-[1.5px] border-brand-amber rounded-full px-3.5 py-1.5 disabled:opacity-50 col-span-2"
      >
        {pending ? "Salvando…" : "+ Destinatário"}
      </button>
      {error && <p className="text-[12px] text-red-700 col-span-2">{error}</p>}
    </form>
  );
}

export function ExpedicaoDestinatarios({ open, destinatarios }: { open: boolean; destinatarios: Destinatario[] }) {
  async function handleDeactivate(id: string) {
    if (!confirm("Desativar este destinatário? Ele deixa de aparecer no cadastro de novas expedições.")) return;
    await deactivateDestinatario(id);
  }

  if (!open) return null;

  return (
    <div className="bg-white border border-ink/10 p-5 mb-6">
      <h3 className="text-[12.5px] font-medium text-ink mb-2">Destinatários ({destinatarios.length})</h3>
      <DestinatarioForm onDone={() => {}} />
      <div className="flex flex-col gap-1.5">
        {destinatarios.map((d) => (
          <div key={d.id} className="flex items-center justify-between text-[13px] text-steel">
            <span>
              {d.razao_social}{" "}
              <span className="text-[11px]">
                {d.cnpj} · {[d.address_cidade, d.address_uf].filter(Boolean).join("/") || "—"}
                {d.authorization_number ? ` · autorização ${d.authorization_number}` : ""}
              </span>
            </span>
            <button onClick={() => handleDeactivate(d.id)} className="text-[11px] text-steel hover:text-red-700">
              desativar
            </button>
          </div>
        ))}
        {destinatarios.length === 0 && <p className="text-[12.5px] text-steel">Nenhum destinatário cadastrado ainda.</p>}
      </div>
    </div>
  );
}
