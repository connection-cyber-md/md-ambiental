create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  plate text not null,
  model text,
  brand text,
  capacity_litros numeric(10, 2),
  status public.vehicle_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, plate)
);

alter table public.vehicles enable row level security;

create policy "vehicles_select" on public.vehicles for select
  using (tenant_id = public.tenant_id() or public.is_system_admin());
create policy "vehicles_insert" on public.vehicles for insert
  with check (tenant_id = public.tenant_id() or public.is_system_admin());
create policy "vehicles_update" on public.vehicles for update
  using (tenant_id = public.tenant_id() or public.is_system_admin())
  with check (tenant_id = public.tenant_id() or public.is_system_admin());
create policy "vehicles_delete" on public.vehicles for delete
  using (tenant_id = public.tenant_id() or public.is_system_admin());
