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

  let deals: CrmDeal[] = [];
  let hasQueryError = false;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (supabase.from("oluc_crm_deals" as any))
      .select("id, pipeline_stage, estimated_volume_litros, created_at, companies(razao_social, cnpj), contacts(name, phone)")
      .order("created_at", { ascending: false });

    if (response.error) {
      // Se houver erro de permissão RLS ou tabela ausente, ativamos o modo de demonstração suavemente
      hasQueryError = true;
    } else if (response.data) {
      deals = (response.data as unknown as CrmDeal[]) || [];
    }
  } catch (err) {
    hasQueryError = true;
  }

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

      {hasQueryError && (
        <div className="mb-6 bg-amber-50 border border-amber-200 p-4 rounded text-amber-800 text-[13px] font-mono">
          ℹ️ Modo de demonstração ativo: As tabelas do CRM estão em fase de população ou restrição de política de acesso (RLS). O funil exibe o estado padrão de operação.
        </div>
      )}

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
              <div className="bg-white p-4 rounded border border-ink/10 text-center py-6">
                <div className="font-medium text-[13px] text-ink mb-1">Exemplo: Auto Posto São João Ltda</div>
                <div className="text-[11.5px] text-steel font-mono mb-2">CNPJ: 45.123.890/0001-22</div>
                <div className="flex justify-between items-center text-[11px] font-mono pt-2 border-t border-paper">
                  <span className="text-brand-green-deep font-semibold">450 L</span>
                  <span className="text-steel">Aguardando contato</span>
                </div>
              </div>
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
              <div className="bg-white p-4 rounded border border-ink/10 text-center py-6">
                <div className="font-medium text-[13px] text-ink mb-1">Exemplo: Indústria Metalúrgica Piracicaba</div>
                <div className="text-[11.5px] text-steel font-mono">Frota acionada · Rota 02</div>
              </div>
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
              <div className="bg-white p-4 rounded border border-ink/10 text-center py-6">
                <div className="font-medium text-[13px] text-ink mb-1">Exemplo: Transportadora Rodonorte</div>
                <div className="text-[11.5px] text-brand-green-deep font-mono">Certificado emitido</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}