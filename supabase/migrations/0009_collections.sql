create table public.collections (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete restrict,
  driver_id uuid references public.drivers(id) on delete set null,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  collection_date timestamptz not null,
  volume_litros numeric(10, 2),
  status public.collection_status not null default 'scheduled',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.collections enable row level security;

-- A 'client' user only sees collections belonging to their own company
-- (resolved via profiles.company_id) — not the whole tenant's collections.
-- Internal roles (tenant_admin/tenant_operator/tenant_driver) see everything
-- in their tenant.
create policy "collections_select" on public.collections
  for select using (
    tenant_id = auth.tenant_id() and (
      auth.is_system_admin()
      or auth.current_role_claim() in ('tenant_admin', 'tenant_operator', 'tenant_driver')
      or company_id = (select p.company_id from public.profiles p where p.id = auth.uid())
    )
  );

-- Scheduling requests: a 'client' may create a collection request only for
-- their own company; internal roles may create for any company in the tenant.
create policy "collections_insert" on public.collections
  for insert with check (
    tenant_id = auth.tenant_id() and (
      auth.is_system_admin()
      or auth.current_role_claim() in ('tenant_admin', 'tenant_operator')
      or (
        auth.current_role_claim() = 'client'
        and company_id = (select p.company_id from public.profiles p where p.id = auth.uid())
      )
    )
  );

-- Updating status/volume/driver assignment is operational work — restricted
-- to internal roles, not the client who requested the pickup.
create policy "collections_update" on public.collections
  for update using (
    tenant_id = auth.tenant_id()
    and (auth.is_system_admin() or auth.current_role_claim() in ('tenant_admin', 'tenant_operator', 'tenant_driver'))
  )
  with check (
    tenant_id = auth.tenant_id()
    and (auth.is_system_admin() or auth.current_role_claim() in ('tenant_admin', 'tenant_operator', 'tenant_driver'))
  );

create policy "collections_delete" on public.collections
  for delete using (
    tenant_id = auth.tenant_id()
    and (auth.is_system_admin() or auth.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  );
