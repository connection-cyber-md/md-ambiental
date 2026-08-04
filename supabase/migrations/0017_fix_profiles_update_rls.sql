-- Corrige a política profiles_update, que era permissiva demais: qualquer
-- usuário do mesmo tenant (tenant_id = public.tenant_id()) podia atualizar
-- QUALQUER outro perfil do tenant, não só o próprio — inclusive trocando o
-- papel de terceiros. Agora segue o mesmo padrão já usado em
-- profiles_insert/profiles_delete: o usuário só edita a própria linha;
-- editar a linha de outra pessoa exige tenant_admin (dentro do próprio
-- tenant) ou system_admin.
--
-- O trigger prevent_self_privilege_escalation (0005_profiles.sql) continua
-- valendo sem alteração — ele já impedia alguém de escalar o PRÓPRIO papel;
-- esta migration fecha a lacuna que faltava, que era a edição de terceiros.

drop policy if exists "profiles_update" on public.profiles;

create policy "profiles_update" on public.profiles
  for update using (
    id = auth.uid()
    or public.is_system_admin()
    or (public.current_role_claim() = 'tenant_admin' and tenant_id = public.tenant_id())
  )
  with check (
    id = auth.uid()
    or public.is_system_admin()
    or (public.current_role_claim() = 'tenant_admin' and tenant_id = public.tenant_id())
  );
