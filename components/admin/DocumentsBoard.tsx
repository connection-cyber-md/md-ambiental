"use client";

import { useState } from "react";
import { createDocument, updateDocument, deleteDocument, generateDocumentPdf } from "@/app/admin/documentos/actions";

type CollectionOption = {
  id: string;
  collection_date: string;
  volume_litros: number | null;
  companies: { razao_social: string } | { razao_social: string }[] | null;
};

type Document = {
  id: string;
  collection_id: string;
  type: "CCO" | "MTR";
  document_number: string | null;
  file_url: string | null;
  issue_date: string | null;
  status: string;
  collections: { collection_date: string; companies: { razao_social: string } | { razao_social: string }[] | null } | { collection_date: string; companies: { razao_social: string } | { razao_social: string }[] | null }[] | null;
};

const TYPE_LABEL: Record<string, string> = {
  CCO: "Certificado de Coleta (CCO)",
  MTR: "Manifesto de Transporte (MTR)",
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Rascunho",
  issued: "Emitido",
  canceled: "Cancelado",
};

const STATUS_CLASSES: Record<string, string> = {
  draft: "text-steel border-ink/15",
  issued: "text-brand-green-deep border-brand-green/40",
  canceled: "text-red-700 border-red-300",
};

const inputClasses =
  "w-full border border-ink/15 rounded-sm px-2.5 py-1.5 text-[13px] bg-white focus:outline-none focus:border-brand-amber";

function collectionLabel(c: CollectionOption) {
  const company = Array.isArray(c.companies) ? c.companies[0] : c.companies;
  const date = new Date(c.collection_date).toLocaleDateString("pt-BR");
  const vol = c.volume_litros != null ? ` · ${c.volume_litros.toLocaleString("pt-BR")} L` : "";
  return `${company?.razao_social ?? "Cliente"} · ${date}${vol}`;
}

function DocumentForm({
  doc,
  collections,
  onCancel,
  action,
}: {
  doc?: Document;
  collections: CollectionOption[];
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div className="md:col-span-2">
          <label className="block text-[10.5px] text-steel mb-1">Coleta</label>
          <select name="collection_id" required defaultValue={doc?.collection_id ?? ""} className={inputClasses}>
            <option value="" disabled>
              Selecione a coleta…
            </option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {collectionLabel(c)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10.5px] text-steel mb-1">Tipo</label>
          <select name="type" required defaultValue={doc?.type ?? "CCO"} className={inputClasses}>
            <option value="CCO">CCO</option>
            <option value="MTR">MTR</option>
          </select>
        </div>
        <div>
          <label className="block text-[10.5px] text-steel mb-1">Status</label>
          <select name="status" defaultValue={doc?.status ?? "draft"} className={inputClasses}>
            <option value="draft">Rascunho</option>
            <option value="issued">Emitido</option>
            <option value="canceled">Cancelado</option>
          </select>
        </div>
        <div>
          <label className="block text-[10.5px] text-steel mb-1">Número do documento</label>
          <input name="document_number" defaultValue={doc?.document_number ?? ""} className={inputClasses} />
        </div>
        <div>
          <label className="block text-[10.5px] text-steel mb-1">Data de emissão</label>
          <input type="date" name="issue_date" defaultValue={doc?.issue_date ?? ""} className={inputClasses} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-[10.5px] text-steel mb-1">Link do arquivo (PDF)</label>
          <input name="file_url" defaultValue={doc?.file_url ?? ""} className={inputClasses} placeholder="https://…" />
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
          className="font-mono text-[11px] uppercase tracking-[0.05em] bg-ink text-brand-green border-[1.5px] border-brand-amber rounded-full px-3.5 py-1.5 disabled:opacity-50"
        >
          {pending ? "Salvando…" : "Salvar"}
        </button>
      </div>
    </form>
  );
}

export function DocumentsBoard({ documents, collections }: { documents: Document[]; collections: CollectionOption[] }) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Excluir este documento?")) return;
    setDeletingId(id);
    const result = await deleteDocument(id);
    setDeletingId(null);
    if ("error" in result) alert(result.error);
  }

  async function handleGeneratePdf(id: string) {
    setGeneratingId(id);
    const result = await generateDocumentPdf(id);
    setGeneratingId(null);
    if ("error" in result) alert(result.error);
  }

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="font-mono text-[11.5px] uppercase tracking-[0.05em] bg-ink text-brand-green border-[1.5px] border-brand-amber rounded-full px-4 py-2"
        >
          {showCreate ? "Fechar" : "+ Novo documento"}
        </button>
      </div>

      {showCreate && <DocumentForm collections={collections} onCancel={() => setShowCreate(false)} action={createDocument} />}

      {documents.length === 0 ? (
        <div className="bg-white border border-ink/10 p-8 text-[15px] text-steel">Nenhum documento emitido ainda.</div>
      ) : (
        <div className="bg-white border border-ink/10 divide-y divide-ink/10">
          {documents.map((d) =>
            editingId === d.id ? (
              <div key={d.id} className="p-4">
                <DocumentForm doc={d} collections={collections} onCancel={() => setEditingId(null)} action={updateDocument.bind(null, d.id)} />
              </div>
            ) : (
              <div key={d.id} className="p-4 flex items-center justify-between gap-6 flex-wrap">
                <div>
                  <div className="text-[14.5px] font-medium text-ink">
                    {TYPE_LABEL[d.type] ?? d.type} {d.document_number ? `· ${d.document_number}` : ""}
                  </div>
                  <div className="text-[12px] text-steel mt-1">
                    {(() => {
                      const c = Array.isArray(d.collections) ? d.collections[0] : d.collections;
                      const company = c ? (Array.isArray(c.companies) ? c.companies[0] : c.companies) : null;
                      return company ? `${company.razao_social} · ${new Date(c!.collection_date).toLocaleDateString("pt-BR")}` : "—";
                    })()}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[11.5px] font-mono uppercase tracking-[0.04em] border rounded-full px-3 py-1 whitespace-nowrap ${STATUS_CLASSES[d.status] ?? "text-steel border-ink/15"}`}
                  >
                    {STATUS_LABEL[d.status] ?? d.status}
                  </span>
                  {d.file_url && (
                    <a
                      href={d.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[10.5px] uppercase tracking-[0.05em] text-brand-green-deep hover:underline whitespace-nowrap"
                    >
                      Ver PDF
                    </a>
                  )}
                  <button
                    onClick={() => handleGeneratePdf(d.id)}
                    disabled={generatingId === d.id}
                    className="font-mono text-[10.5px] uppercase tracking-[0.05em] border border-ink/15 rounded-full px-3 py-1.5 whitespace-nowrap disabled:opacity-50"
                  >
                    {generatingId === d.id ? "Gerando…" : d.file_url ? "Regerar PDF" : "Gerar PDF"}
                  </button>
                  <button onClick={() => setEditingId(d.id)} aria-label="Editar" className="text-[15px] text-steel hover:text-ink">
                    ✎
                  </button>
                  <button
                    onClick={() => handleDelete(d.id)}
                    disabled={deletingId === d.id}
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
