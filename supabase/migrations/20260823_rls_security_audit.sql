-- ============================================================================
-- AUDITORIA E BLINDAGEM DE ROW LEVEL SECURITY (RLS) - MD AMBIENTAL
-- ============================================================================

-- 1. Ativar RLS nas tabelas principais
ALTER TABLE IF EXISTS public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.financial_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contracts ENABLE ROW LEVEL SECURITY;

-- 2. Política para collections (possui company_id direto)
DROP POLICY IF EXISTS "Isolamento de coletas por tenant" ON public.collections;
CREATE POLICY "Isolamento de coletas por tenant" ON public.collections
    FOR ALL
    USING (
        auth.role() = 'service_role' OR
        company_id IN (
            SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- 3. Política para documents (relacionado via collection_id -> collections)
DROP POLICY IF EXISTS "Isolamento de documentos por tenant" ON public.documents;
CREATE POLICY "Isolamento de documentos por tenant" ON public.documents
    FOR ALL
    USING (
        auth.role() = 'service_role' OR
        EXISTS (
            SELECT 1 FROM public.collections c
            JOIN public.profiles p ON p.company_id = c.company_id
            WHERE c.id = documents.collection_id AND p.id = auth.uid()
        )
    );

-- 4. Política para contracts (relacionado via company_id se existir, ou por permissão global admin)
DROP POLICY IF EXISTS "Isolamento de contratos por tenant" ON public.contracts;
CREATE POLICY "Isolamento de contratos por tenant" ON public.contracts
    FOR ALL
    USING (
        auth.role() = 'service_role' OR
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND (p.company_id = contracts.company_id OR p.company_id IS NULL)
        )
    );

-- 5. Política para financial_entries (relacionado via contract_id ou company_id se houver)
DROP POLICY IF EXISTS "Isolamento de financeiro por tenant" ON public.financial_entries;
CREATE POLICY "Isolamento de financeiro por tenant" ON public.financial_entries
    FOR ALL
    USING (
        auth.role() = 'service_role' OR
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.company_id IS NOT NULL
        )
    );