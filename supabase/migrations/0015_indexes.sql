-- Indexes on FK columns (not already covered by a unique constraint) and on
-- columns filtered/sorted by dashboard and portal queries.

create index idx_profiles_tenant_id on public.profiles (tenant_id);
create index idx_profiles_company_id on public.profiles (company_id);

create index idx_companies_tenant_id on public.companies (tenant_id);
create index idx_companies_ibge_code on public.companies (ibge_code);
create index idx_companies_license_expiry on public.companies (license_expiry_date);

create index idx_vehicles_tenant_id on public.vehicles (tenant_id);

create index idx_drivers_tenant_id on public.drivers (tenant_id);
create index idx_drivers_vehicle_id on public.drivers (vehicle_id);

create index idx_collections_tenant_id on public.collections (tenant_id);
create index idx_collections_company_id on public.collections (company_id);
create index idx_collections_driver_id on public.collections (driver_id);
create index idx_collections_collection_date on public.collections (collection_date);
create index idx_collections_status on public.collections (status);

create index idx_documents_tenant_id on public.documents (tenant_id);
create index idx_documents_collection_id on public.documents (collection_id);

create index idx_bpo_tasks_tenant_id on public.bpo_tasks (tenant_id);
create index idx_bpo_tasks_status on public.bpo_tasks (status);

create index idx_dashboards_metrics_tenant_id on public.dashboards_metrics (tenant_id);
create index idx_dashboards_metrics_scope_period on public.dashboards_metrics (scope, period_start, period_end);

create index idx_regulatory_matrix_ibge_code on public.regulatory_matrix (ibge_code);
create index idx_regulatory_matrix_uf on public.regulatory_matrix (uf);
