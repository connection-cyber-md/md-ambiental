-- Helper functions wrapping auth.jwt() so every RLS policy stays DRY and
-- reads from a single source of truth. Depend on the custom claims injected
-- by the access token hook in 0014_custom_access_token_hook.sql — until that
-- hook is registered (supabase/config.toml), these evaluate to null/false
-- and every tenant-scoped policy below denies access by default (fail closed).

create or replace function auth.tenant_id()
returns uuid
language sql
stable
as $$
  select nullif(auth.jwt() ->> 'tenant_id', '')::uuid
$$;

create or replace function auth.is_system_admin()
returns boolean
language sql
stable
as $$
  select (auth.jwt() ->> 'role') = 'system_admin'
$$;

create or replace function auth.current_role_claim()
returns text
language sql
stable
as $$
  select auth.jwt() ->> 'role'
$$;
