create table public.bpo_tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  department public.bpo_department not null,
  title text not null,
  description text,
  status public.bpo_status not null default 'pending',
  due_date date,
  assigned_to uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bpo_tasks enable row level security;

-- Internal-only: bpo_tasks are back-office routines, never exposed to the
-- 'client' role (a generator company's own contact).
create policy "bpo_tasks_select" on public.bpo_tasks for select
  using (
    public.is_system_admin()
    or (tenant_id = public.tenant_id() and public.current_role_claim() <> 'client')
  );
create policy "bpo_tasks_insert" on public.bpo_tasks for insert
  with check (
    public.is_system_admin()
    or (tenant_id = public.tenant_id() and public.current_role_claim() <> 'client')
  );
create policy "bpo_tasks_update" on public.bpo_tasks for update
  using (
    public.is_system_admin()
    or (tenant_id = public.tenant_id() and public.current_role_claim() <> 'client')
  )
  with check (
    public.is_system_admin()
    or (tenant_id = public.tenant_id() and public.current_role_claim() <> 'client')
  );
create policy "bpo_tasks_delete" on public.bpo_tasks for delete
  using (
    public.is_system_admin()
    or (tenant_id = public.tenant_id() and public.current_role_claim() <> 'client')
  );
