-- regulatory_matrix: global reference data (federal/estadual/municipal
-- rules by IBGE municipality/UF). Deliberately has no tenant_id — the same
-- rules apply to every tenant operating in a given jurisdiction.

create table public.regulatory_matrix (
  id uuid primary key default gen_random_uuid(),
  ibge_code text not null,
  uf text not null,
  sphere public.regulatory_sphere not null,
  rule_title text not null,
  rule_description text,
  required_documents text[],
  blocking_condition text,
  reference_law text,
  effective_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.regulatory_matrix enable row level security;

-- Readable by any authenticated user (every tenant needs to read the rules
-- that apply to their operating regions); writable only by system_admin,
-- since this is platform-managed reference data, not per-tenant data.
create policy "regulatory_matrix_select" on public.regulatory_matrix
  for select using (auth.role() = 'authenticated' or auth.is_system_admin());

create policy "regulatory_matrix_insert" on public.regulatory_matrix
  for insert with check (auth.is_system_admin());
create policy "regulatory_matrix_update" on public.regulatory_matrix
  for update using (auth.is_system_admin()) with check (auth.is_system_admin());
create policy "regulatory_matrix_delete" on public.regulatory_matrix
  for delete using (auth.is_system_admin());
