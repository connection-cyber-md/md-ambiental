import { createClient } from "@/lib/supabase/server";

const TYPE_LABEL: Record<string, string> = {
  CCO: "Certificado de Coleta de Óleo (CCO)",
  MTR: "Manifesto de Transporte de Resíduos (MTR)",
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

export default async function PortalDocumentosPage() {
  const supabase = await createClient();

  // documents_select já restringe pelo join com collections->company_id do
  // próprio usuário — não precisa filtrar company_id manualmente aqui como
  // nas outras telas do portal (RLS já cobre este caso, diferente de
  // companies_select).
  const documentsRes = await supabase
    .from("documents")
    .select("id, type, document_number, file_url, issue_date, status")
    .order("issue_date", { ascending: false });

  const documents = documentsRes.data ?? [];

  return (
    <div>
      <p className="eyebrow">Portal do Cliente</p>
      <h1 className="font-display text-[28px] text-ink mb-6">Documentos</h1>

      {documentsRes.error ? (
        <div className="bg-white border border-ink/10 p-8 text-[15px] text-steel">
          <p className="mb-2">Não foi possível carregar os documentos agora. Tente recarregar a página.</p>
          <p className="font-mono text-[12px] text-brand-amber-deep">
            {documentsRes.error.code}: {documentsRes.error.message}
          </p>
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white border border-ink/10 p-8 text-[15px] text-steel">
          Nenhum documento emitido ainda.
        </div>
      ) : (
        <div className="bg-white border border-ink/10 divide-y divide-ink/10">
          {documents.map((d) => (
            <div key={d.id} className="p-4 flex items-center justify-between gap-6 flex-wrap">
              <div>
                <div className="text-[14.5px] font-medium text-ink">
                  {TYPE_LABEL[d.type] ?? d.type} {d.document_number ? `· ${d.document_number}` : ""}
                </div>
                <div className="text-[12px] text-steel mt-1">
                  {d.issue_date ? `Emitido em ${new Date(d.issue_date).toLocaleDateString("pt-BR")}` : "Sem data de emissão"}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-[11.5px] font-mono uppercase tracking-[0.04em] border rounded-full px-3 py-1 whitespace-nowrap ${
                    STATUS_CLASSES[d.status] ?? "text-steel border-ink/15"
                  }`}
                >
                  {STATUS_LABEL[d.status] ?? d.status}
                </span>
                {d.file_url ? (
                  <a
                    href={d.file_url}
                    target="_blank"
                    rel="noopener"
                    className="text-[11.5px] font-mono uppercase tracking-[0.04em] bg-ink text-brand-green border-[1.5px] border-brand-amber rounded-full px-3 py-1 whitespace-nowrap hover:bg-ink-soft hover:border-brand-amber-deep transition-colors"
                  >
                    Baixar
                  </a>
                ) : (
                  <span className="text-[11.5px] text-steel whitespace-nowrap">Sem arquivo</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
