-- Fundação do domínio OLUC (PRD-OLUC-001 §9.10): destinatários
-- (rerrefinadores/receptores autorizados) e expedições, encerrando a cadeia
-- de custódia do lado da saída da base.

create type public.expedition_status as enum ('scheduled', 'in_transit', 'delivered', 'reconciled', 'canceled');

-- destinatarios: espelha companies (cadastro + CNPJ), mas do lado de saída —
-- quem recebe o material expedido, com sua própria autorização/licença.
create table public.destinatarios (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  cnpj text not null,
  razao_social text not null,
  nome_fantasia text,
  authorization_number text,
  authorization_expiry_date date,
  address_cidade text,
  address_uf text,
  contact_name text,
  contact_email text,
  contact_phone text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, cnpj)
);

alter table public.destinatarios enable row level security;

create policy "destinatarios_select" on public.destinatarios for select
  using (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  );

create policy "destinatarios_insert" on public.destinatarios for insert
  with check (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  );

create policy "destinatarios_update" on public.destinatarios for update
  using (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  )
  with check (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  );

create policy "destinatarios_delete" on public.destinatarios for delete
  using (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() = 'tenant_admin')
  );

-- expeditions: saída consolidada de lotes para um destinatário.
-- receipt_document_id aponta para o documents (type futuro 'CRC', ver 0032)
-- que representa o certificado de recebimento anexado pelo destinatário.
create table public.expeditions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  destinatario_id uuid not null references public.destinatarios(id) on delete restrict,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  driver_id uuid references public.drivers(id) on delete set null,
  expedition_date timestamptz not null default now(),
  total_volume_litros numeric(12, 2),
  status public.expedition_status not null default 'scheduled',
  receipt_document_id uuid references public.documents(id) on delete set null,
  reconciled_at timestamptz,
  notes text,
  is_synthetic boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.expeditions enable row level security;

-- Select inclui o motorista designado para a expedição (mesmo padrão de
-- vehicle_shifts_select) — ele precisa ver a rota de entrega no destinatário.
create policy "expeditions_select" on public.expeditions for select
  using (
    tenant_id = public.tenant_id() and (
      public.is_system_admin()
      or public.current_role_claim() in ('tenant_admin', 'tenant_operator')
      or driver_id = (select d.id from public.drivers d where d.profile_id = auth.uid())
    )
  );

create policy "expeditions_insert" on public.expeditions for insert
  with check (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  );

create policy "expeditions_update" on public.expeditions for update
  using (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  )
  with check (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  );

create policy "expeditions_delete" on public.expeditions for delete
  using (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() = 'tenant_admin')
  );

-- expedition_lots: composição do lote expedido (PRD §9.10 "indicar
-- exatamente quais lotes/tanques e origens contribuíram para o volume").
create table public.expedition_lots (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  expedition_id uuid not null references public.expeditions(id) on delete cascade,
  lot_id uuid not null references public.lots(id) on delete restrict,
  volume_litros numeric(12, 2) not null check (volume_litros > 0),
  is_synthetic boolean not null default false,
  created_at timestamptz not null default now(),
  unique (expedition_id, lot_id)
);

alter table public.expedition_lots enable row level security;

create policy "expedition_lots_select" on public.expedition_lots for select
  using (
    tenant_id = public.tenant_id() and (
      public.is_system_admin()
      or public.current_role_claim() in ('tenant_admin', 'tenant_operator')
      or exists (
        select 1 from public.expeditions e
        join public.drivers d on d.id = e.driver_id
        where e.id = expedition_lots.expedition_id and d.profile_id = auth.uid()
      )
    )
  );

create policy "expedition_lots_insert" on public.expedition_lots for insert
  with check (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  );

create policy "expedition_lots_update" on public.expedition_lots for update
  using (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  )
  with check (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  );

create policy "expedition_lots_delete" on public.expedition_lots for delete
  using (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() = 'tenant_admin')
  );

create index expeditions_destinatario_idx on public.expeditions (destinatario_id);
create index expedition_lots_expedition_idx on public.expedition_lots (expedition_id);
create index expedition_lots_lot_idx on public.expedition_lots (lot_id);

grant select, insert, update, delete on
  public.destinatarios,
  public.expeditions,
  public.expedition_lots
to authenticated;
