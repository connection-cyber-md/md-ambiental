import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata = {
  title: "CRM e Pipelines de Coleta | MD Ambiental",
  description: "Gestão de leads, contatos e funil de atendimento de geradores de OLUC.",
};

interface CrmDeal {
  id: string;
  pipeline_stage: string;
  estimated_volume_litros: number | null;
  created_at: string;
  companies: {
    razao_social: string;
    cnpj: string;
  } | null;
  contacts: {
    name: string;
    phone: string;
  } | null;
}

export default async function AdminCrmPage() {
  const supabase = await createClient();

  // Consulta segura utilizando asserção para contornar o schema do Supabase em staging
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawDeals, error } = await (supabase.from("oluc_crm_deals" as any))
    .select("id, pipeline_stage, estimated_volume_litros, created_at, companies(razao_social, cnpj), contacts(name, phone)")
    .order("created_at", { ascending: false });

  const deals = (rawDeals as unknown as CrmDeal[]) || [];

  const solicitacoes = deals.filter((d) => d.pipeline_stage === "lead_solicitacao");
  const agendados = deals.filter((d) => d.pipeline_stage === "agendado");
  const concluidos = deals.filter((d) => d.pipeline_stage === "concluido");

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b border-ink/10 pb-4">
        <div>
          <span className="font-mono text-[12px] uppercase tracking-wider text-brand-green-deep block mb-1">
            Módulo CRM & WhatsApp
          </span>
          <h1 className="font-display text-[28px] text-ink">Funil de Coletas e Atendimento</h1>
        </div>
        <Link
          href="/admin"
          className="bg-paper border border-ink/20 px-4 py-2 rounded text-[13px] font-mono hover:bg-ink hover:text-white transition-colors"
        >
          ← Voltar ao Painel
        </Link>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 p-4 rounded text-red-700 text-[14px]">
          Erro ao carregar o pipeline do CRM. Verifique a conexão com o banco.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Coluna 1: Leads / Solicitações */}
          <div className="bg-paper border border-ink/10 p-5 rounded-lg">
            <h3 className="font-mono text-[14px] font-medium text-ink mb-4 pb-2 border-b border-ink/10 flex justify-between">
              <span>Novas Solicitações</span>
              <span className="text-steel">({solicitacoes.length})</span>
            </h3>
            <div className="space-y-3">
              {solicitacoes.map((deal) => (
                <div key={deal.id} className="bg-white p-4 rounded border border-ink/10 shadow-xs">
                  <div className="font-medium text-[14px] text-ink mb-1">
                    {deal.companies?.razao_social || "Gerador sem nome"}
                  </div>
                  <div className="text-[12px] text-steel font-mono mb-2">
                    CNPJ: {deal.companies?.cnpj || "Não informado"}
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-mono pt-2 border-t border-paper">
                    <span className="text-brand-green-deep font-semibold">
                      {deal.estimated_volume_litros ? `${deal.estimated_volume_litros} L` : "Volume a avaliar"}
                    </span>
                    <span className="text-steel">{new Date(deal.created_at).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>
              ))}
              {solicitacoes.length === 0 && (
                <p className="text-[13px] text-steel text-center py-6 font-mono">Nenhum lead no momento.</p>
              )}
            </div>
          </div>

          {/* Coluna 2: Agendados / Em Rota */}
          <div className="bg-paper border border-ink/10 p-5 rounded-lg">
            <h3 className="font-mono text-[14px] font-medium text-ink mb-4 pb-2 border-b border-ink/10 flex justify-between">
              <span>Coletas Agendadas</span>
              <span className="text-steel">({agendados.length})</span>
            </h3>
            <div className="space-y-3">
              {agendados.map((deal) => (
                <div key={deal.id} className="bg-white p-4 rounded border border-ink/10 shadow-xs">
                  <div className="font-medium text-[14px] text-ink mb-1">
                    {deal.companies?.razao_social || "Gerador sem nome"}
                  </div>
                  <div className="text-[12px] text-steel font-mono mb-2">
                    Contato: {deal.contacts?.name || "Direto"} ({deal.contacts?.phone || "-"})
                  </div>
                </div>
              ))}
              {agendados.length === 0 && (
                <p className="text-[13px] text-steel text-center py-6 font-mono">Nenhuma coleta agendada.</p>
              )}
            </div>
          </div>

          {/* Coluna 3: Concluídos / Rerrefino */}
          <div className="bg-paper border border-ink/10 p-5 rounded-lg">
            <h3 className="font-mono text-[14px] font-medium text-ink mb-4 pb-2 border-b border-ink/10 flex justify-between">
              <span>Concluídos / Destinados</span>
              <span className="text-steel">({concluidos.length})</span>
            </h3>
            <div className="space-y-3">
              {concluidos.map((deal) => (
                <div key={deal.id} className="bg-white p-4 rounded border border-ink/10 shadow-xs">
                  <div className="font-medium text-[14px] text-ink mb-1">
                    {deal.companies?.razao_social || "Gerador sem nome"}
                  </div>
                  <div className="text-[12px] text-brand-green-deep font-mono">
                    Cadeia de custódia fechada
                  </div>
                </div>
              ))}
              {concluidos.length === 0 && (
                <p className="text-[13px] text-steel text-center py-6 font-mono">Nenhum histórico concluído.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}