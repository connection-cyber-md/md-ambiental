# MD Ambiental — Plataforma (Fase 1: Fundação)

SaaS Multi-Tenant para a MD Ambiental (coleta e destinação de óleo lubrificante usado). Este repositório está na **Fase 1**: estrutura do projeto, schema do banco com RLS multi-tenant, autenticação e o esqueleto do site institucional. Módulos operacionais já implementados: BPO, conformidade, dashboards, impacto, documentos (CCO/MTR), financeiro, estoque (bases/tanques/lotes/movimentações), expedição (destinatários/expedições/composição de lotes, com certificado de recebimento) e contratos (geradores e destinatários). O restante (CRM de geradores, portal do cliente estendido, app do motorista) é fase futura — ver `features/*/README.md` e `docs/0006-ARQUITETURA-DE-DADOS-OLUC.md` (seção "Roadmap") para a ordem planejada.

O domínio de estoque/custódia (`bases`, `tanks`, `lots`, `stock_movements`, `samples`, `evidences`, `destinatarios`, `expeditions`, `expedition_lots`, `contracts`) foi modelado a partir de `documentos/PRD-OLUC-PLATAFORMA-DE-GESTAO-v1.0.md` — ver `docs/0006-ARQUITETURA-DE-DADOS-OLUC.md` para o que foi construído, o que ficou de fora de propósito e por quê.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres, Auth, Storage, RLS)

## Ambientes

Este diretório (`cyber-mp-staging`) é o ambiente de **desenvolvimento/staging**. Um diretório irmão `cyber-mp` é reservado para o working copy de **produção** — não é tocado por este projeto ainda.

## Como rodar localmente

```bash
npm install
cp .env.example .env.local   # preencha com um projeto Supabase (staging) real
npm run dev
```

## Banco de dados

Nenhuma migration foi aplicada em nenhum projeto Supabase remoto ainda — todas vivem como arquivos versionados em `supabase/migrations/`. Para testar localmente (requer Docker + Supabase CLI):

```bash
npm run supabase:start
npm run supabase:reset   # aplica as migrations + supabase/seed.sql (dados fictícios) no stack local
```

`supabase/seed.sql` contém **apenas dados fictícios**, claramente rotulados, e nunca deve ser rodado contra um projeto de produção.

## Scripts

- `npm run dev` / `build` / `start`
- `npm run check` — lint + typecheck
- `npm run supabase:*` — atalhos para o Supabase CLI (ver `package.json`)
