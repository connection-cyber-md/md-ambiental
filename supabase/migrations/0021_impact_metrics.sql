-- impact_metrics: métricas de impacto socioambiental para exibição pública
-- na home institucional (ex.: litros coletados, CO2 evitado) e gestão em
-- /admin/impacto. Diferente de dashboards_metrics (que é interno e nunca
-- exposto a `client`/anônimo), esta tabela é a PRIMEIRA do projeto com
-- leitura pública sem login — só linhas com is_published = true.
--
-- computation_mode distingue duas origens de valor:
--   'manual'          -> value é digitado e mantido à mão em /admin/impacto
--   'auto_collections' -> value é (futuramente, no incremento seguinte)
--                         recalculado a partir de public.collections;
--                         aqui a coluna guarda o último valor calculado.

create table public.impact_metrics (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  metric_key text not null,
  label text not null,
  unit text,
  value numeric not null default 0,
  computation_mode text not null default 'manual' check (computation_mode in ('manual', 'auto_collections')),
  period_label text,
  source text,
  display_order int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, metric_key)
);

alter table public.impact_metrics enable row level security;

-- Leitura: qualquer visitante (anon) vê as linhas publicadas; equipe interna
-- do tenant (tenant_admin/tenant_operator) vê tudo, inclusive rascunhos, para
-- poder revisar antes de publicar; system_admin vê tudo de todos os tenants.
create policy "impact_metrics_select" on public.impact_metrics
  for select using (
    is_published = true
    or public.is_system_admin()
    or (tenant_id = public.tenant_id() and public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  );

create policy "impact_metrics_insert" on public.impact_metrics
  for insert with check (
    public.is_system_admin()
    or (tenant_id = public.tenant_id() and public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  );

create policy "impact_metrics_update" on public.impact_metrics
  for update using (
    public.is_system_admin()
    or (tenant_id = public.tenant_id() and public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  )
  with check (
    public.is_system_admin()
    or (tenant_id = public.tenant_id() and public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  );

-- Exclusão mais restrita que insert/update, mesmo padrão de companies/collections.
create policy "impact_metrics_delete" on public.impact_metrics
  for delete using (
    public.is_system_admin()
    or (tenant_id = public.tenant_id() and public.current_role_claim() = 'tenant_admin')
  );

-- GRANTs explícitos, no mesmo espírito da 0019 (o db push aqui não recebe
-- auto-grant do Supabase hospedado). `anon` é NOVO: até aqui nenhuma tabela
-- da aplicação concedia privilégio a `anon` porque não havia rota pública
-- sem login. Aqui isso é intencional — é o que permite a home institucional
-- ler as métricas publicadas sem o visitante estar autenticado.
grant usage on schema public to anon;
grant select on public.impact_metrics to anon;
grant select, insert, update, delete on public.impact_metrics to authenticated;
