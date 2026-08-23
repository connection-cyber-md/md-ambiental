import { createClient } from "@/lib/supabase/server";
import { CompliancePageClient } from "@/components/admin/CompliancePageClient";
import Link from "next/link";

export const metadata = {
  title: "Compliance & Licenciamento Ambiental | MD Ambiental",
  description: "Gestão rigorosa de CADRI, MTRs, licenças de operação e conformidade legal de OLUC.",
};

interface ComplianceDocument {
  id: string;
  title: string;
  document_type: string;
  expires_at: string | null;
  status: string;
  created_at: string;
  companies: {
    razao_social: string;
    cnpj: string;
  } | null;
}

export default async function AdminCompliancePage() {
  const supabase = await createClient();

  // 1. Consultas paralelas originais (Empresas e Matriz Regulatória) e documentos de compliance
  const [companiesRes, matrixRes, docsRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase.from("companies" as any)
      .select(
        "id, cnpj, razao_social, nome_fantasia, license_number, license_type, license_issuing_agency, license_issue_date, license_expiry_date, contact_name, contact_email, contact_phone, status, is_synthetic"
      )
      .order("license_expiry_date", { ascending: true, nullsFirst: false }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase.from("regulatory_matrix" as any)
      .select("id, ibge_code, uf, sphere, rule_title, rule_description, required_documents, blocking_condition, reference_law")
      .order("sphere", { ascending: true }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase.from("documents" as any)
      .select("id, title, document_type, expires_at, status, created_at, companies(razao_social, cnpj)")
      .order("expires_at", { ascending: true }),
  ]);

  const companies = companiesRes.data ?? [];
  const matrix = matrixRes.data ?? [];
  const documents = (docsRes.data as unknown as ComplianceDocument[]) || [];

  if (companiesRes.error || matrixRes.error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <h1 className="font-display text-[28px] text-ink mb-6">Conformidade</h1>
        <div className="bg-white border border-ink/10 p-8 text-[15px] text-steel">
          <p className="mb-2">Não foi possível carregar os dados agora. Tente recarregar a página.</p>
          <p className="font-mono text-[12px] text-brand-amber-deep whitespace-pre-wrap">
            {companiesRes.error?.message}
            {matrixRes.error?.message}
          </p>
        </div>
      </div>
    );
  }

  // Indicadores de Alerta de Vencimento
  const hoje = new Date();
  const documentosVencidos = documents.filter((doc) => doc.expires_at && new Date(doc.expires_at) < hoje).length;
  const documentosValidos = documents.filter((doc) => !doc.expires_at || new Date(doc.expires_at) >= hoje).length;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Cabeçalho Institucional & Navegação */}
      <div className="flex justify-between items-center mb-8 border-b border-ink/10 pb-4">
        <div>
          <span className="font-mono text-[12px] uppercase tracking-wider text-brand-green-deep block mb-1">
            Governança & Risco Ambiental
          </span>
          <h1 className="font-display text-[28px] text-ink">Compliance & Licenciamento de OLUC</h1>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/impacto"
            className="bg-paper border border-ink/20 px-4 py-2 rounded text-[13px] font-mono hover:bg-ink hover:text-white transition-colors"
          >
            ← Voltar para Impacto & Lotes
          </Link>
          <Link
            href="/admin"
            className="bg-paper border border-ink/20 px-4 py-2 rounded text-[13px] font-mono hover:bg-ink hover:text-white transition-colors"
          >
            Painel Principal
          </Link>
        </div>
      </div>

      {/* Cards de Status de Conformidade (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-lg border border-ink/10 shadow-xs">
          <span className="font-mono text-[11px] uppercase text-steel block mb-1">Documentos Monitorados</span>
          <div className="font-display text-[32px] text-ink">
            {documents.length} <span className="text-[16px] font-mono">Registros</span>
          </div>
          <p className="text-[12px] text-steel mt-2">CADRI, MTRs e Licenças de Operação sob custódia.</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-ink/10 shadow-xs">
          <span className="font-mono text-[11px] uppercase text-steel block mb-1">Em Conformidade (Válidos)</span>
          <div className="font-display text-[32px] text-brand-green-deep">
            {documentosValidos} <span className="text-[16px] font-mono">Ativos</span>
          </div>
          <p className="text-[12px] text-steel mt-2">Documentação legal dentro da validade vigiada.</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-ink/10 shadow-xs">
          <span className="font-mono text-[11px] uppercase text-steel block mb-1">Alertas de Vencimento</span>
          <div className="font-display text-[32px] text-amber-700">
            {documentosVencidos} <span className="text-[16px] font-mono">Vencidos</span>
          </div>
          <p className="text-[12px] text-steel mt-2">Exigem renovação imediata para liberar coletas.</p>
        </div>
      </div>

      {/* Componente Cliente Principal de Compliance (Preservado com tipagem segura) */}
      <div className="mb-10">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <CompliancePageClient companies={companies as any} rules={matrix as any} />
      </div>

      {/* Listagem Adicional de Auditoria de Licenças e Documentos */}
      <div className="bg-white border border-ink/10 rounded-lg overflow-hidden shadow-xs">
        <div className="p-4 bg-paper border-b border-ink/10 font-mono text-[13px] font-medium text-ink flex justify-between items-center">
          <span>Auditoria de Licenças e Documentos Regulatórios</span>
          <span className="text-steel">Total Auditoria: {documents.length}</span>
        </div>

        {docsRes.error ? (
          <div className="p-6 text-red-700 font-mono text-[13px]">
            Erro ao carregar os documentos adicionais de compliance.
          </div>
        ) : (
          <div className="divide-y divide-ink/10">
            {documents.map((doc) => {
              const isVencido = doc.expires_at ? new Date(doc.expires_at) < hoje : false;
              return (
                <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-paper/50 transition-colors">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono text-[15px] font-semibold text-ink">
                        {doc.title || "Documento Regulatório OLUC"}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${isVencido ? 'bg-red-100 text-red-800' : 'bg-brand-green/10 text-brand-green-deep'}`}>
                        {isVencido ? 'Vencido / Alerta' : 'Regular'}
                      </span>
                    </div>
                    <div className="text-[12px] text-steel font-mono">
                      Empresa: {doc.companies?.razao_social || "Empresa Cadastrada"} (CNPJ: {doc.companies?.cnpj || "N/A"})
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-mono text-[13px] font-semibold ${isVencido ? 'text-red-700' : 'text-ink'}`}>
                      Validade: {doc.expires_at ? new Date(doc.expires_at).toLocaleDateString("pt-BR") : "Prazo Indeterminado"}
                    </div>
                    <div className="text-[11px] font-mono text-steel uppercase mt-0.5">
                      Tipo: {doc.document_type || "Licença Ambiental"}
                    </div>
                  </div>
                </div>
              );
            })}

            {documents.length === 0 && (
              <div className="text-center py-16 text-steel font-mono text-[13px]">
                Nenhum documento adicional de compliance cadastrado no sistema.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}