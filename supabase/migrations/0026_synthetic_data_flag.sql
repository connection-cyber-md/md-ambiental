-- Governanca de dado sintetico (Fase 4 do modulo financeiro, adiantada aqui
-- porque a Fase 3 e o momento em que dado sintetico passa a ser inserido
-- nessas tabelas). financial_entries ja tinha is_synthetic desde a 0024;
-- esta migration estende o mesmo campo para as demais tabelas operacionais
-- que vao receber o seed historico, permitindo banner/reset seletivo depois
-- sem arriscar apagar dado real.
--
-- Os registros ja existentes (3 companies, 2 vehicles, 1 driver, 8
-- collections, 3 documents, 5 bpo_tasks) foram confirmados pelo usuario como
-- fixtures de desenvolvimento -- por isso o backfill marca todos como
-- is_synthetic = true, nao apenas o default para linhas futuras.

alter table public.companies add column is_synthetic boolean not null default false;
alter table public.vehicles add column is_synthetic boolean not null default false;
alter table public.drivers add column is_synthetic boolean not null default false;
alter table public.collections add column is_synthetic boolean not null default false;
alter table public.documents add column is_synthetic boolean not null default false;
alter table public.bpo_tasks add column is_synthetic boolean not null default false;
alter table public.vehicle_maintenance add column is_synthetic boolean not null default false;

update public.companies set is_synthetic = true;
update public.vehicles set is_synthetic = true;
update public.drivers set is_synthetic = true;
update public.collections set is_synthetic = true;
update public.documents set is_synthetic = true;
update public.bpo_tasks set is_synthetic = true;
