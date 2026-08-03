# MD Ambiental — Plataforma (Fase 1: Fundação)

SaaS Multi-Tenant para a MD Ambiental (coleta e destinação de óleo lubrificante usado). Este repositório está na **Fase 1**: estrutura do projeto, schema do banco com RLS multi-tenant, autenticação e o esqueleto do site institucional. Os módulos operacionais (portal do cliente, painel operacional, app do motorista, backoffice, motor de conformidade, BPO, dashboards) são fases futuras — ver `features/*/README.md` para o que está reservado e ainda não implementado.

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
