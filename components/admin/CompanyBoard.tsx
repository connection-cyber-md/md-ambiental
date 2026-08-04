"use client";

import { useState } from "react";
import { createCompany, updateCompany, deleteCompany } from "@/app/admin/compliance/actions";
import { licenseStatus, LICENSE_STATUS_LABEL, LICENSE_STATUS_CLASSES } from "@/lib/compliance/licenseStatus";

type Company = {
  id: string;
  cnpj: string;
  razao_social: string;
  nome_fantasia: string | null;
  license_number: string | null;
  license_type: string | null;
  license_issuing_agency: string | null;
  license_issue_date: string | null;
  license_expiry_date: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  status: string;
};

const inputClasses =
  "w-full border border-ink/15 rounded-sm px-2.5 py-1.5 text-[13px] bg-white focus:outline-none focus:border-brand-amber";

function CompanyForm({
  company,
  onCancel,
  action,
}: {
  company?: Company;
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
          <label className="block text-[10.5px] text-steel mb-1">Razão social</label>
          <input name="razao_social" defaultValue={company?.razao_social} required className={inputClasses} />
        </div>
        <div>
          <label className="block text-[10.5px] text-steel mb-1">CNPJ</label>
          <input name="cnpj" defaultValue={company?.cnpj} required className={inputClasses} />
        </div>
        <div>
          <label className="block text-[10.5px] text-steel mb-1">Nome fantasia</label>
          <input name="nome_fantasia" defaultValue={company?.nome_fantasia ?? ""} className={inputClasses} />
        </div>
        <div>
          <label className="block text-[10.5px] text-steel mb-1">Status</label>
          <select name="status" defaultValue={company?.status ?? "active"} className={inputClasses}>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>
        </div>
        <div>
          <label className="block text-[10.5px] text-steel mb-1">Tipo de licença</label>
          <input name="license_type" defaultValue={company?.license_type ?? ""} className={inputClasses} placeholder="LO" />
        </div>
        <div>
          <label className="block text-[10.5px] text-steel mb-1">Número da licença</label>
          <input name="license_number" defaultValue={company?.license_number ?? ""} className={inputClasses} />
        </div>
        <div>
          <label className="block text-[10.5px] text-steel mb-1">Órgão emissor</label>
          <input name="license_issuing_agency" defaultValue={company?.license_issuing_agency ?? ""} className={inputClasses} />
        </div>
        <div>
          <label className="block text-[10.5px] text-steel mb-1">Emissão</label>
          <input type="date" name="license_issue_date" defaultValue={company?.license_issue_date ?? ""} className={inputClasses} />
        </div>
        <div>
          <label className="block text-[10.5px] text-steel mb-1">Vencimento</label>
          <input type="date" name="license_expiry_date" defaultValue={company?.license_expiry_date ?? ""} className={inputClasses} />
        </div>
        <div>
          <label className="block text-[10.5px] text-steel mb-1">Contato — nome</label>
          <input name="contact_name" defaultValue={company?.contact_name ?? ""} className={inputClasses} />
        </div>
        <div>
          <label className="block text-[10.5px] text-steel mb-1">Contato — e-mail</label>
          <input type="email" name="contact_email" defaultValue={company?.contact_email ?? ""} className={inputClasses} />
        </div>
        <div>
          <label className="block text-[10.5px] text-steel mb-1">Contato — telefone</label>
          <input name="contact_phone" defaultValue={company?.contact_phone ?? ""} className={inputClasses} />
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

export function CompanyBoard({ companies }: { companies: Company[] }) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta empresa? Coletas e documentos ligados a ela podem impedir a exclusão.")) return;
    setDeletingId(id);
    const result = await deleteCompany(id);
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
          {showCreate ? "Fechar" : "+ Novo cliente"}
        </button>
      </div>

      {showCreate && <CompanyForm onCancel={() => setShowCreate(false)} action={createCompany} />}

      {companies.length === 0 ? (
        <div className="bg-white border border-ink/10 p-8 text-[15px] text-steel">Nenhum cliente cadastrado ainda.</div>
      ) : (
        <div className="bg-white border border-ink/10 divide-y divide-ink/10">
          {companies.map((c) =>
            editingId === c.id ? (
              <div key={c.id} className="p-4">
                <CompanyForm company={c} onCancel={() => setEditingId(null)} action={updateCompany.bind(null, c.id)} />
              </div>
            ) : (
              <div key={c.id} className="p-4 flex items-center justify-between gap-6 flex-wrap">
                <div>
                  <div className="text-[14.5px] font-medium text-ink">{c.razao_social}</div>
                  <div className="text-[12px] text-steel mt-1">
                    {c.license_type ?? "—"} {c.license_number ? `· ${c.license_number}` : ""}
                    {c.license_expiry_date && ` · vence em ${new Date(c.license_expiry_date).toLocaleDateString("pt-BR")}`}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[11.5px] font-mono uppercase tracking-[0.04em] border rounded-full px-3 py-1 whitespace-nowrap ${LICENSE_STATUS_CLASSES[licenseStatus(c.license_expiry_date)]}`}
                  >
                    {LICENSE_STATUS_LABEL[licenseStatus(c.license_expiry_date)]}
                  </span>
                  <button onClick={() => setEditingId(c.id)} aria-label="Editar" className="text-[15px] text-steel hover:text-ink">
                    ✎
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    disabled={deletingId === c.id}
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
