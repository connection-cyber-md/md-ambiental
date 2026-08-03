-- profiles: extends auth.users with tenant/role. company_id is only set when
-- role = 'client', linking the generator company's own contact to their
-- company row. The FK to companies is added in 0006_companies.sql, after
-- that table exists (profiles is created first because companies.created_by
-- style references would otherwise need profiles first — keeping this note
-- explicit so the ordering doesn't look accidental).

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  role public.user_role not null,
  full_name text not null,
  email text not null,
  phone text,
  company_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select" on public.profiles
  for select using (
    id = auth.uid()
    or tenant_id = auth.tenant_id()
    or auth.is_system_admin()
  );

-- Provisioning a profile is admin-driven (system_admin platform-wide, or
-- tenant_admin within their own tenant) — no self-signup with an arbitrary
-- role in this phase.
create policy "profiles_insert" on public.profiles
  for insert with check (
    auth.is_system_admin()
    or (auth.current_role_claim() = 'tenant_admin' and tenant_id = auth.tenant_id())
  );

create policy "profiles_update" on public.profiles
  for update using (
    id = auth.uid()
    or tenant_id = auth.tenant_id()
    or auth.is_system_admin()
  )
  with check (
    id = auth.uid()
    or tenant_id = auth.tenant_id()
    or auth.is_system_admin()
  );

create policy "profiles_delete" on public.profiles
  for delete using (
    auth.is_system_admin()
    or (auth.current_role_claim() = 'tenant_admin' and tenant_id = auth.tenant_id())
  );

-- The "profiles_update" policy above intentionally allows a user to update
-- their own row (so they can edit their name/phone) — this trigger closes
-- the resulting privilege-escalation hole by blocking a non-admin from
-- changing their own role or tenant_id.
create or replace function public.prevent_self_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.id = auth.uid() and not auth.is_system_admin() then
    if new.role is distinct from old.role or new.tenant_id is distinct from old.tenant_id then
      raise exception 'Você não pode alterar seu próprio papel ou tenant.';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_prevent_self_privilege_escalation
  before update on public.profiles
  for each row
  execute function public.prevent_self_privilege_escalation();
