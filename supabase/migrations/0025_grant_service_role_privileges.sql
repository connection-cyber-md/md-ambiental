-- service_role nunca recebeu GRANT explícito neste projeto (só authenticated
-- em 0019 e anon em 0021) — mesma causa raiz documentada em 0019: o auto-grant
-- que o Supabase hospedado normalmente configura para os papéis padrão não
-- aconteceu aqui. service_role bypassa RLS, mas ainda precisa de GRANT a
-- nível de tabela no Postgres; sem isso toda query cai em
-- "permission denied for table X" antes mesmo de a policy ser avaliada.
-- Descoberto ao rodar o primeiro script server-side (scripts/seed-recon.ts)
-- com o admin client (lib/supabase/admin.ts).

grant usage on schema public to service_role;

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
  public.regulatory_matrix,
  public.impact_metrics,
  public.vehicle_shifts,
  public.vehicle_maintenance,
  public.financial_accounts,
  public.financial_categories,
  public.financial_entries
to service_role;
