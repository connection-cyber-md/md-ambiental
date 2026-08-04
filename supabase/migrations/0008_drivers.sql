create table public.drivers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  cnh_number text not null,
  cnh_category text,
  cnh_expiry date,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  status public.driver_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, profile_id)
);

alter table public.drivers enable row level security;

create policy "drivers_select" on public.drivers for select
  using (tenant_id = public.tenant_id() or public.is_system_admin());
create policy "drivers_insert" on public.drivers for insert
  with check (tenant_id = public.tenant_id() or public.is_system_admin());
create policy "drivers_update" on public.drivers for update
  using (tenant_id = public.tenant_id() or public.is_system_admin())
  with check (tenant_id = public.tenant_id() or public.is_system_admin());
create policy "drivers_delete" on public.drivers for delete
  using (tenant_id = public.tenant_id() or public.is_system_admin());
