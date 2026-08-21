// Fase 4 do modulo financeiro: apaga SOMENTE os registros marcados
// is_synthetic = true, nas tabelas que recebem esse dado (seed historico,
// fixtures de dev). Dado real (is_synthetic = false) nunca e tocado.
//
// Dry-run por padrao -- so mostra quantos registros seriam apagados por
// tabela. So apaga de fato com a flag --apply.
//
// Uso (PowerShell, a partir da raiz do repo):
//   cd C:\Projetos\md\cyber-mp-staging
//   npx tsx --env-file=.env.local scripts/reset-synthetic-data.ts             (dry-run)
//   npx tsx --env-file=.env.local scripts/reset-synthetic-data.ts --apply     (apaga em staging)
//
// Trava de seguranca: o script confere o project ref embutido em
// NEXT_PUBLIC_SUPABASE_URL contra STAGING_PROJECT_REF abaixo e recusa rodar
// --apply se nao bater -- evita apagar dado em produção por engano de
// .env.local trocado.
//
// financial_accounts, financial_categories, bases, tanks e destinatarios NAO
// sao apagados: sao estrutura (nao tem is_synthetic), nao dado transacional
// de demonstracao.
//
// Ordem de exclusao respeita as FKs do schema (dominio OLUC — 0027/0033 —
// entra antes de documents/collections, que ele referencia):
//   expedition_lots -> stock_movements -> samples -> evidences -> documents
//   -> vehicle_maintenance -> financial_entries -> bpo_tasks -> contracts
//   -> expeditions -> lots -> collections -> vehicles
//   -> drivers (via exclusao do usuario auth, que cascateia profiles ->
//   drivers) -> companies

import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

const STAGING_PROJECT_REF = "oxsezxgzfiocpatiezhj";

const APPLY = process.argv.includes("--apply");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Faltam NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY. " +
      "Confirme que .env.local tem os dois e rode com --env-file=.env.local."
  );
  process.exit(1);
}

const urlMatch = url.match(/^https:\/\/([a-z0-9]+)\.supabase\.co/);
const projectRef = urlMatch?.[1];

if (projectRef !== STAGING_PROJECT_REF) {
  console.error(
    `TRAVA DE SEGURANCA: NEXT_PUBLIC_SUPABASE_URL aponta para o project ref "${projectRef ?? "?"}", ` +
      `mas este script so roda contra staging (${STAGING_PROJECT_REF}). Abortando sem tocar em nada.`
  );
  process.exit(1);
}

const supabase = createClient<Database>(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Ordem de exclusao (filhos antes de pais, respeitando FKs restrict/cascade).
// Cada entrada e uma tabela com coluna is_synthetic filtravel diretamente.
const SYNTHETIC_TABLES = [
  "expedition_lots",
  "stock_movements",
  "samples",
  "evidences",
  "documents",
  "vehicle_maintenance",
  "financial_entries",
  "bpo_tasks",
  "contracts",
  "expeditions",
  "lots",
  "collections",
  "vehicles",
] as const;

async function countSynthetic(table: (typeof SYNTHETIC_TABLES)[number] | "companies") {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq("is_synthetic", true);
  if (error) throw new Error(`Erro ao contar ${table}: ${error.message}`);
  return count ?? 0;
}

async function countSyntheticDrivers() {
  const { count, error } = await supabase
    .from("drivers")
    .select("*", { count: "exact", head: true })
    .eq("is_synthetic", true);
  if (error) throw new Error(`Erro ao contar drivers: ${error.message}`);
  return count ?? 0;
}

async function deleteSynthetic(table: (typeof SYNTHETIC_TABLES)[number]) {
  const { error, count } = await supabase
    .from(table)
    .delete({ count: "exact" })
    .eq("is_synthetic", true);
  if (error) throw new Error(`Erro ao apagar ${table}: ${error.message}`);
  return count ?? 0;
}

async function deleteSyntheticDrivers() {
  const { data: drivers, error } = await supabase
    .from("drivers")
    .select("id, profile_id")
    .eq("is_synthetic", true);
  if (error) throw new Error(`Erro ao ler drivers sinteticos: ${error.message}`);

  let deleted = 0;
  for (const d of drivers ?? []) {
    // Apaga o usuario auth -- isso cascateia profiles -> drivers
    // automaticamente (ON DELETE CASCADE nas duas FKs).
    const { error: authError } = await supabase.auth.admin.deleteUser(d.profile_id);
    if (authError) {
      console.error(`  Erro ao apagar usuario auth ${d.profile_id} (driver ${d.id}):`, authError.message);
      continue;
    }
    deleted += 1;
  }
  return deleted;
}

async function deleteSyntheticCompanies() {
  const { error, count } = await supabase
    .from("companies")
    .delete({ count: "exact" })
    .eq("is_synthetic", true);
  if (error) throw new Error(`Erro ao apagar companies: ${error.message}`);
  return count ?? 0;
}

async function main() {
  console.log(`Projeto: staging (${STAGING_PROJECT_REF})`);
  console.log(APPLY ? ">> MODO --apply: vai apagar dado sintetico em staging." : ">> MODO dry-run: nada sera apagado.");
  console.log("");

  if (!APPLY) {
    for (const table of SYNTHETIC_TABLES) {
      const n = await countSynthetic(table);
      console.log(`  ${table.padEnd(20, ".")} ${n}`);
    }
    const driversCount = await countSyntheticDrivers();
    console.log(`  ${"drivers (auth+perfil)".padEnd(20, ".")} ${driversCount}`);
    const companiesCount = await countSynthetic("companies");
    console.log(`  ${"companies".padEnd(20, ".")} ${companiesCount}`);
    console.log("\nNada foi apagado. Rode com --apply para confirmar.");
    return;
  }

  console.log(
    "Apagando na ordem: expedition_lots -> stock_movements -> samples -> evidences -> documents -> " +
      "vehicle_maintenance -> financial_entries -> bpo_tasks -> contracts -> expeditions -> lots -> " +
      "collections -> vehicles -> drivers -> companies\n"
  );

  for (const table of SYNTHETIC_TABLES) {
    const n = await deleteSynthetic(table);
    console.log(`  ${table.padEnd(20, ".")} ${n} apagado(s)`);
  }

  const driversDeleted = await deleteSyntheticDrivers();
  console.log(`  ${"drivers (auth+perfil)".padEnd(20, ".")} ${driversDeleted} apagado(s)`);

  const companiesDeleted = await deleteSyntheticCompanies();
  console.log(`  ${"companies".padEnd(20, ".")} ${companiesDeleted} apagado(s)`);

  console.log("\nReset concluido. financial_accounts e financial_categories nao foram tocados (estrutura, nao dado sintetico).");
}

main().catch((err) => {
  console.error("Erro fatal:", err instanceof Error ? err.message : err);
  process.exit(1);
});
