import { createClient } from "@/lib/supabase/server";
import { DocumentsBoard } from "@/components/admin/DocumentsBoard";

export default async function AdminDocumentosPage() {
  const supabase = await createClient();

  const [documentsRes, collectionsRes] = await Promise.all([
    supabase
      .from("documents")
      .select("id, collection_id, type, document_number, file_url, issue_date, status, collections(collection_date, companies(razao_social))")
      .order("issue_date", { ascending: false, nullsFirst: true }),
    supabase
      .from("collections")
      .select("id, collection_date, volume_litros, companies(razao_social)")
      .order("collection_date", { ascending: false })
      .limit(100),
  ]);

  const hasError = Boolean(documentsRes.error || collectionsRes.error);
  const debugErrors = [documentsRes.error, collectionsRes.error]
    .filter(Boolean)
    .map((e) => `${e!.code ?? "?"}: ${e!.message}`);
  if (hasError) console.error("[/admin/documentos] query errors:", debugErrors);

  const documents = documentsRes.data ?? [];
  const collections = collectionsRes.data ?? [];

  return (
    <div>
      <p className="eyebrow">Backoffice</p>
      <h1 className="font-display text-[28px] text-ink mb-6">Documentos</h1>
      <p className="text-[14px] text-steel mb-6 max-w-[640px]">
        Certificados de Coleta (CCO) e Manifestos de Transporte (MTR) emitidos por coleta. Para CCO, o
        PDF é gerado automaticamente a partir dos dados reais da coleta — clique em &quot;Gerar PDF&quot;.
        MTR ainda usa link colado manualmente. O cliente vê tudo isso no Portal.
      </p>

      {hasError ? (
        <div className="bg-white border border-ink/10 p-8 text-[15px] text-steel">
          <p className="mb-2">Não foi possível carregar os documentos agora.</p>
          <p className="font-mono text-[12px] text-brand-amber-deep whitespace-pre-wrap">
            {debugErrors.join("\n")}
          </p>
        </div>
      ) : (
        <DocumentsBoard documents={documents} collections={collections} />
      )}
    </div>
  );
}
