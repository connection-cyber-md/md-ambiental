-- 1. ibge_code/uf de regulatory_matrix passam a ser opcionais: regra
--    federal (CONAMA, ANP, Lei 9.605/Decreto 6.514) vale o país inteiro,
--    não faz sentido duplicar por município. NULL nos dois = regra nacional.
alter table public.regulatory_matrix alter column ibge_code drop not null;
alter table public.regulatory_matrix alter column uf drop not null;

-- 2. companies_insert/update/delete só checavam tenant_id, sem checar
--    papel — mesmo padrão de risco já corrigido em profiles_update:
--    qualquer usuário do tenant (inclusive 'client') podia escrever direto
--    via API. Fecha para tenant_admin/tenant_operator (delete só
--    tenant_admin), mesmo padrão já usado em documents_insert/update.
drop policy if exists "companies_insert" on public.companies;
drop policy if exists "companies_update" on public.companies;
drop policy if exists "companies_delete" on public.companies;

create policy "companies_insert" on public.companies for insert
  with check (
    public.is_system_admin()
    or (tenant_id = public.tenant_id() and public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  );

create policy "companies_update" on public.companies for update
  using (
    public.is_system_admin()
    or (tenant_id = public.tenant_id() and public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  )
  with check (
    public.is_system_admin()
    or (tenant_id = public.tenant_id() and public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  );

create policy "companies_delete" on public.companies for delete
  using (
    public.is_system_admin()
    or (tenant_id = public.tenant_id() and public.current_role_claim() = 'tenant_admin')
  );

-- 3. companies_select também restrita: papéis internos veem todas as
--    empresas do tenant; 'client' só vê a própria (a tela do portal já
--    filtra explicitamente, mas a policy precisa impedir acesso direto via
--    API a empresas de terceiros também).
drop policy if exists "companies_select" on public.companies;

create policy "companies_select" on public.companies for select
  using (
    public.is_system_admin()
    or (tenant_id = public.tenant_id() and public.current_role_claim() <> 'client')
    or (
      tenant_id = public.tenant_id()
      and id = (select p.company_id from public.profiles p where p.id = auth.uid())
    )
  );
