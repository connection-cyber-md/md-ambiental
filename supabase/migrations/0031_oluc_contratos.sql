-- Fundação do domínio OLUC (PRD-OLUC-001 §9.12): contratos comerciais com
-- geradores (companies) ou destinatários. Dado comercial sensível (preço) —
-- mesma política restrita a tenant_admin usada no módulo financeiro (0024).
-- A RBAC atual não tem um papel "comercial" dedicado (só tenant_operator
-- genérico); quando existir, promover select/insert para esse papel aqui.

create type public.contract_party_type as enum ('gerador', 'destinatario');

create type public.contract_status as enum ('draft', 'active', 'suspended', 'terminated');

create table public.contracts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  party_type public.contract_party_type not null,
  company_id uuid references public.companies(id) on delete cascade,
  destinatario_id uuid references public.destinatarios(id) on delete cascade,
  start_date date not null,
  end_date date,
  price_per_litro numeric(10, 4),
  sla_hours integer,
  status public.contract_status not null default 'draft',
  notes text,
  is_synthetic boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contracts_party_matches_type check (
    (party_type = 'gerador' and company_id is not null and destinatario_id is null)
    or (party_type = 'destinatario' and destinatario_id is not null and company_id is null)
  )
);

alter table public.contracts enable row level security;

create policy "contracts_select" on public.contracts for select
  using (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() = 'tenant_admin')
  );

create policy "contracts_insert" on public.contracts for insert
  with check (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() = 'tenant_admin')
  );

create policy "contracts_update" on public.contracts for update
  using (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() = 'tenant_admin')
  )
  with check (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() = 'tenant_admin')
  );

create policy "contracts_delete" on public.contracts for delete
  using (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() = 'tenant_admin')
  );

create index contracts_company_idx on public.contracts (company_id);
create index contracts_destinatario_idx on public.contracts (destinatario_id);

grant select, insert, update, delete on public.contracts to authenticated;
