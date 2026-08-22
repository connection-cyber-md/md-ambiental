import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata = {
  title: "Inbox e Atendimento WhatsApp | MD Ambiental",
  description: "Central de atendimento em tempo real para geradores de OLUC.",
};

interface ConversationItem {
  id: string;
  status: string | null;
  updated_at: string;
  contacts: {
    name: string | null;
    phone: string;
    company_id: string | null;
  } | null;
}

export default async function AdminInboxPage() {
  const supabase = await createClient();

  // Consulta segura com asserção permitida pelo linter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawConversations, error } = await (supabase.from("conversations" as any))
    .select("id, status, updated_at, contacts(name, phone, company_id)")
    .order("updated_at", { ascending: false });

  const conversations = (rawConversations as unknown as ConversationItem[]) || [];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b border-ink/10 pb-4">
        <div>
          <span className="font-mono text-[12px] uppercase tracking-wider text-brand-green-deep block mb-1">
            Módulo CRM & Atendimento
          </span>
          <h1 className="font-display text-[28px] text-ink">Inbox WhatsApp — Solicitações de Coleta</h1>
        </div>
        <Link
          href="/admin/crm"
          className="bg-paper border border-ink/20 px-4 py-2 rounded text-[13px] font-mono hover:bg-ink hover:text-white transition-colors"
        >
          ← Voltar ao CRM
        </Link>
      </div>

      {error ? (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded text-amber-800 text-[14px] font-mono">
          Aviso: A tabela de conversas do inbox ainda não foi totalmente populada em staging. Certifique-se de que os webhooks do WhatsApp estão ativos.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Lista de Conversas */}
          <div className="bg-paper border border-ink/10 p-4 rounded-lg md:col-span-1">
            <h3 className="font-mono text-[13px] font-medium text-ink mb-3 pb-2 border-b border-ink/10">
              Conversas Recentes ({conversations.length})
            </h3>
            <div className="space-y-2">
              {conversations.map((conv) => (
                <div key={conv.id} className="bg-white p-3 rounded border border-ink/10 hover:border-brand-green cursor-pointer transition-colors">
                  <div className="font-medium text-[13.5px] text-ink">
                    {conv.contacts?.name || "Gerador / Contato Anônimo"}
                  </div>
                  <div className="text-[11.5px] text-steel font-mono">
                    {conv.contacts?.phone || "Sem telefone"}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] font-mono">
                    <span className="uppercase px-1.5 py-0.5 bg-paper rounded text-ink">{conv.status || "ativo"}</span>
                    <span className="text-steel">{new Date(conv.updated_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>
              ))}
              {conversations.length === 0 && (
                <p className="text-[13px] text-steel text-center py-8 font-mono">Nenhuma conversa no inbox.</p>
              )}
            </div>
          </div>

          {/* Painel da Mensagem Ativa */}
          <div className="bg-white border border-ink/10 p-6 rounded-lg md:col-span-2 flex flex-col justify-center items-center text-center">
            <div className="max-w-md">
              <div className="font-mono text-[12px] uppercase text-brand-green-deep tracking-wider mb-2">Canal Direto Ativo</div>
              <h3 className="font-display text-[20px] text-ink mb-2">Selecione uma conversa ao lado</h3>
              <p className="text-[13.5px] text-steel">
                Acompanhe o chat em tempo real com geradores solicitando coletas de OLUC, envie respostas rápidas ou dispare agendamentos automatizados.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}