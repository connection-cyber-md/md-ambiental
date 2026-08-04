-- tenants: the tenant boundary itself, so it has no tenant_id column.

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  cnpj text not null unique,
  razao_social text not null,
  nome_fantasia text,
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tenants enable row level security;

-- A tenant can see its own row (matched against the JWT's tenant_id claim);
-- system_admin sees all tenants (cross-tenant by design).
create policy "tenants_select" on public.tenants
  for select using (id = public.tenant_id() or public.is_system_admin());

-- Only system_admin creates/edits/removes tenants (licensing a new company
-- onto the platform is a platform-level action, not a tenant-level one).
create policy "tenants_insert" on public.tenants
  for insert with check (public.is_system_admin());

create policy "tenants_update" on public.tenants
  for update using (public.is_system_admin()) with check (public.is_system_admin());

create policy "tenants_delete" on public.tenants
  for delete using (public.is_system_admin());
