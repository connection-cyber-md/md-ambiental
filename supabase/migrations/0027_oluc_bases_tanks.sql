-- Fundação do domínio OLUC (PRD-OLUC-001 §9.9, §11): bases e tanques.
-- Estrutura física do tenant onde o material coletado é armazenado antes da
-- expedição. São dados de cadastro/estrutura (como financial_accounts), não
-- dado transacional — por isso sem is_synthetic, mesma lógica de 0024.
--
-- Acesso restrito a papéis internos administrativos/operacionais: estoque e
-- estrutura de base não fazem parte do portal do gerador (client) nem do
-- app do motorista (tenant_driver não opera dentro da base).

create type public.tank_status as enum ('active', 'maintenance', 'inactive');

create table public.bases (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  address_logradouro text,
  address_numero text,
  address_bairro text,
  address_cidade text,
  address_uf text,
  address_cep text,
  capacity_total_litros numeric(12, 2),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bases enable row level security;

create policy "bases_select" on public.bases for select
  using (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  );

create policy "bases_insert" on public.bases for insert
  with check (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  );

create policy "bases_update" on public.bases for update
  using (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  )
  with check (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  );

create policy "bases_delete" on public.bases for delete
  using (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() = 'tenant_admin')
  );

-- tanks: compartimentos de armazenagem dentro de uma base. code é o rótulo
-- humano (ex: "T-01"); material_class é texto livre nesta fase (classe de
-- compatibilidade) — vira enum quando a Matriz Regulatória definir as classes.
create table public.tanks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  base_id uuid not null references public.bases(id) on delete cascade,
  code text not null,
  capacity_litros numeric(12, 2) not null,
  material_class text,
  status public.tank_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, base_id, code)
);

alter table public.tanks enable row level security;

create policy "tanks_select" on public.tanks for select
  using (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  );

create policy "tanks_insert" on public.tanks for insert
  with check (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  );

create policy "tanks_update" on public.tanks for update
  using (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  )
  with check (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  );

create policy "tanks_delete" on public.tanks for delete
  using (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() = 'tenant_admin')
  );

create index tanks_base_idx on public.tanks (base_id);

grant select, insert, update, delete on
  public.bases,
  public.tanks
to authenticated;
