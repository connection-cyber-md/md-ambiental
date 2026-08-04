create table public.dashboards_metrics (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  metric_key text not null,
  metric_value numeric not null,
  scope text not null check (scope in ('comercial', 'operacional', 'compliance', 'financeiro', 'rh', 'ceo')),
  period_start date not null,
  period_end date not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

alter table public.dashboards_metrics enable row level security;

-- Internal-only, same reasoning as bpo_tasks: KPI rollups are not exposed
-- to the 'client' role.
create policy "dashboards_metrics_select" on public.dashboards_metrics for select
  using (
    public.is_system_admin()
    or (tenant_id = public.tenant_id() and public.current_role_claim() <> 'client')
  );
create policy "dashboards_metrics_insert" on public.dashboards_metrics for insert
  with check (
    public.is_system_admin()
    or (tenant_id = public.tenant_id() and public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  );
create policy "dashboards_metrics_update" on public.dashboards_metrics for update
  using (
    public.is_system_admin()
    or (tenant_id = public.tenant_id() and public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  )
  with check (
    public.is_system_admin()
    or (tenant_id = public.tenant_id() and public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  );
create policy "dashboards_metrics_delete" on public.dashboards_metrics for delete
  using (public.is_system_admin() or (tenant_id = public.tenant_id() and public.current_role_claim() = 'tenant_admin'));
