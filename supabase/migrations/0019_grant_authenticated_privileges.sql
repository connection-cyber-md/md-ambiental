-- As migrations 0006–0013 criaram tabelas novas (companies, vehicles,
-- drivers, collections, documents, bpo_tasks, dashboards_metrics,
-- regulatory_matrix) só com RLS, sem GRANT explícito. Em projetos hospedados
-- o Supabase normalmente concede SELECT/INSERT/UPDATE/DELETE automático a
-- `authenticated`/`anon` via ALTER DEFAULT PRIVILEGES configurado para o
-- papel `postgres`/`supabase_admin` — mas o papel usado pelo `db push` do
-- CLI aqui é mais restrito (o mesmo motivo de 0003 ter tido que sair do
-- schema `auth`), então esse auto-grant não aconteceu. Resultado: mesmo com
-- RLS correta, toda query batia em "permission denied for table X"
-- (42501) antes mesmo de a policy ser avaliada.
--
-- Corrige concedendo explicitamente a `authenticated` em todas as tabelas
-- da aplicação (RLS continua sendo o filtro de linha — isto só desbloqueia
-- o acesso à tabela em si). `anon` não recebe nada: este produto não tem
-- rota pública sem login.

grant usage on schema public to authenticated;

grant select, insert, update, delete on
  public.tenants,
  public.profiles,
  public.companies,
  public.vehicles,
  public.drivers,
  public.collections,
  public.documents,
  public.bpo_tasks,
  public.dashboards_metrics,
  public.regulatory_matrix
to authenticated;
