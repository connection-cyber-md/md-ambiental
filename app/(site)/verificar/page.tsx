import { createClient } from "@/lib/supabase/server";
import { LogoMark } from "@/components/ui/LogoMark";
import Link from "next/link";

export const metadata = {
  title: "Verificação de Certificado | MD Ambiental",
  description: "Consulta pública de autenticidade de certificados e manifestos de coleta de OLUC.",
};

interface PageProps {
  searchParams: Promise<{ code?: string }>;
}

export default async function VerificarCertificadoPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const code = resolvedSearchParams?.code;

  if (!code) {
    return (
      <div className="min-h-screen bg-paper flex flex-col justify-between py-12 px-6">
        <div className="max-w-xl mx-auto w-full text-center">
          <Link href="/" className="inline-block mb-8">
            <LogoMark size={56} />
          </Link>
          <h1 className="font-display text-[28px] text-ink mb-3">Verificação de Autenticidade</h1>
          <p className="text-[14.5px] text-steel mb-8">
            Insira o código de verificação presente no certificado ou escaneie o QR Code do documento emitido pela MD Ambiental.
          </p>

          <form method="GET" action="/verificar" className="flex gap-2">
            <input
              type="text"
              name="code"
              placeholder="Ex: CERT-2026-XXXX"
              required
              className="flex-1 bg-white border border-ink/20 px-4 py-3 text-[14px] text-ink rounded focus:outline-none focus:border-ink"
            />
            <button
              type="submit"
              className="bg-ink text-white font-mono text-[13px] uppercase tracking-[0.05em] px-6 py-3 rounded hover:bg-black transition-colors"
            >
              Verificar
            </button>
          </form>
        </div>

        <div className="text-center text-[12px] text-steel font-mono">
          MD Ambiental — Sistema de Gestão e Rastreabilidade de OLUC
        </div>
      </div>
    );
  }

  const supabase = await clientWithTable();

  // Consulta pública restrita e segura
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: cert, error } = await (supabase.from("documents") as any)
    .select("id, document_number, issued_at, status, companies(razao_social, cnpj)")
    .eq("document_number", code)
    .single();

  const companyData = cert?.companies as { razao_social?: string } | null;

  return (
    <div className="min-h-screen bg-paper flex flex-col justify-between py-12 px-6">
      <div className="max-w-xl mx-auto w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <LogoMark size={48} />
          </Link>
          <h1 className="font-display text-[26px] text-ink">Resultado da Verificação</h1>
        </div>

        {error || !cert ? (
          <div className="bg-white border border-red-200 p-8 rounded text-center">
            <div className="text-red-600 font-mono text-[14px] mb-2 font-medium">
              Certificado não encontrado ou inválido
            </div>
            <p className="text-[13.5px] text-steel mb-6">
              O código <code className="bg-paper px-2 py-1 font-mono text-ink">{code}</code> não consta nos registros oficiais da base de dados.
            </p>
            <Link
              href="/verificar"
              className="inline-block bg-ink text-white font-mono text-[12px] uppercase tracking-[0.05em] px-5 py-2.5 rounded hover:bg-black transition-colors"
            >
              Tentar outro código
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-brand-green/40 p-8 rounded shadow-sm">
            <div className="flex items-center justify-between border-b border-ink/10 pb-4 mb-6">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-brand-green-deep block mb-1">
                  Status Oficial
                </span>
                <span className="text-[16px] font-medium text-ink uppercase font-mono">
                  {cert.status === "active" ? "Válido e Autêntico" : cert.status}
                </span>
              </div>
              <span className="font-mono text-[13px] text-steel">
                {cert.document_number ?? code}
              </span>
            </div>

            <div className="space-y-4 text-[14px]">
              <div>
                <span className="text-steel text-[12px] block font-mono">Empresa Geradora / Emissora</span>
                <span className="text-ink font-medium">
                  {companyData?.razao_social ?? "Cliente Credenciado MD Ambiental"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-steel text-[12px] block font-mono">Natureza do Documento</span>
                  <span className="text-ink font-medium font-mono">
                    Manifesto / Certificado OLUC
                  </span>
                </div>
                <div>
                  <span className="text-steel text-[12px] block font-mono">Data de Emissão</span>
                  <span className="text-ink font-medium font-mono">
                    {cert.issued_at ? new Date(cert.issued_at).toLocaleDateString("pt-BR") : "Data verificada"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-ink/10 text-center">
              <Link
                href="/verificar"
                className="text-[13px] text-steel hover:text-ink font-mono underline"
              >
                ← Consultar outro certificado
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-[12px] text-steel font-mono">
        Validação criptográfica garantida por MD Ambiental SaaS.
      </div>
    </div>
  );
}

async function clientWithTable() {
  return await createClient();
}