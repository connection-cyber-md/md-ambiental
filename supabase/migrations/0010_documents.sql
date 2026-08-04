create table public.documents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  collection_id uuid not null references public.collections(id) on delete cascade,
  type public.document_type not null,
  document_number text,
  file_url text,
  issue_date date,
  status public.document_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.documents enable row level security;

-- Mirrors collections_select: a 'client' only sees documents tied to a
-- collection of their own company.
create policy "documents_select" on public.documents
  for select using (
    tenant_id = public.tenant_id() and (
      public.is_system_admin()
      or public.current_role_claim() in ('tenant_admin', 'tenant_operator', 'tenant_driver')
      or exists (
        select 1 from public.collections c
        join public.profiles p on p.id = auth.uid()
        where c.id = documents.collection_id and c.company_id = p.company_id
      )
    )
  );

-- Issuing CCO/MTR documents is an administrative action, not a client one.
create policy "documents_insert" on public.documents
  for insert with check (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  );

create policy "documents_update" on public.documents
  for update using (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  )
  with check (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  );

create policy "documents_delete" on public.documents
  for delete using (
    tenant_id = public.tenant_id()
    and (public.is_system_admin() or public.current_role_claim() = 'tenant_admin')
  );
