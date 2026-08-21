import { createClient } from "@/lib/supabase/server";
import { DocumentsPageClient } from "@/components/admin/DocumentsPageClient";

export default async function AdminDocumentosPage() {
  const supabase = await createClient();

  const [documentsRes, collectionsRes] = await Promise.all([
    supabase
      .from("documents")
      .select("id, collection_id, type, document_number, file_url, issue_date, status, is_synthetic, collections(collection_date, companies(razao_social))")
      // CRC (certificado de recebimento) é emitido pelo módulo de expedição
      // (features/expedicao), não por esta tela — que só lida com CCO/MTR
      // ligados a uma coleta.
      .in("type", ["CCO", "MTR"])
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

  // Filtro redundante com o .in() da query acima, mas dá ao TypeScript a
  // garantia de que "CRC" (destinatário, sem collection_id — 0034) não chega
  // neste componente, que só entende CCO/MTR ligados a uma coleta.
  const documents = (documentsRes.data ?? []).filter(
    (d): d is typeof d & { type: "CCO" | "MTR"; collection_id: string } =>
      (d.type === "CCO" || d.type === "MTR") && d.collection_id !== null
  );
  const collections = collectionsRes.data ?? [];

  if (hasError) {
    return (
      <div>
        <h1 className="font-display text-[28px] text-ink mb-6">Documentos</h1>
        <div className="bg-white border border-ink/10 p-8 text-[15px] text-steel">
          <p className="mb-2">Não foi possível carregar os documentos agora.</p>
          <p className="font-mono text-[12px] text-brand-amber-deep whitespace-pre-wrap">
            {debugErrors.join("\n")}
          </p>
        </div>
      </div>
    );
  }

  return <DocumentsPageClient documents={documents} collections={collections} />;
}
