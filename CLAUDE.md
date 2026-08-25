# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

MD Ambiental — multi-tenant SaaS for OLUC (used lubricant oil) collection, custody, and destination
management. Next.js 15 (App Router) + TypeScript (strict) + Tailwind CSS + Supabase (Postgres, Auth,
Storage, RLS). Path alias `@/*` maps to this directory's root.

This directory (`cyber-mp-staging`) is the **staging/development** environment and the only environment
with real code — a sibling `cyber-mp/` (production) is currently just placeholder folders. All business
data here (CNPJs, license numbers, prices, volumes) is **fictitious**; never seed or assume real MD
Ambiental data in this environment.

The product spec is `documentos/PRD-OLUC-PLATAFORMA-DE-GESTAO-v1.0.md` (one level up, in
`C:\Projetos\md\documentos\`). `docs/0006-ARQUITETURA-DE-DADOS-OLUC.md` records what was actually built
from it, what was deliberately left out and why, and the technical roadmap order — read it before
assuming a domain area (estoque, expedição, contratos, samples/evidences) is unbuilt or fully built.

## Commands

```bash
npm install
cp .env.example .env.local     # fill in a real staging Supabase project's URL/publishable key
npm run dev                    # start Next.js dev server
npm run check                  # lint + typecheck — run this before considering a change done
npm run lint                   # next lint only
npm run typecheck              # tsc --noEmit only
npm run build                  # next build
```

E2E tests use Playwright (`e2e/flows.spec.ts`), config in `playwright.config.ts`:

```bash
npx playwright test                       # runs against `npm run dev`, started automatically
npx playwright test e2e/flows.spec.ts -g "<test name>"   # run a single test
npx playwright show-report                # view last HTML report
```

There is no unit test runner configured (no jest/vitest) — `npm run check` plus the Playwright flows are
the correctness gate.

Supabase local stack (requires Docker + Supabase CLI):

```bash
npm run supabase:start
npm run supabase:reset         # applies supabase/migrations/* + supabase/seed.sql (fictitious data only)
npm run supabase:migration:new -- <name>
npm run supabase:diff
npm run supabase:lint
npm run supabase:types         # regenerates types/supabase.ts from the local stack
```

No migration has ever been applied to a remote Supabase project, and `seed.sql` has never been run
against real Postgres — Docker has not been available in this environment. `types/supabase.ts` was
hand-edited to match migrations `0027`+ for the same reason; treat it as unverified until someone runs
`supabase:types` against a real local stack and diffs it. Migrations are numbered sequentially
(`0001_...` → `0036_...`, plus one dated `20260823_rls_security_audit.sql`); add new ones with the script
above rather than editing old ones.

`scripts/reset-synthetic-data.ts` deletes all `is_synthetic = true` rows; `scripts/check-env.ts` validates
`.env.local`. The `.ps1` scripts in `scripts/` are Windows-only backup/restore/verify utilities for this
project's local file layout, invoked manually, not part of the npm workflow.

## Architecture

**Phase status**: past the original "Fase 1 skeleton" stage — `app/admin/*` has working, end-to-end
operational modules (BPO, compliance, dashboards, impacto, documentos with server-side PDF generation,
financeiro, estoque, expedição, contratos, crm), each generally following the same
page → `actions.ts` (server actions) → `components/admin/*Client.tsx` structure — **except `crm`**, see
below. `app/operacional/*` and `app/motorista/*` are still placeholders; `app/portal/*` has
`coletas`/`documentos` but not the fuller scope described in `features/portal-cliente/README.md`. Check
the relevant `features/*/README.md` and `docs/0006-ARQUITETURA-DE-DADOS-OLUC.md`'s roadmap section before
assuming a module's state either way — both directions of assumption have been wrong at different points
in this repo's history. Note `features/*` has no `crm` subdirectory — the module has no README of its own.

**`app/admin/crm`** (migration `0036_wacrm_companies_bridge.sql`) is a bridge into an external "WACRM"
system, not a module built from this repo's own schema: it adds `contacts.company_id` (an
`ALTER TABLE IF EXISTS` against a `contacts` table that no migration in this repo creates — it's assumed
to already exist, created elsewhere) and a new `oluc_crm_deals` table. The page
(`app/admin/crm/page.tsx`) queries `oluc_crm_deals` directly with `supabase.from(... as any)` — no
`actions.ts`, no generated type (it predates the last `types/supabase.ts` sync) — and falls back to a
"demo mode" display on any query error instead of failing the page. Treat this module as a thinner,
unverified integration point rather than a template to copy.

**Multi-tenant RBAC**: role and tenant are carried as **custom JWT claims**, not app state or DB
round-trips:
- `supabase/migrations/0014_custom_access_token_hook.sql` injects `tenant_id` and `app_role` into the
  access token via a Postgres hook registered in `supabase/config.toml`.
- The claim is named `app_role`, **not** `role` — `role` is reserved by PostgREST (it does
  `SET ROLE <claim>` on the Postgres connection), so using it broke every query (see
  `0018_fix_reserved_role_claim.sql` and the comment in `lib/auth/session.ts`).
- `middleware.ts` calls `updateSession()` (`lib/supabase/middleware.ts`, uses `getUser()` —
  server-revalidated, not the cached `getSession()`), decodes the claims (`lib/auth/session.ts`), and
  checks the route prefix against `lib/auth/rbac.ts`'s `ROUTE_ROLE_MAP` (`/portal` → client,
  `/operacional` → tenant_admin/tenant_operator, `/motorista` → tenant_driver, `/admin` →
  system_admin/tenant_admin). A role mismatch redirects to that role's home (`ROLE_HOME`), not a 403 page.
  A Supabase env misconfiguration also fails closed, redirecting to `/login?config=missing` rather than
  throwing a raw 500.
- `lib/auth/context.ts`'s `getAuthContext()` re-reads the same claims server-side for use inside already
  middleware-guarded pages (display, tenant-scoped queries) — it does not re-check authorization itself.
- On the Postgres/RLS side, `supabase/migrations/0003_helper_functions.sql` defines `public.tenant_id()` /
  `public.is_system_admin()` / `public.current_role_claim()` (all `auth.jwt() ->> 'app_role'`-based, per
  the 0018 fix) as the single source of truth most RLS policies read from — SQL-level helpers, kept in
  `public` (not `auth`) because hosted Supabase doesn't grant `CREATE` on `auth`. Until the access-token
  hook is registered, these evaluate to null/false, so tenant-scoped policies fail closed by default.
  **Exceptions — three RLS patterns coexist in this schema, know which one a policy you're touching
  uses before changing it**: (1) most tables use the `tenant_id()`/`is_system_admin()` helpers above;
  (2) `supabase/migrations/20260823_rls_security_audit.sql` writes newer policies (on `collections`,
  `documents`, `financial_entries`, `contracts`) against `auth.uid()` joined through `public.profiles`
  directly; (3) `oluc_crm_deals` (migration `0036`) uses `USING (auth.role() = 'authenticated')` —
  **not tenant-scoped at all**, any authenticated user can read/write every tenant's CRM deals. Don't
  copy pattern (3) into a new table.

**Supabase client boundaries** (`lib/supabase/`): `client.ts` for browser components, `server.ts` for
Server Components/Actions/Route Handlers (cookie-backed, RLS applies), `admin.ts` for the service-role
client that **bypasses RLS** — server-only (`import "server-only"`), never import from a client component.
`lib/env.ts` validates env vars with Zod but lazily (only when a Supabase client is actually constructed),
so `npm run dev`/`build` don't hard-fail before `.env.local` exists.

**Synthetic data flag**: seed/demo rows across most tenant tables carry `is_synthetic = true`
(`supabase/migrations/0026_synthetic_data_flag.sql`). Structural/catalog tables (`bases`, `tanks`,
`destinatarios`, `financial_accounts`, `financial_categories`) deliberately don't — same reasoning as
`companies` etc. not needing it. `lib/synthetic/getSyntheticTotal.ts` sums synthetic rows across a fixed
table list for a global banner in `app/admin/layout.tsx`; `scripts/reset-synthetic-data.ts` deletes the
same set. **Keep both lists in sync when adding a table that carries synthetic rows.**

**Operational module pattern** (estoque, expedição, contratos, financeiro): each is
`app/admin/<module>/page.tsx` (server-side fetch + KPIs) → `app/admin/<module>/actions.ts` (server actions
returning `{ success: true } | { error: string }`, manual field validation, tenant scoping via
`getAuthContext()`) → `components/admin/<Module>PageClient.tsx` plus sub-components. New modules should
copy this shape rather than introducing a new one — `crm` (above) is the one module that doesn't and
should not be used as a reference. `schemas/*.schema.ts` (Zod, one file per domain entity) exist for most
of these entities but are **not yet wired into the server actions** — validation there is still manual,
tracked as debt in `docs/0006-ARQUITETURA-DE-DADOS-OLUC.md`.

**Stock/custody domain** (`bases`, `tanks`, `lots`, `stock_movements`, `samples`, `evidences`,
`destinatarios`, `expeditions`, `expedition_lots`, `contracts` — migrations `0027`–`0035`): `lots` carry a
cached `volume_litros` balance updated by the server action that inserts a `stock_movements` row (signed:
`entrada`/`inventario` add, `perda`/`expedicao` subtract), not recomputed on read. Composing a lot into an
expedition debits the lot and writes an `expedicao` stock movement — one audit trail, not a parallel one.
Expedition composition is only editable while `status = 'scheduled'`
(`EXPEDITION_EDITABLE_STATUSES` in `lib/expedicao/constants.ts`); transition to `reconciled` is refused
until a CRC (receipt certificate) document is attached. `documents` rows point to exactly one of
`collection_id` (CCO/MTR) or `expedition_id` (CRC), enforced by a check constraint — never both, never
neither.

**Route structure**: `app/(site)/` is the public institutional site; `app/{portal,operacional,motorista,admin}/`
are the role-gated app sections (protected by the middleware above); `app/login/`, `app/auth/callback/`,
`app/auth/signout/` handle auth; `app/api/documents/[id]/pdf/` generates certificate PDFs server-side.
`features/*/README.md` holds per-module intent docs, separate from the route handlers in `app/`.
