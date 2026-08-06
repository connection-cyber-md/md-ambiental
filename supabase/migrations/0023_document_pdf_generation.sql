-- Geração automática de PDF para CCO/MTR: dados do emissor (tenant) que
-- faltavam + bucket de Storage pra guardar os arquivos gerados.

-- 1. Dados do emissor — opcionais de propósito. Sem eles, o certificado
--    mostra "não informado" em vez de inventar CNPJ/autorização (erro que
--    a proposta original do Gemini cometia).
alter table public.tenants
  add column address_logradouro text,
  add column address_cidade text,
  add column address_uf text,
  add column anp_authorization_number text;

-- 2. Bucket público (leitura). A pasta de cada arquivo é o tenant_id, então
--    o caminho não é adivinhável nem listável por terceiros mesmo sendo
--    "público" — só quem já tem o link (dono do documento) acessa.
insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do nothing;

-- 3. Escrita restrita: só tenant_admin/tenant_operator do próprio tenant
--    (pasta = tenant_id) podem subir/atualizar/remover PDFs. Leitura via
--    URL pública não passa por RLS (comportamento padrão de bucket público
--    do Supabase Storage), então não precisa de policy de select aqui.
create policy "documents_bucket_insert" on storage.objects for insert
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = public.tenant_id()::text
    and (public.is_system_admin() or public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  );

create policy "documents_bucket_update" on storage.objects for update
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = public.tenant_id()::text
    and (public.is_system_admin() or public.current_role_claim() in ('tenant_admin', 'tenant_operator'))
  );

create policy "documents_bucket_delete" on storage.objects for delete
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = public.tenant_id()::text
    and (public.is_system_admin() or public.current_role_claim() = 'tenant_admin')
  );
