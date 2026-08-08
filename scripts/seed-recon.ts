// Reconhecimento somente-leitura: mostra o que ja existe em staging antes de
// desenhar o seed historico da Fase 3. Nao escreve nada no banco.
//
// Uso (PowerShell, a partir da raiz do repo):
//   cd C:\Projetos\md\cyber-mp-staging
//   npx tsx --env-file=.env.local scripts/seed-recon.ts

import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Faltam NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY. " +
      "Confirme que .env.local tem os dois e rode com --env-file=.env.local."
  );
  process.exit(1);
}

const supabase = createClient<Database>(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data: tenants, error: tenantsErr } = await supabase
    .from("tenants")
    .select("id, nome_fantasia, razao_social");

  if (tenantsErr) {
    console.error("Erro ao ler tenants:", tenantsErr.message);
    process.exit(1);
  }

  console.log("=== Tenants ===");
  for (const t of tenants ?? []) {
    console.log(`  ${t.id}  ${t.nome_fantasia ?? t.razao_social}`);
  }

  const tables = [
    "profiles",
    "companies",
    "vehicles",
    "drivers",
    "collections",
    "documents",
    "bpo_tasks",
    "financial_accounts",
    "financial_categories",
    "financial_entries",
  ] as const;

  console.log("\n=== Contagem por tabela ===");
  for (const table of tables) {
    const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
    if (error) {
      console.log(`  ${table}: erro (${error.message})`);
    } else {
      console.log(`  ${table}: ${count ?? 0}`);
    }
  }

  console.log("\n=== Profiles (para achar quem pode virar motorista) ===");
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, role, tenant_id")
    .order("role", { ascending: true });
  for (const p of profiles ?? []) {
    console.log(`  ${p.id}  ${p.full_name}  [${p.role}]`);
  }
}

main();
