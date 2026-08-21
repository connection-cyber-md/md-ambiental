-- Fundação do domínio OLUC (PRD-OLUC-001 §9.6, §9.8): evidências de campo e
-- amostras de qualidade, produzidas pelo aplicativo do motorista durante a
-- execução da coleta e revisadas pela operação/base no recebimento.
--
-- is_synthetic presente em ambas: são dado transacional gerado por coleta
-- (como collections/documents), não estrutura fixa.

create type public.evidence_type as enum ('photo', 'signature', 'geolocation', 'document');

create type public.sample_status as enum ('pending', 'approved', 'quarantine', 'rejected');

-- evidences: fotos, assinatura e geolocalização capturadas em campo,
-- vinculadas a uma coleta. captured_by aponta para o profile do motorista
-- (ou operador, em lançamento manual).
create table public.evidences (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  collection_id uuid not null references public.collections(id) on delete cascade,
  type public.evidence_type not null,
  file_url text,
  latitude numeric(10, 6),
  longitude numeric(10, 6),
  captured_by uuid references public.profiles(id) on delete set null,
  captured_at timestamptz not null default now(),
  is_synthetic boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.evidences enable row level security;

-- Select segue o mesmo padrão de documents_select: papéis internos veem tudo
-- do tenant, cliente só vê evidências de coletas da própria empresa
-- (transparência — PRD §9.14 portal do gerador).
create policy "evidences_select" on public.evidences for select
  using (
    tenant_id = public.tenant_id() and (
      public.is_system_admin()
      or public.current_role_claim() in ('tenant_admin', 'tenant_operator', 'tenant_driver')
      or exists (
        select 1 from public.collections c
        join public.profiles p on p.id = auth.uid()
        where c.id = evidences.collection_id and c.company_id = p.company_id
      )
    )
  );

-- Insert: motorista captura evidência em campo; papéis administrativos podem
-- lançar manualmente. Cliente nunca envia evidência.
create policy "evidences_insert" on public.evidences for insert
  with check (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() in ('tenant_admin', 'tenant_operator', 'tenant_driver'))
  );

create policy "evidences_update" on public.evidences for update
  using (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  )
  with check (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  );

create policy "evidences_delete" on public.evidences for delete
  using (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() = 'tenant_admin')
  );

-- samples: amostra de qualidade coletada junto com a coleta (lacre, código,
-- classificação preliminar). A revisão (approved/quarantine/rejected) é ação
-- da base/operação — por isso update fica restrito a tenant_admin/operator,
-- diferente de evidences_insert que o motorista também pode fazer.
create table public.samples (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  collection_id uuid not null references public.collections(id) on delete cascade,
  seal_code text,
  classification text,
  contaminants_declared text,
  status public.sample_status not null default 'pending',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  notes text,
  is_synthetic boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.samples enable row level security;

create policy "samples_select" on public.samples for select
  using (
    tenant_id = public.tenant_id() and (
      public.is_system_admin()
      or public.current_role_claim() in ('tenant_admin', 'tenant_operator', 'tenant_driver')
      or exists (
        select 1 from public.collections c
        join public.profiles p on p.id = auth.uid()
        where c.id = samples.collection_id and c.company_id = p.company_id
      )
    )
  );

create policy "samples_insert" on public.samples for insert
  with check (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() in ('tenant_admin', 'tenant_operator', 'tenant_driver'))
  );

create policy "samples_update" on public.samples for update
  using (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  )
  with check (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  );

create policy "samples_delete" on public.samples for delete
  using (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() = 'tenant_admin')
  );

create index evidences_collection_idx on public.evidences (collection_id);
create index samples_collection_idx on public.samples (collection_id);

grant select, insert, update, delete on
  public.evidences,
  public.samples
to authenticated;
