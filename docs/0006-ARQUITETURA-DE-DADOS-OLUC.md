# Arquitetura de dados — Fundação do domínio OLUC

> **Mandato do proprietário do projeto (21/ago/2026):** todo dado de negócio real (CNPJ, licenças, preços, volumes)
> é **fictício** neste ambiente de staging — nunca dado real da MD Ambiental. Com isso, as 15 perguntas de negócio
> do PRD §22 (UF, licença ANP, forma de medição etc.) deixam de bloquear a construção de UI/dados de exemplo: onde
> o PRD pede uma resposta de negócio para funcionar, este projeto assume um valor fictício plausível e segue,
> registrando a suposição em vez de parar para perguntar. O que continua bloqueado é só o que exigiria isso de
> verdade — integrações externas com credencial real (ANP/SIMP, MTR/SINIR, WhatsApp Business) e regras jurídicas
> que precisam de validação de um responsável técnico/DPO real. Ver "Roadmap — ordem técnica e cronológica" ao
> final para o que isso destrava e em que ordem está sendo construído.

Complementa `PRD-OLUC-PLATAFORMA-DE-GESTAO-v1.0.md` (`C:\Projetos\md\documentos\`) com o que foi efetivamente
construído em `cyber-mp-staging` a partir dele. Referência de nomenclatura: `0000-MASTER-ARCHITECTURE-INDEX-OLUC.md`
em diante (PRD §26) — este é o `0006` da lista lá sugerida.

## Escopo desta fatia

O PRD descreve uma plataforma de ~7-12 meses (Fases 0-6, PRD §19). Construir "tudo" de uma vez, numa tacada só e
sem verificação a cada passo, arrisca produzir um schema/RLS inconsistente e uma UI que não builda — por isso o
trabalho segue em incrementos pequenos, cada um fechado com `npm run check` + `npm run build` limpos antes do
próximo, na ordem descrita no roadmap ao final. Dado fictício (ver mandato acima) resolve o bloqueio de "não sei a
regra de negócio real"; não resolve — e não tenta resolver — o que precisa de infraestrutura real (credencial de
integração, Docker para regenerar tipos, aplicar migration em projeto Supabase de verdade).

## O que mudou

### Schema (`supabase/migrations/0027` a `0033`)

Dez tabelas novas, todas com RLS multi-tenant seguindo o mesmo padrão de `tenant_id = public.tenant_id()` já usado
no schema existente (ver `lib/auth/session.ts` e `supabase/migrations/0003_helper_functions.sql`):

| Tabela | Domínio PRD | Papéis com acesso |
|---|---|---|
| `bases`, `tanks` | §9.9 Estoque, tanques e lotes | tenant_admin / tenant_operator |
| `samples`, `evidences` | §9.6 App de campo, §9.8 Qualidade | + tenant_driver (insert), client (select da própria coleta) |
| `lots`, `stock_movements` | §9.9 | tenant_admin / tenant_operator |
| `destinatarios`, `expeditions`, `expedition_lots` | §9.10 Expedição e destinação | + tenant_driver (select da própria expedição) |
| `contracts` | §9.12 Contratos e comercial | tenant_admin apenas (dado de preço — mesma política de `financial_*`) |

Decisões de modelagem:

- **`bases`/`tanks`/`destinatarios` sem `is_synthetic`** — são estrutura/cadastro, não dado transacional
  (mesma lógica de `financial_accounts`/`financial_categories`, `0024_financial_module.sql`). As demais oito
  tabelas têm `is_synthetic` e foram somadas às listas em `lib/synthetic/getSyntheticTotal.ts` e
  `scripts/reset-synthetic-data.ts` (exigido por `CLAUDE.md`).
- **`stock_movements` com volume assinado**, não uma tabela de saldo separada — `entrada`/`inventario` somam,
  `perda`/`expedicao` subtraem, `ajuste`/`transferencia` carregam o próprio sinal. `lots.volume_litros` é um saldo
  cacheado, atualizado pela server action que insere o movimento (`app/admin/estoque/actions.ts`), não recalculado
  a cada leitura — mesmo trade-off que `financial_accounts.initial_balance` + soma de `financial_entries`.
- **Certificado de Coleta (`documents.type = 'CCO'`) já existia**; o que faltava era versionamento e verificação
  pública (PRD §9.7: "certificado emitido não deve ser alterado silenciosamente"). `0033` adiciona
  `verification_code` (índice único parcial, é o valor que vai no QR Code), `version` e `superseded_by`
  (auto-referência — uma correção gera novo documento, nunca um update in-place do conteúdo emitido).
  A rota pública de verificação por `verification_code` **não foi construída** — fica para quando o modelo de
  certificado for validado com o responsável técnico (PRD §16 item 14).
- **Novo tipo de documento `CRC`** (Certificado de Recebimento, emitido pelo destinatário) em migration própria
  (`0032`) porque o Postgres não permite usar um valor de enum na mesma transação em que ele foi criado.
  `app/admin/documentos/page.tsx` foi ajustada para filtrar `type in (CCO, MTR)` — ela é a tela de certificados
  ligados a uma coleta; `CRC` pertence ao módulo de expedição (ver "UI: módulo Expedição" abaixo).
- **`documents.collection_id` virou opcional** (`0034`) porque CRC não se liga a uma coleta, e sim a uma
  expedição — `documents.expedition_id` foi adicionado, com uma constraint (`documents_collection_xor_expedition`)
  garantindo que toda linha aponta pra exatamente um dos dois, nunca os dois nem nenhum. `expeditions` mantém seu
  `receipt_document_id` (0030) como ponteiro rápido pro CRC vigente; `documents.expedition_id` é o caminho inverso,
  usado se um dia existir histórico de CRCs substituídos (mesmo encadeamento `superseded_by`/`version` do CCO/MTR).

### Tipos (`types/supabase.ts`)

Editado à mão para refletir o schema acima: **não havia Docker disponível neste ambiente** para rodar
`npm run supabase:types` contra o stack local. Rodar essa geração contra o Supabase local (ou aplicar as
migrations em staging e gerar de lá) na próxima vez que houver acesso a Docker, para confirmar que o hand-edit bate
com o que o CLI geraria — o formato foi replicado campo a campo a partir das tabelas existentes, mas é uma
transcrição manual.

### Zod schemas (`schemas/`)

`base.schema.ts`, `quality.schema.ts`, `stock.schema.ts`, `destinatario.schema.ts`, `expedition.schema.ts`,
`contract.schema.ts` — um por sub-domínio, mesmo padrão de `schemas/collection.schema.ts` (validação de input,
não usados nas server actions ainda — ver "Dívida" abaixo).

### UI: módulo Estoque (`/admin/estoque`)

Primeiro módulo operacional construído sobre o novo domínio, ponta a ponta: `app/admin/estoque/page.tsx` (fetch +
KPIs) → `app/admin/estoque/actions.ts` (server actions) → `components/admin/EstoquePageClient.tsx` +
`EstoqueBasesTanks.tsx` + `EstoqueLotsMovements.tsx`. Cadastra bases e tanques, abre/fecha lotes, registra
movimentações de estoque com atualização do saldo do lote. Segue exatamente o padrão de
`app/admin/financeiro/` (mesma estrutura de arquivos, mesmas classes Tailwind, mesmo formato de `ActionResult`).

Link adicionado à navegação em `app/admin/layout.tsx`.

### UI: módulo Expedição (`/admin/expedicao`)

Segundo módulo operacional, fecha o ciclo de custódia iniciado pelo Estoque: `app/admin/expedicao/page.tsx` →
`app/admin/expedicao/actions.ts` → `components/admin/ExpedicaoPageClient.tsx` + `ExpedicaoDestinatarios.tsx` +
`ExpedicaoBoard.tsx`. Cadastra destinatários (rerrefinadores), cria expedições, compõe lotes dentro de uma
expedição e avança o status (`scheduled → in_transit → delivered → reconciled`, ou `canceled`).

Decisões específicas deste módulo:

- **Compor um lote numa expedição debita o volume do lote e gera um `stock_movements` tipo `expedicao`** (negativo,
  no tanque de origem) — mesma trilha de auditoria do módulo Estoque, não um caminho paralelo. Se o volume
  restante do lote cai a ~zero, o lote passa a `status = 'expedited'` automaticamente.
- **Composição só é editável enquanto a expedição está `scheduled`** (`EXPEDITION_EDITABLE_STATUSES` em
  `lib/expedicao/constants.ts`). Depois de `in_transit` o volume já saiu fisicamente — mudar silenciosamente
  quebraria a mesma garantia do PRD §9.7 sobre certificados.
- **Não há "remover lote da expedição".** Desfazer exigiria estornar o `stock_movements` sem deixar rastro — a
  correção correta é um novo movimento de ajuste (`type = 'ajuste'`) lançado manualmente no Estoque, não uma
  operação que apaga o que aconteceu.
- **Anexar o certificado de recebimento agora tem UI** (`attachReceiptCertificate`, mostrado quando a expedição
  está `delivered` sem `receipt_document_id`). `updateExpeditionStatus` passou a **recusar** a transição pra
  `reconciled` se não houver CRC anexado — a lacuna registrada na versão anterior deste documento (PRD §16 item 8)
  foi fechada como regra de negócio, não só como texto de aviso.

### UI: módulo Contratos (`/admin/contratos`)

Terceiro módulo, fecha o último domínio que já tinha schema (`0031`) sem UI: `app/admin/contratos/page.tsx` →
`app/admin/contratos/actions.ts` → `components/admin/ContratosPageClient.tsx` + `ContratosBoard.tsx`. Cadastra
contrato com gerador ou destinatário (o formulário troca o select conforme o tipo escolhido, mesmo padrão de
`FinanceiroBoard`'s `EntryForm` trocando categoria por tipo), preço fictício por litro, SLA em horas, e avança
status (`draft → active → suspended/terminated`). Mantém a decisão original: `tenant_admin` apenas (dado de
preço), sem promover `tenant_operator` — RBAC atual não tem papel "comercial" dedicado (ver nota na `0031`).

### Dados fictícios (`supabase/seed.sql`)

Estendido com um cenário completo do domínio OLUC — duas histórias em paralelo, pra exercitar os dois estados que
importam: um lote ainda aberto (estoque em andamento) e um lote que percorreu o ciclo inteiro até o CRC
(entrada → lote → expedição → certificado → conciliação). Cobre `bases`, `tanks`, `lots`, `stock_movements`,
`samples` (incluindo uma amostra `pending`, fila de revisão), `evidences` (foto/assinatura/geolocalização),
`destinatarios`, `expeditions`, `expedition_lots`, o documento `CRC` e dois `contracts` (um por gerador, um por
destinatário).

De passagem, uma correção: as linhas fictícias já existentes em `companies`, `vehicles`, `drivers`, `collections`,
`documents` e `bpo_tasks` nunca setavam `is_synthetic = true` no `insert` — a coluna existe desde a `0026`, mas o
valor ficava no default (`false`), silenciosamente. Isso não quebra nada (RLS não depende disso), mas contradiz o
propósito da coluna: o banner de dado sintético e `scripts/reset-synthetic-data.ts` contariam esses seeds como
"dado real". Corrigido nesta passada — toda linha fictícia em `seed.sql` agora marca `is_synthetic = true`
explicitamente.

**Não validado contra Postgres de verdade** — mesma limitação de Docker indisponível já registrada abaixo. A
consistência foi conferida manualmente (contagem de colunas × valores, tipos de enum, constraints de FK e dos dois
`check` novos) mas só `npm run supabase:reset` local prova que roda sem erro.

## O que ficou de fora, deliberadamente

- **Samples/evidences não têm UI de captura.** As tabelas existem, têm RLS (motorista pode inserir, operação
  revisa) e agora têm dado de exemplo no seed — falta a tela de campo em si (PRD §9.6), que depende da decisão
  PWA-offline-first vs. app nativo (PRD §15, "a definir na Fase 0"). Diferente das 15 perguntas de negócio, essa é
  uma decisão de arquitetura de verdade (offline sync, não é algo que dado fictício resolve) — construir a UI
  antes dela arriscaria refazer o fluxo de sincronização inteiro.
- **Nenhuma integração externa** (WhatsApp Business, MTR/SINIR, ANP/SIMP, assinatura eletrônica, ERP) foi tocada —
  todas exigem credencial real; dado fictício não substitui isso. PRD §13: "nenhuma integração governamental deve
  ser assumida como automatizável antes da validação de disponibilidade, credenciamento e regras de uso."
- **Rota pública de verificação de certificado** (por `verification_code`, PRD §9.7/§12.1) ainda não existe —
  precisa de uma policy RLS nova e escopada (leitura anônima só pelo código, nunca por id) pra não abrir os
  `documents` inteiros pra `anon`. Ver roadmap abaixo.
- **CRM (`C:\Projetos\crm\wacrm`) e MPI (`C:\Projetos\mpi\cyber-mpi-os`) não foram tocados.** São codebases Next.js
  separadas, com seus próprios repositórios — "integrar" significa desenhar uma ponte de API entre sistemas
  independentes, não fundir arquitetura, e isso requer mapear o que cada um faz hoje antes de propor a ponte.

## Dívida técnica registrada

1. `types/supabase.ts` foi editado à mão (ver acima) — regenerar com `npm run supabase:types` assim que houver
   Docker disponível, e diffar contra este commit.
2. As novas server actions (`estoque`, `expedicao`, `contratos`) validam input manualmente, como
   `app/admin/financeiro/actions.ts` já fazia — os `schemas/*.schema.ts` novos existem mas não estão plugados;
   alinhar os dois quando o restante dos módulos (financeiro incluído) migrar para validação via Zod.
3. Nenhuma migration foi aplicada em um projeto Supabase remoto, e `seed.sql` nunca rodou contra Postgres de
   verdade nesta passada (mesma situação de todo o repo — ver `README.md` raiz). Rodar `npm run supabase:reset`
   localmente (requer Docker) antes de aplicar em staging — é o próximo item do roadmap abaixo.

## Roadmap — ordem técnica e cronológica

Decidida como dono do produto (mandato no topo deste documento), seguindo dependência técnica real — cada item
usa o que o anterior construiu. Sem pergunta de volta ao usuário nos itens que só precisam de dado fictício;
sinalizados os que dependem de algo fora do meu controle neste ambiente.

1. ✅ Schema do domínio OLUC + RLS (`0027`–`0034`).
2. ✅ UI Estoque (`/admin/estoque`).
3. ✅ UI Expedição + anexação de CRC + regra de bloqueio até certificado anexado (`/admin/expedicao`).
4. ✅ UI Contratos (`/admin/contratos`).
5. ✅ Dado fictício de ponta a ponta no `seed.sql` (os dois ciclos de lote) + correção do `is_synthetic` que faltava
   nos seeds já existentes.
6. **Validar `seed.sql` e as migrations contra Postgres de verdade** — requer Docker (`npm run supabase:start` +
   `npm run supabase:reset`), indisponível neste ambiente até agora. Primeiro item a rodar assim que houver acesso;
   é o que efetivamente prova que os itens 1–5 funcionam, não só compilam.
7. **Rota pública de verificação de certificado** (`verification_code` → status/validade do CCO/MTR/CRC, sem
   autenticação). Fecha PRD §9.7/§12.1; tecnicamente contido (uma policy RLS nova + uma rota) e não depende de
   nenhuma das pendências acima.
8. **CRM de geradores no admin** (`app/admin/*` sobre a tabela `companies`, que já existe) — completa o backoffice
   com a última entidade de cadastro que só existe via seed/banco hoje.
9. **Captura de campo no app do motorista** (samples/evidences, PRD §9.6) — de propósito depois dos itens acima:
   é o maior módulo restante e envolve uma decisão de arquitetura real (PWA offline vs. nativo, PRD §15), não algo
   que dado fictício resolve sozinho. Entra como PWA online-first nesta fase (mais simples, mesma stack Next.js já
   em uso); offline fica para quando a decisão for revisitada.
10. **Extensão do portal do cliente** — expor certificados, evidências e indicadores do que os itens 1–9 já
    produzem para o papel `client`.
11. **CRM/MPI**: mapear `wacrm` e `cyber-mpi-os` antes de propor qualquer ponte de API — deliberadamente por último,
    porque é a única linha do roadmap que depende de sistemas fora deste repositório.
