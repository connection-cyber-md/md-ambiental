-- Bugfix: the custom_access_token_hook (0014) runs as `supabase_auth_admin`
-- with no request.jwt.claims context — it's invoked directly by the Auth
-- service at token-issuance time, not through a normal authenticated API
-- request. That means auth.uid() / public.tenant_id() / public.is_system_admin()
-- all resolve to null/false *inside the hook itself*.
--
-- 0014 already ran `grant select on public.profiles to supabase_auth_admin`,
-- but a table-level GRANT is not sufficient on its own: Postgres Row Level
-- Security is still enforced per-row for any role that isn't the table
-- owner or BYPASSRLS. Since none of the profiles_select policy conditions
-- can be true inside the hook's context, the hook's own SELECT returned
-- zero rows for every user — so tenant_id/role were silently never injected
-- into the JWT, and the app fell back to the auth-internal "authenticated"
-- role, which isn't a key in ROLE_HOME (hence the redirect-to-"undefined"
-- bug after login).
--
-- Fix: add a SELECT policy scoped explicitly `to supabase_auth_admin`, per
-- Supabase's own docs ("you will need to alter your RLS policies to allow
-- the supabase_auth_admin role to access tables you have RLS policies on").
-- Scoping the policy `to supabase_auth_admin` means it has zero effect on
-- any other role (authenticated/anon/client apps) — it only unblocks the
-- hook's internal read.
create policy "profiles_select_auth_admin" on public.profiles
  for select
  to supabase_auth_admin
  using (true);
