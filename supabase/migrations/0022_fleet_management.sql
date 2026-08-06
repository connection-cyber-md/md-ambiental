-- Gestão de frota e turnos: preenche o que /operacional e /motorista já
-- anunciam como "próxima fase". Duas tabelas novas (vehicle_shifts,
-- vehicle_maintenance) + colunas de vencimento em vehicles/drivers para o
-- bloqueio operacional (motorista/veículo irregular não pode abrir turno).

create type public.maintenance_type as enum (
  'oleo', 'pneu', 'lavagem', 'mecanica', 'documento'
);

-- Conformidade de frota: mesma convenção de nome já usada em
-- companies.license_expiry_date.
alter table public.vehicles
  add column license_expiry_date date,
  add column insurance_expiry_date date;

-- Conformidade de motorista: mesma convenção do cnh_expiry já existente.
alter table public.drivers
  add column mopp_expiry date;

-- Evolução de collections para OS roteirizável.
alter table public.collections
  add column route_order integer,
  add column estimated_distance_km numeric(10, 2);

-- vehicle_shifts: abertura/fechamento de turno do motorista (KM inicial/final,
-- combustível abastecido). Uma linha por turno.
create table public.vehicle_shifts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  driver_id uuid not null references public.drivers(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete restrict,
  start_time timestamptz not null default now(),
  end_time timestamptz,
  start_km numeric(10, 2) not null,
  end_km numeric(10, 2),
  fuel_added_liters numeric(10, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.vehicle_shifts enable row level security;

-- Select: papéis internos administrativos veem tudo do tenant; o motorista só
-- vê os próprios turnos (resolvido via drivers.profile_id = auth.uid()).
create policy "vehicle_shifts_select" on public.vehicle_shifts for select
  using (
    tenant_id = public.tenant_id() and (
      public.is_system_admin()
      or public.current_role_claim() in ('tenant_admin', 'tenant_operator')
      or driver_id = (select d.id from public.drivers d where d.profile_id = auth.uid())
    )
  );

-- Insert: motorista abre o próprio turno; tenant_admin/tenant_operator podem
-- abrir turno em nome de qualquer motorista do tenant (ex: ajuste manual).
create policy "vehicle_shifts_insert" on public.vehicle_shifts for insert
  with check (
    tenant_id = public.tenant_id() and (
      public.is_system_admin()
      or public.current_role_claim() in ('tenant_admin', 'tenant_operator')
      or (
        public.current_role_claim() = 'tenant_driver'
        and driver_id = (select d.id from public.drivers d where d.profile_id = auth.uid())
      )
    )
  );

-- Update: motorista fecha o próprio turno (end_time/end_km/fuel); papéis
-- administrativos podem corrigir qualquer turno do tenant.
create policy "vehicle_shifts_update" on public.vehicle_shifts for update
  using (
    tenant_id = public.tenant_id() and (
      public.is_system_admin()
      or public.current_role_claim() in ('tenant_admin', 'tenant_operator')
      or driver_id = (select d.id from public.drivers d where d.profile_id = auth.uid())
    )
  )
  with check (
    tenant_id = public.tenant_id() and (
      public.is_system_admin()
      or public.current_role_claim() in ('tenant_admin', 'tenant_operator')
      or driver_id = (select d.id from public.drivers d where d.profile_id = auth.uid())
    )
  );

create policy "vehicle_shifts_delete" on public.vehicle_shifts for delete
  using (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() = 'tenant_admin')
  );

-- vehicle_maintenance: despesas de manutenção/TCO por veículo. Só time
-- administrativo lança e vê — motorista não precisa (nem deve) enxergar custo.
create table public.vehicle_maintenance (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  maintenance_type public.maintenance_type not null,
  description text,
  cost numeric(10, 2) not null,
  maintenance_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.vehicle_maintenance enable row level security;

create policy "vehicle_maintenance_select" on public.vehicle_maintenance for select
  using (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  );

create policy "vehicle_maintenance_insert" on public.vehicle_maintenance for insert
  with check (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  );

create policy "vehicle_maintenance_update" on public.vehicle_maintenance for update
  using (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  )
  with check (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  );

create policy "vehicle_maintenance_delete" on public.vehicle_maintenance for delete
  using (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() = 'tenant_admin')
  );

-- Grants explícitos (mesmo motivo de 0019: o papel do CLI push não herda o
-- auto-grant do Supabase hospedado).
grant select, insert, update, delete on
  public.vehicle_shifts,
  public.vehicle_maintenance
to authenticated;
