import Link from "next/link";

export const metadata = {
  title: "Manual de Governança & Operações | MD Ambiental",
  description: "Documentação técnica, manuais de operação e diretrizes enterprise da plataforma MD Ambiental.",
};

export default function AdminManualPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-8 border-b border-ink/10 pb-4">
        <div>
          <span className="font-mono text-[12px] uppercase tracking-wider text-brand-green-deep block mb-1">
            Governança & Arquitetura Enterprise
          </span>
          <h1 className="font-display text-[28px] text-ink">Manual Oficial da Plataforma MD Ambiental</h1>
        </div>
        <Link
          href="/admin"
          className="bg-paper border border-ink/20 px-4 py-2 rounded text-[13px] font-mono hover:bg-ink hover:text-white transition-colors"
        >
          ← Voltar ao Admin
        </Link>
      </div>

      {/* Conteúdo do Manual */}
      <div className="space-y-8">
        
        {/* Seção 1: Visão Geral */}
        <div className="bg-white border border-ink/10 rounded-lg p-6 shadow-xs">
          <h2 className="font-display text-[20px] text-ink mb-3">1. Visão Geral e Arquitetura do Sistema</h2>
          <p className="text-[14px] text-steel leading-relaxed mb-4">
            A plataforma MD Ambiental foi desenvolvida em Next.js 15 (App Router) com TypeScript e PostgreSQL (Supabase), estruturada sob rigorosos padrões de segurança corporativa (*Enterprise Grade*). O sistema gerencia toda a logística reversa de Óleo Lubrificante Usado e Contaminado (OLUC), integrando CRM via WhatsApp, BPO financeiro, controle de frotas e rotas, impacto ambiental e portais exclusivos para motoristas e geradores.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="p-4 bg-paper border border-ink/10 rounded">
              <span className="font-mono text-[11px] uppercase text-brand-green-deep block mb-1">Frontend</span>
              <span className="text-[13px] font-medium text-ink">Next.js 15 App Router + Tailwind CSS</span>
            </div>
            <div className="p-4 bg-paper border border-ink/10 rounded">
              <span className="font-mono text-[11px] uppercase text-brand-green-deep block mb-1">Backend & Banco</span>
              <span className="text-[13px] font-medium text-ink">Supabase PostgreSQL com RLS Ativo</span>
            </div>
            <div className="p-4 bg-paper border border-ink/10 rounded">
              <span className="font-mono text-[11px] uppercase text-brand-green-deep block mb-1">Qualidade</span>
              <span className="text-[13px] font-medium text-ink">Testes E2E (Playwright) & Build 100% Verde</span>
            </div>
          </div>
        </div>

        {/* Seção 2: Módulos Operacionais */}
        <div className="bg-white border border-ink/10 rounded-lg p-6 shadow-xs">
          <h2 className="font-display text-[20px] text-ink mb-3">2. Módulos Operacionais Ativos</h2>
          <ul className="space-y-3 text-[14px] text-steel">
            <li className="flex items-start gap-2">
              <span className="font-mono font-bold text-ink">• CRM & Leads:</span>
              <span>Captura de leads e automação de atendimento via Webhook do WhatsApp integrado ao fluxo comercial.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-mono font-bold text-ink">• Operacional & Frota:</span>
              <span>Gestão de coletas de OLUC, acompanhamento de ordens de serviço, veículos e otimização de rotas para motoristas.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-mono font-bold text-ink">• Compliance & Documentos:</span>
              <span>Emissão e controle de Manifestos de Transporte de Resíduos (MTRs), Certificados de Coleta de Óleo (CCO) e CADRIs.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-mono font-bold text-ink">• Portal do Gerador (Cliente):</span>
              <span>Área restrita onde empresas geradoras acompanham o histórico de coletas, status de licenças e realizam download de PDFs corporativos gerados via server-side.</span>
            </li>
          </ul>
        </div>

        {/* Seção 3: Protocolos de Segurança e RLS */}
        <div className="bg-white border border-ink/10 rounded-lg p-6 shadow-xs">
          <h2 className="font-display text-[20px] text-ink mb-3">3. Segurança, Isolamento de Dados e RLS</h2>
          <p className="text-[14px] text-steel leading-relaxed">
            Todas as tabelas transacionais críticas possuem o mecanismo de **Row Level Security (RLS)** ativado no Supabase. Isso garante isolamento estrito por *tenant* (`company_id`), impedindo qualquer acesso horizontal não autorizado entre diferentes empresas geradoras. O acesso às rotas administrativas é validado via Middleware e Server Actions protegidas por token de sessão ativo.
          </p>
        </div>

      </div>
    </div>
  );
}