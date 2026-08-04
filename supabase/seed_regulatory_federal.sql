-- Regras federais reais de OLUC (Óleo Lubrificante Usado ou Contaminado),
-- válidas para o país inteiro — por isso ibge_code/uf ficam nulos (depende
-- da migration 0020, que tornou esses campos opcionais). Complementa os
-- exemplos estaduais/municipais ilustrativos já no seed_staging_sample.sql.
--
-- ONDE RODAR: Supabase Dashboard → projeto "md-ambiental-staging"
-- (ref oxsezxgzfiocpatiezhj) → SQL Editor. Não rode em produção.
-- Pré-requisito: já ter rodado a migration 0020 (npx supabase db push).

insert into public.regulatory_matrix (ibge_code, uf, sphere, rule_title, rule_description, required_documents, blocking_condition, reference_law)
values
  (null, null, 'federal',
   'Destinação obrigatória ao re-refino (CONAMA 362/450)',
   'OLUC é classificado como resíduo perigoso de destinação compulsória ao re-refino. Proíbe descarte em aterro, queima a céu aberto e lançamento em solo ou corpo hídrico. Meta nacional de coleta: mínimo de 38% do consumo em 2024, subindo a 47% até 2030, monitorada por ANP, IBAMA e OEMAs.',
   array['MTR', 'CDF'],
   'oluc_sem_coletor_credenciado',
   'CONAMA 362/2005; CONAMA 450/2012'),

  (null, null, 'federal',
   'Cadastro e rastreabilidade de coletor/transportador/rerrefinador (ANP)',
   'Exige cadastro ANP de coletor, transportador e rerrefinador autorizado, com relatórios mensais e rastreabilidade via SINIR (CFA) e CTF IBAMA (RAPP anual). O gerador que entrega OLUC a agente sem credenciamento responde solidariamente.',
   array['CDF', 'CFA', 'RAPP'],
   null,
   'ANP Resolução 22/2014; Portaria ANP 1.075/2009'),

  (null, null, 'federal',
   'Sanções por descarte irregular ou entrega a agente não credenciado',
   'Multas de R$ 500 mil a R$ 2 milhões, suspensão de atividade e confisco para quem descarta OLUC irregularmente ou entrega a coletor/rerrefinador sem credenciamento ANP.',
   array[]::text[],
   'entrega_a_agente_nao_credenciado',
   'Lei 9.605/1998; Decreto 6.514/2008'),

  (null, null, 'federal',
   'Logística reversa obrigatória (PNRS)',
   'A Política Nacional de Resíduos Sólidos obriga logística reversa para óleos lubrificantes usados; metas e sistemas de acompanhamento detalhados no Decreto 11.044/2022.',
   array[]::text[],
   null,
   'Lei 12.305/2010, art. 33; Decreto 11.044/2022'),

  (null, null, 'federal',
   'Armazenamento e transporte de OLUC (ABNT/ANTT)',
   'Armazenamento em IBC de 1.000 L, tambor de 200 L ou bombona de 50 L, em área coberta e ventilada, com bacia de contenção de 110% do volume e sinalização conforme NBR 7500 (NR-25). Transporte conforme NBR 13231, com motorista treinado (MOPP, Portaria ANTT 5.848), ficha de emergência e envelope.',
   array[]::text[],
   null,
   'ABNT NBR 7500; ABNT NBR 13231; NR-25; Portaria ANTT 5.848 (MOPP)');
