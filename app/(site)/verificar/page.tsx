import { createClient } from "@/lib/supabase/server";
import { LogoMark } from "@/components/ui/LogoMark";
import Link from "next/link";

export const metadata = {
  title: "Verificação de Certificado de Coleta | MD Ambiental",
  description: "Validação pública de autenticidade de certificados e manifestos de coleta de OLUC.",
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function VerificarCertificadoPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const codigo = typeof resolvedParams.codigo === "string" 
    ? resolvedParams.codigo 
    : typeof resolvedParams.code === "string" 
    ? resolvedParams.code 
    : null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let certificado: any = null;
  let erroBusca = false;

  if (codigo) {
    const supabase = await createClient();
    
    // Consulta segura na tabela de documentos aceitando tanto id quanto document_number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from("documents" as any))
      .select("id, title, document_number, file_url, created_at, issued_at, status, companies(razao_social, cnpj)")
      .or(`id.eq.${codigo},document_number.eq.${codigo}`)
      .maybeSingle();

    if (error) {
      erroBusca = true;
    } else {
      certificado = data;
    }
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col justify-between py-12 px-6">
      <div className="max-w-xl mx-auto w-full pt-4">
        {/* Cabeçalho Institucional com LogoMark */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <LogoMark size={52} />
          </Link>
          <span className="font-mono text-[11px] uppercase tracking-wider text-brand-green-deep block mb-1">
            MD Ambiental — Cadeia de Custódia
          </span>
          <h1 className="font-display text-[26px] text-ink">Validação de Certificado OLUC</h1>
          <p className="text-[13.5px] text-steel mt-2">
            Consulte a autenticidade de documentos de coleta, destinação e rerrefino de óleo lubrificante usado.
          </p>
        </div>

        {/* Formulário de Busca */}
        <div className="bg-white p-6 rounded-lg border border-ink/10 shadow-xs mb-8">
          <form method="GET" action="/verificar" className="space-y-4">
            <div>
              <label className="block font-mono text-[12px] text-ink uppercase mb-1">
                Código de Autenticação / Número do Certificado
              </label>
              <input
                type="text"
                name="codigo"
                defaultValue={codigo || ""}
                placeholder="Ex: CERT-2026-XXXX ou ID único"
                required
                className="w-full bg-paper border border-ink/20 rounded p-3 text-[14px] font-mono text-ink focus:outline-none focus:border-brand-green"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-brand-green text-white py-3 rounded font-medium text-[14px] hover:bg-brand-green-deep transition-colors"
            >
              Verificar Autenticidade
            </button>
          </form>
        </div>

        {/* Exibição dos Resultados */}
        {codigo && (
          <div className="bg-white p-6 rounded-lg border border-ink/10 shadow-xs">
            {erroBusca ? (
              <div className="text-red-700 font-mono text-[13px] text-center py-4">
                Erro ao consultar o banco de dados. Tente novamente mais tarde.
              </div>
            ) : certificado ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-paper">
                  <span className="px-2.5 py-1 bg-brand-green/10 text-brand-green-deep font-mono text-[11px] uppercase rounded font-semibold">
                    Certificado Válido & Autêntico
                  </span>
                  <span className="font-mono text-[11px] text-steel">
                    {new Date(certificado.issued_at || certificado.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <div>
                  <div className="text-[12px] font-mono text-steel uppercase">Empresa Geradora / Emissora</div>
                  <div className="text-[16px] font-medium text-ink mt-0.5">
                    {certificado.companies?.razao_social || "Gerador Credenciado MD Ambiental"}
                  </div>
                  <div className="text-[12px] font-mono text-steel mt-0.5">
                    CNPJ: {certificado.companies?.cnpj || "N/A"}
                  </div>
                </div>
                <div className="pt-3 border-t border-paper flex justify-between items-center">
                  <div>
                    <span className="text-[11px] font-mono text-steel block">Referência</span>
                    <span className="text-[13.5px] text-ink font-mono font-medium">{certificado.document_number || certificado.title || "Manifesto de Coleta OLUC"}</span>
                  </div>
                  {certificado.file_url && (
                    <a
                      href={certificado.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-ink text-white px-4 py-2 rounded text-[12px] font-mono hover:bg-brand-green transition-colors"
                    >
                      Baixar PDF →
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-amber-800 font-mono text-[13px] mb-2 font-medium">
                  Nenhum certificado encontrado com o código &quot;{codigo}&quot;.
                </div>
                <p className="text-[12.5px] text-steel mb-4">
                  Verifique se o código foi digitado corretamente ou entre em contato com o suporte da MD Ambiental.
                </p>
                <Link
                  href="/verificar"
                  className="inline-block text-[12px] font-mono text-ink underline hover:text-brand-green"
                >
                  ← Tentar outro código
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rodapé Institucional */}
      <div className="text-center py-6 text-[11px] font-mono text-steel border-t border-ink/10 mt-10">
        MD Ambiental S.A. · Sistema Integrado de Gestão e Logística Reversa de OLUC
      </div>
    </div>
  );
}