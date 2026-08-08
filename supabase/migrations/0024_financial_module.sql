-- Módulo financeiro (Fase 1): contas bancárias/caixa, plano de contas
-- simplificado e lançamentos. Restrito a tenant_admin/system_admin — dado
-- financeiro não é exposto a operacional, motorista nem cliente.

create type public.financial_account_kind as enum ('banco', 'caixa');

create type public.financial_entry_type as enum ('receita', 'despesa');

create type public.financial_entry_status as enum ('pending', 'paid', 'canceled');

-- financial_accounts: onde o dinheiro entra/sai (conta bancária ou caixa físico).
create table public.financial_accounts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  kind public.financial_account_kind not null,
  bank_name text,
  initial_balance numeric(12, 2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.financial_accounts enable row level security;

create policy "financial_accounts_select" on public.financial_accounts for select
  using (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() = 'tenant_admin')
  );

create policy "financial_accounts_insert" on public.financial_accounts for insert
  with check (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() = 'tenant_admin')
  );

create policy "financial_accounts_update" on public.financial_accounts for update
  using (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() = 'tenant_admin')
  )
  with check (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() = 'tenant_admin')
  );

create policy "financial_accounts_delete" on public.financial_accounts for delete
  using (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() = 'tenant_admin')
  );

-- financial_categories: plano de contas simplificado (não hierárquico por ora).
create table public.financial_categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  type public.financial_entry_type not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.financial_categories enable row level security;

create policy "financial_categories_select" on public.financial_categories for select
  using (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() = 'tenant_admin')
  );

create policy "financial_categories_insert" on public.financial_categories for insert
  with check (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() = 'tenant_admin')
  );

create policy "financial_categories_update" on public.financial_categories for update
  using (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() = 'tenant_admin')
  )
  with check (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() = 'tenant_admin')
  );

create policy "financial_categories_delete" on public.financial_categories for delete
  using (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() = 'tenant_admin')
  );

-- financial_entries: lançamentos (receita/despesa). reference_type/reference_id
-- permitem ligar um lançamento a uma coleta, documento ou tarefa BPO sem FK
-- rígida (evita acoplar o módulo financeiro a todo o resto do schema).
-- is_synthetic marca lançamentos gerados para demonstração/teste — ver Fase 4.
create table public.financial_entries (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  account_id uuid not null references public.financial_accounts(id) on delete restrict,
  category_id uuid not null references public.financial_categories(id) on delete restrict,
  type public.financial_entry_type not null,
  description text not null,
  amount numeric(12, 2) not null check (amount > 0),
  entry_date date not null,
  due_date date,
  paid_date date,
  status public.financial_entry_status not null default 'pending',
  reference_type text,
  reference_id uuid,
  is_synthetic boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.financial_entries enable row level security;

create policy "financial_entries_select" on public.financial_entries for select
  using (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() = 'tenant_admin')
  );

create policy "financial_entries_insert" on public.financial_entries for insert
  with check (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() = 'tenant_admin')
  );

create policy "financial_entries_update" on public.financial_entries for update
  using (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() = 'tenant_admin')
  )
  with check (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() = 'tenant_admin')
  );

create policy "financial_entries_delete" on public.financial_entries for delete
  using (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() = 'tenant_admin')
  );

create index financial_entries_tenant_date_idx on public.financial_entries (tenant_id, entry_date);
create index financial_entries_tenant_status_idx on public.financial_entries (tenant_id, status);

-- Grants explícitos (mesmo motivo de 0019/0022: o papel do CLI push não herda
-- o auto-grant do Supabase hospedado).
grant select, insert, update, delete on
  public.financial_accounts,
  public.financial_categories,
  public.financial_entries
to authenticated;
