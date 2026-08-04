-- companies: clientes geradores (restaurantes, oficinas, indústrias) que
-- geram o resíduo coletado pelo tenant.

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  cnpj text not null,
  razao_social text not null,
  nome_fantasia text,
  address_logradouro text,
  address_numero text,
  address_bairro text,
  address_cidade text,
  address_uf text,
  address_cep text,
  ibge_code text,
  license_number text,
  license_type text,
  license_issuing_agency text,
  license_issue_date date,
  license_expiry_date date,
  contact_name text,
  contact_email text,
  contact_phone text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, cnpj)
);

alter table public.companies enable row level security;

create policy "companies_select" on public.companies for select
  using (tenant_id = public.tenant_id() or public.is_system_admin());
create policy "companies_insert" on public.companies for insert
  with check (tenant_id = public.tenant_id() or public.is_system_admin());
create policy "companies_update" on public.companies for update
  using (tenant_id = public.tenant_id() or public.is_system_admin())
  with check (tenant_id = public.tenant_id() or public.is_system_admin());
create policy "companies_delete" on public.companies for delete
  using (tenant_id = public.tenant_id() or public.is_system_admin());

-- Now that companies exists, wire up the forward-reference from profiles
-- (see note in 0005_profiles.sql).
alter table public.profiles
  add constraint profiles_company_id_fkey
  foreign key (company_id) references public.companies(id) on delete set null;
