import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata = {
  title: "Gestão de Coletas OLUC | MD Ambiental",
  description: "Controle de ordens de coleta, rotas e emissão de certificados.",
};

interface CollectionItem {
  id: string;
  status: string;
  volume_coletado: number | null;
  created_at: string;
  companies: {
    razao_social: string;
    cnpj: string;
  } | null;
  drivers: {
    name: string;
  } | null;
}

export default async function AdminColetasPage() {
  const supabase = await createClient();

  // Consulta segura das coletas operacionais integradas com empresas e motoristas
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawCollections, error } = await (supabase.from("collections" as any))
    .select("id, status, volume_coletado, created_at, companies(razao_social, cnpj), drivers(name)")
    .order("created_at", { ascending: false });

  const collections = (rawCollections as unknown as CollectionItem[]) || [];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b border-ink/10 pb-4">
        <div>
          <span className="font-mono text-[12px] uppercase tracking-wider text-brand-green-deep block mb-1">
            Módulo Operacional & Logística
          </span>
          <h1 className="font-display text-[28px] text-ink">Ordens de Coleta de OLUC</h1>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/crm"
            className="bg-paper border border-ink/20 px-4 py-2 rounded text-[13px] font-mono hover:bg-ink hover:text-white transition-colors"
          >
            Ver CRM
          </Link>
          <Link
            href="/admin"
            className="bg-paper border border-ink/20 px-4 py-2 rounded text-[13px] font-mono hover:bg-ink hover:text-white transition-colors"
          >
            ← Painel Principal
          </Link>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 p-4 rounded text-red-700 text-[14px]">
          Erro ao carregar as ordens de coleta. Verifique o banco de dados em staging.
        </div>
      ) : (
        <div className="bg-white border border-ink/10 rounded-lg overflow-hidden shadow-xs">
          <div className="p-4 bg-paper border-b border-ink/10 font-mono text-[13px] font-medium text-ink flex justify-between items-center">
            <span>Listagem Geral de Coletas</span>
            <span className="text-steel">Total: {collections.length}</span>
          </div>
          <div className="divide-y divide-ink/10">
            {collections.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between hover:bg-paper/50 transition-colors">
                <div>
                  <div className="font-medium text-[15px] text-ink mb-0.5">
                    {item.companies?.razao_social || "Gerador não especificado"}
                  </div>
                  <div className="text-[12px] text-steel font-mono">
                    CNPJ: {item.companies?.cnpj || "N/A"} | Motorista: {item.drivers?.name || "Não atribuído"}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-mono text-[14px] font-semibold text-brand-green-deep">
                      {item.volume_coletado ? `${item.volume_coletado} Litros` : "Pendente"}
                    </div>
                    <div className="text-[11px] font-mono text-steel uppercase">
                      {item.status}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {collections.length === 0 && (
              <div className="text-center py-12 text-steel font-mono text-[13px]">
                Nenhuma ordem de coleta registrada no momento.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}