import Link from "next/link";

export const metadata = {
  title: "Manual de Instruções & Arquitetura | MD Ambiental",
  description: "Guia oficial de utilização do sistema e documentação técnica da plataforma.",
};

export default function AdminManualPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-8 border-b border-ink/10 pb-4">
        <div>
          <span className="font-mono text-[12px] uppercase tracking-wider text-brand-green-deep block mb-1">
            Governança & Instruções
          </span>
          <h1 className="font-display text-[28px] text-ink">Manual de Operação da Plataforma</h1>
        </div>
        <Link
          href="/admin"
          className="bg-paper border border-ink/20 px-4 py-2 rounded text-[13px] font-mono hover:bg-ink hover:text-white transition-colors"
        >
          ← Voltar ao Painel Principal
        </Link>
      </div>

      {/* Conteúdo do Manual */}
      <div className="bg-white border border-ink/10 rounded-lg p-8 shadow-xs space-y-8">
        <div>
          <h2 className="font-display text-[20px] text-brand-green-deep mb-2">1. Visão Geral do Sistema</h2>
          <p className="text-[14px] text-steel">
            A plataforma da MD Ambiental foi estruturada para automatizar o ciclo completo da logística de Óleo Lubrificante Usado ou Contaminado (OLUC). Desde a captação de leads via WhatsApp até o fechamento de lotes para rerrefino e emissão de faturas.
          </p>
        </div>

        <div className="border-t border-ink/10 pt-6">
          <h2 className="font-display text-[20px] text-brand-green-deep mb-2">2. Módulos e Funcionalidades Principais</h2>
          <ul className="list-disc pl-5 text-[14px] text-steel space-y-2">
            <li><strong>Webhook & CRM (/admin/crm):</strong> Ingestão automática de contatos e conversão em oportunidades comerciais.</li>
            <li><strong>Impacto & Lotes (/admin/impacto):</strong> Consolidação de métricas socioambientais e fechamento de lotes de expedição.</li>
            <li><strong>Compliance (/admin/compliance):</strong> Auditoria de CADRI, MTRs e controle de prazos de validade de licenças operacionais.</li>
            <li><strong>Frota e Rotas (/operacional):</strong> Gestão de caminhões-tanque, controle de TCO de manutenção e escalonamento de motoristas.</li>
            <li><strong>Contratos e Financeiro (/admin/financeiro):</strong> Faturamento de coletas, repasses e fluxo de caixa de tesouraria.</li>
          </ul>
        </div>

        <div className="border-t border-ink/10 pt-6">
          <h2 className="font-display text-[20px] text-brand-green-deep mb-2">3. Orientações Técnicas e Suporte</h2>
          <p className="text-[14px] text-steel">
            O sistema opera sob protocolos estritos de segurança com Supabase RLS ativo. Em caso de dúvidas operacionais ou necessidade de suporte técnico avançado, consulte o arquiteto responsável ou verifique os logs no diretório do projeto.
          </p>
        </div>
      </div>
    </div>
  );
}