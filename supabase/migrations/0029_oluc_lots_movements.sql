-- Fundação do domínio OLUC (PRD-OLUC-001 §9.9): lotes e movimentações de
-- estoque. Um lote agrega volume dentro de um tanque; movimentações
-- registram cada entrada/saída/ajuste com sinal (volume_litros positivo =
-- acréscimo no tanque/lote, negativo = decréscimo), permitindo reconstruir o
-- saldo por soma sem uma coluna de saldo redundante.
--
-- Transferência entre tanques gera duas linhas (saída + entrada) ligadas por
-- related_movement_id, para manter uma única tabela de movimentos em vez de
-- um modelo de "movimento com origem e destino".

create type public.lot_status as enum ('open', 'closed', 'expedited', 'blocked');

create type public.movement_type as enum ('entrada', 'transferencia', 'ajuste', 'perda', 'expedicao', 'inventario');

create table public.lots (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  tank_id uuid not null references public.tanks(id) on delete restrict,
  code text not null,
  quality_classification text,
  volume_litros numeric(12, 2) not null default 0,
  status public.lot_status not null default 'open',
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  is_synthetic boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, code)
);

alter table public.lots enable row level security;

create policy "lots_select" on public.lots for select
  using (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  );

create policy "lots_insert" on public.lots for insert
  with check (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  );

create policy "lots_update" on public.lots for update
  using (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  )
  with check (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  );

create policy "lots_delete" on public.lots for delete
  using (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() = 'tenant_admin')
  );

-- stock_movements: coleta (collection_id) alimenta uma entrada; expedição
-- debita via type = 'expedicao' (o vínculo formal com a expedição vive em
-- expedition_lots, criada em 0030 — aqui é só o efeito no saldo do tanque).
create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  tank_id uuid not null references public.tanks(id) on delete restrict,
  lot_id uuid references public.lots(id) on delete set null,
  collection_id uuid references public.collections(id) on delete set null,
  related_movement_id uuid references public.stock_movements(id) on delete set null,
  type public.movement_type not null,
  volume_litros numeric(12, 2) not null check (volume_litros <> 0),
  reason text,
  created_by uuid references public.profiles(id) on delete set null,
  is_synthetic boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.stock_movements enable row level security;

create policy "stock_movements_select" on public.stock_movements for select
  using (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  );

create policy "stock_movements_insert" on public.stock_movements for insert
  with check (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  );

create policy "stock_movements_update" on public.stock_movements for update
  using (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  )
  with check (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  );

create policy "stock_movements_delete" on public.stock_movements for delete
  using (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() = 'tenant_admin')
  );

create index lots_tank_idx on public.lots (tank_id);
create index stock_movements_tank_idx on public.stock_movements (tank_id);
create index stock_movements_lot_idx on public.stock_movements (lot_id);

grant select, insert, update, delete on
  public.lots,
  public.stock_movements
to authenticated;
