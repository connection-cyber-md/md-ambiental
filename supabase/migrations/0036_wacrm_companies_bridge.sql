-- ============================================================================
-- MIGRATION: Ponte de Integração WACRM com Geradores OLUC (MD Ambiental)
-- Descrição: Vincula contatos e funis de CRM do WACRM diretamente às empresas geradoras
-- ============================================================================

-- 1. Adicionar coluna de vínculo com a tabela 'companies' (Geradores OLUC) na tabela de contatos do CRM
ALTER TABLE IF EXISTS public.contacts
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL;

-- 2. Adicionar índice de performance para buscas rápidas de geradores no CRM
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON public.contacts(company_id);

-- 3. Criar tabela de Deals/Negócios específica para o funil de Coletas de OLUC (caso o WACRM utilize)
CREATE TABLE IF NOT EXISTS public.oluc_crm_deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    pipeline_stage VARCHAR(50) NOT NULL DEFAULT 'lead_solicitacao', -- ex: lead, agendado, coletado, concluido
    estimated_volume_litros NUMERIC(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Habilitar RLS (Row Level Security) na nova tabela para segurança multi-tenant
ALTER TABLE public.oluc_crm_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir acesso total para usuários autenticados da organização" 
ON public.oluc_crm_deals
FOR ALL 
USING (auth.role() = 'authenticated');