// Seed historico da Fase 3 (modulo financeiro) -- gera dado sintetico de
// 02/01/2026 ate hoje para o tenant real MD Ambiental: clientes/veiculos/
// motoristas novos (variando situacao de certificacao), coletas, documentos
// CCO, tarefas BPO, manutencao de frota e lancamentos financeiros.
//
// Todo registro criado por este script recebe is_synthetic = true (coluna
// adicionada na migration 0026). Nada e apagado; nada real e tocado.
//
// Modo padrao = dry-run: gera tudo em memoria e imprime um resumo mensal,
// SEM gravar no banco. So grava com a flag --apply.
//
// Uso (PowerShell, a partir da raiz do repo):
//   cd C:\Projetos\md\cyber-mp-staging
//   npx tsx --env-file=.env.local scripts/seed-historico.ts            (dry-run)
//   npx tsx --env-file=.env.local scripts/seed-historico.ts --apply    (grava em staging)
//
// Reexecutar em modo --apply e seguro: master data nova (empresas/veiculos/
// motoristas) e verificada por nome antes de inserir, entao rodar duas vezes
// nao duplica clientes/veiculos/motoristas. Coletas/documentos/BPO/financeiro
// NAO tem essa checagem -- rodar --apply mais de uma vez duplica o historico.
// Se precisar refazer, apague as linhas is_synthetic = true das tabelas
// operacionais antes (fica pronto na Fase 4).

import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import type { Database } from "../types/supabase";

// ---------------------------------------------------------------------------
// Config / premissas (ajustar aqui se os numeros nao baterem com a operacao
// real da MD Ambiental -- documentado explicitamente para revisao antes do
// --apply)
// ---------------------------------------------------------------------------

const START_DATE = new Date("2026-01-02T00:00:00");
const END_DATE = new Date(); // "hoje"
const APPLY = process.argv.includes("--apply");

// Regra de receita mista (definida com o usuario): coleta grande = MD compra
// o oleo do gerador (despesa); coleta pequena = MD cobra taxa de coleta
// (receita).
const VOLUME_THRESHOLD_LITROS = 200;
const PRECO_COMPRA_OLEO_POR_LITRO = 0.55; // despesa quando volume >= threshold
const PRECO_REVENDA_OLEO_POR_LITRO = 1.75; // receita na venda em lote p/ rerrefino
const TAXA_COLETA_POR_FAIXA = [
  { ateLitros: 80, valor: 220 },
  { ateLitros: 150, valor: 380 },
  { ateLitros: 200, valor: 520 },
];

// v1 (salario 18000/aluguel 4500/combustivel 350-550/revenda 0,95) deu saldo
// medio de -29.500/mes -- custo fixo grande demais pro volume de ~10.000
// L/mes gerado. v2 (salario 8000/aluguel 2800/revenda 1,45) melhorou pra
// -9.500/mes mas ainda negativo todo mes. v3 (esta): reduz mais um pouco o
// custo fixo e sobe a margem de revenda pra 1,20/L (spread sobre o preco de
// compra) -- meta e ficar perto do breakeven, com meses variando entre
// levemente negativo e positivo (mais realista que saldo uniforme).
const SALARIO_MENSAL = 6000;
const ALUGUEL_MENSAL = 2800;
const CONTAS_MENSAL_MIN = 700;
const CONTAS_MENSAL_MAX = 1000;
const IMPOSTO_PERCENT_SIMPLES = 0.06; // sobre receita bruta do mes anterior
const COMBUSTIVEL_SEMANAL_POR_VEICULO_MIN = 130;
const COMBUSTIVEL_SEMANAL_POR_VEICULO_MAX = 220;

// ---------------------------------------------------------------------------
// RNG determinístico (mesma seed => mesmo resultado em dry-run e --apply)
// ---------------------------------------------------------------------------

function mulberry32(seed: number) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(20260802);
const randInt = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;
const randFloat = (min: number, max: number) => rng() * (max - min) + min;
function pick<T>(arr: readonly T[]): T {
  const item = arr[randInt(0, arr.length - 1)];
  if (item === undefined) throw new Error("pick() chamado com array vazio");
  return item;
}
const chance = (p: number) => rng() < p;
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);
const iso = (d: Date) => d.toISOString().slice(0, 10);

// ---------------------------------------------------------------------------
// Supabase admin client
// ---------------------------------------------------------------------------

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Faltam NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY em .env.local.");
  process.exit(1);
}
const supabase = createClient<Database>(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ---------------------------------------------------------------------------
// Master data nova (companies / vehicles / drivers)
// ---------------------------------------------------------------------------

type Porte = "pequeno" | "medio" | "grande";

const NEW_COMPANIES: Array<{
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  address_cidade: string;
  address_uf: string;
  status: "active" | "inactive";
  license_expiry_date: string | null;
  porte: Porte;
}> = [
  {
    cnpj: "12.345.601/0001-00",
    razao_social: "Oficina Mecanica Boa Vista Ltda",
    nome_fantasia: "Oficina Boa Vista",
    address_cidade: "Piracicaba",
    address_uf: "SP",
    status: "active",
    license_expiry_date: iso(addDays(END_DATE, 400)),
    porte: "pequeno",
  },
  {
    cnpj: "12.345.602/0001-00",
    razao_social: "Auto Center Piracicaba Sul Ltda",
    nome_fantasia: "Auto Center Piracicaba Sul",
    address_cidade: "Piracicaba",
    address_uf: "SP",
    status: "active",
    license_expiry_date: iso(addDays(END_DATE, 250)),
    porte: "pequeno",
  },
  {
    cnpj: "12.345.603/0001-00",
    razao_social: "Posto Rodovia SP-304 Ltda",
    nome_fantasia: "Posto Rodovia SP-304",
    address_cidade: "Piracicaba",
    address_uf: "SP",
    status: "active",
    license_expiry_date: iso(addDays(END_DATE, 20)), // vencendo em breve (teste do alerta)
    porte: "medio",
  },
  {
    cnpj: "12.345.604/0001-00",
    razao_social: "Transportadora Rota Verde Ltda",
    nome_fantasia: "Rota Verde Transportes",
    address_cidade: "Piracicaba",
    address_uf: "SP",
    status: "active",
    license_expiry_date: iso(addDays(END_DATE, -15)), // ja vencida (teste do alerta)
    porte: "medio",
  },
  {
    cnpj: "12.345.605/0001-00",
    razao_social: "Industria Metalurgica Piracicaba Ltda",
    nome_fantasia: "Metalurgica Piracicaba",
    address_cidade: "Piracicaba",
    address_uf: "SP",
    status: "active",
    license_expiry_date: iso(addDays(END_DATE, 500)),
    porte: "grande",
  },
  {
    cnpj: "12.345.606/0001-00",
    razao_social: "Frigorifico Central Piracicaba Ltda",
    nome_fantasia: "Frigorifico Central",
    address_cidade: "Piracicaba",
    address_uf: "SP",
    status: "active",
    license_expiry_date: iso(addDays(END_DATE, 12)), // vencendo em breve (teste do alerta)
    porte: "grande",
  },
];

const NEW_VEHICLES: Array<{
  plate: string;
  model: string;
  brand: string;
  capacity_litros: number;
  status: "active" | "maintenance" | "inactive";
  license_expiry_date: string;
  insurance_expiry_date: string;
}> = [
  {
    plate: "TST1A23",
    model: "Bau 5t",
    brand: "Volkswagen",
    capacity_litros: 5000,
    status: "active",
    license_expiry_date: iso(addDays(END_DATE, 300)),
    insurance_expiry_date: iso(addDays(END_DATE, 200)),
  },
  {
    plate: "TST2B34",
    model: "Tanque 8t",
    brand: "Ford",
    capacity_litros: 8000,
    status: "active",
    license_expiry_date: iso(addDays(END_DATE, 18)), // vencendo em breve
    insurance_expiry_date: iso(addDays(END_DATE, 150)),
  },
  {
    plate: "TST3C45",
    model: "Van de coleta",
    brand: "Fiat",
    capacity_litros: 1200,
    status: "maintenance",
    license_expiry_date: iso(addDays(END_DATE, 100)),
    insurance_expiry_date: iso(addDays(END_DATE, -10)), // ja vencida
  },
];

const NEW_DRIVERS: Array<{
  full_name: string;
  email: string;
  cnh_number: string;
  cnh_category: string;
  cnh_expiry: string;
  mopp_expiry: string;
}> = [
  {
    full_name: "Roberto Silva [TESTE]",
    email: "roberto.silva.teste@mdambiental-demo.local",
    cnh_number: "11122233344",
    cnh_category: "C",
    cnh_expiry: iso(addDays(END_DATE, 600)),
    mopp_expiry: iso(addDays(END_DATE, 300)),
  },
  {
    full_name: "Fernanda Costa [TESTE]",
    email: "fernanda.costa.teste@mdambiental-demo.local",
    cnh_number: "22233344455",
    cnh_category: "D",
    cnh_expiry: iso(addDays(END_DATE, 20)), // vencendo em breve
    mopp_expiry: iso(addDays(END_DATE, 250)),
  },
  {
    full_name: "Jose Almeida [TESTE]",
    email: "jose.almeida.teste@mdambiental-demo.local",
    cnh_number: "33344455566",
    cnh_category: "E",
    cnh_expiry: iso(addDays(END_DATE, 400)),
    mopp_expiry: iso(addDays(END_DATE, -30)), // ja vencida (teste do alerta)
  },
];

const FINANCIAL_ACCOUNTS = [
  { name: "Conta Corrente Itau", kind: "banco" as const, bank_name: "Itau", initial_balance: 15000 },
  { name: "Caixa Piracicaba", kind: "caixa" as const, bank_name: null, initial_balance: 800 },
];

const FINANCIAL_CATEGORIES = [
  { name: "Taxa de coleta", type: "receita" as const },
  { name: "Venda de oleo para rerrefino", type: "receita" as const },
  { name: "Compra de oleo usado", type: "despesa" as const },
  { name: "Combustivel", type: "despesa" as const },
  { name: "Manutencao de frota", type: "despesa" as const },
  { name: "Salarios", type: "despesa" as const },
  { name: "Aluguel", type: "despesa" as const },
  { name: "Impostos", type: "despesa" as const },
  { name: "Contas e servicos", type: "despesa" as const },
];

const DEPARTMENTS = ["comercial", "operacional", "administrativo", "financeiro", "rh"] as const;
type Department = (typeof DEPARTMENTS)[number];

const BPO_TITLES: Record<Department, string[]> = {
  comercial: ["Prospeccao de novo cliente", "Renovacao de contrato", "Visita tecnica comercial", "Follow-up de proposta"],
  operacional: ["Roteirizacao semanal", "Revisao de veiculo", "Ajuste de rota de coleta", "Inspecao de EPI"],
  administrativo: ["Arquivamento de documentos", "Atualizacao cadastral de cliente", "Organizacao de contratos", "Emissao de nota fiscal"],
  financeiro: ["Conciliacao bancaria", "Cobranca de cliente em atraso", "Fechamento mensal", "Revisao de despesas"],
  rh: ["Agendamento de ferias", "Treinamento NR", "Avaliacao de desempenho", "Recrutamento de motorista"],
};

// ---------------------------------------------------------------------------
// Modelo em memoria (temp ids ate a insercao real)
// ---------------------------------------------------------------------------

type Company = { tempId: string; realId?: string; razao_social: string; porte: Porte };
type Vehicle = { tempId: string; realId?: string; status: string };
type Driver = { tempId: string; realId?: string };
type Collection = {
  tempId: string;
  realId?: string;
  companyTempId: string;
  companyRealId?: string;
  vehicleId?: string;
  driverId?: string;
  collection_date: string;
  volume_litros: number;
  status: "completed" | "scheduled" | "in_progress" | "canceled";
};
type FinancialEntryPlan = {
  categoryName: string;
  type: "receita" | "despesa";
  description: string;
  amount: number;
  entry_date: string;
  status: "paid" | "pending";
  reference_type?: string;
  referenceCollectionTempId?: string;
};

async function main() {
  console.log(`Periodo: ${iso(START_DATE)} a ${iso(END_DATE)}`);
  console.log(APPLY ? ">> MODO --apply: vai gravar em staging." : ">> MODO dry-run: nada sera gravado.");

  const { data: tenants } = await supabase.from("tenants").select("id, nome_fantasia");
  const tenant = tenants?.[0];
  if (!tenant) {
    console.error("Nenhum tenant encontrado.");
    process.exit(1);
  }
  console.log(`Tenant: ${tenant.nome_fantasia} (${tenant.id})`);

  const { data: existingCompaniesRaw } = await supabase
    .from("companies")
    .select("id, razao_social, status")
    .eq("tenant_id", tenant.id);
  const existingCompanyNames = new Set((existingCompaniesRaw ?? []).map((c) => c.razao_social));

  const { data: existingVehiclesRaw } = await supabase
    .from("vehicles")
    .select("id, status")
    .eq("tenant_id", tenant.id);

  const { data: existingDriversRaw } = await supabase
    .from("drivers")
    .select("id, status, vehicle_id")
    .eq("tenant_id", tenant.id);

  // ---- Companies (existentes + novas) ----
  // Dedupe por nome: se o script ja rodou --apply antes, as empresas do seed
  // ja estao em existingCompaniesRaw -- reaproveita o id real em vez de
  // tentar inserir de novo ou gerar um tempId que nao resolve depois.
  const companies: Company[] = [];
  for (const c of existingCompaniesRaw ?? []) {
    if (c.status !== "active") continue;
    const isSeedCompany = NEW_COMPANIES.some((nc) => nc.razao_social === c.razao_social);
    if (isSeedCompany) continue; // tratada no loop abaixo, evita duplicar
    companies.push({ tempId: c.id, realId: c.id, razao_social: c.razao_social, porte: "medio" });
  }
  const companiesToInsert = NEW_COMPANIES.filter((c) => !existingCompanyNames.has(c.razao_social));
  for (const c of NEW_COMPANIES) {
    const existingId = existingCompaniesRaw?.find((ec) => ec.razao_social === c.razao_social)?.id;
    companies.push({
      tempId: existingId ?? `new-company-${c.cnpj}`,
      realId: existingId,
      razao_social: c.razao_social,
      porte: c.porte,
    });
  }

  // ---- Vehicles (existentes ativos + novos) ----
  const activeVehicleTempIds: string[] = [];
  for (const v of existingVehiclesRaw ?? []) {
    if (v.status === "active") activeVehicleTempIds.push(v.id);
  }
  for (const v of NEW_VEHICLES) {
    if (v.status === "active") activeVehicleTempIds.push(`new-vehicle-${v.plate}`);
  }

  // ---- Drivers (existentes ativos + novos) ----
  const activeDriverTempIds: string[] = [];
  for (const d of existingDriversRaw ?? []) {
    if (d.status === "active") activeDriverTempIds.push(d.id);
  }
  for (const d of NEW_DRIVERS) {
    activeDriverTempIds.push(`new-driver-${d.email}`);
  }

  if (activeVehicleTempIds.length === 0 || activeDriverTempIds.length === 0) {
    console.error("Sem veiculo ou motorista ativo -- nao da pra gerar coletas.");
    process.exit(1);
  }

  // ---------------------------------------------------------------------
  // Coletas (por porte da empresa) + lancamentos financeiros por coleta
  // ---------------------------------------------------------------------

  const VOLUME_RANGE: Record<Porte, [number, number]> = {
    pequeno: [60, 150],
    medio: [180, 400],
    grande: [500, 1200],
  };
  const INTERVALO_DIAS: Record<Porte, number> = {
    pequeno: 28,
    medio: 14,
    grande: 7,
  };

  const collections: Collection[] = [];
  const financialEntries: FinancialEntryPlan[] = [];
  let collectionSeq = 0;

  for (const company of companies) {
    let cursor = addDays(START_DATE, randInt(0, INTERVALO_DIAS[company.porte] - 1));
    while (cursor <= END_DATE) {
      collectionSeq += 1;
      const volume = Math.round(randFloat(...VOLUME_RANGE[company.porte]));
      const isPast = cursor < addDays(END_DATE, -2);
      let status: Collection["status"];
      if (!isPast) {
        status = pick(["completed", "scheduled", "in_progress"] as const);
      } else if (chance(0.05)) {
        status = "canceled";
      } else {
        status = "completed";
      }

      const tempId = `collection-${collectionSeq}`;
      collections.push({
        tempId,
        companyTempId: company.tempId,
        companyRealId: company.realId,
        vehicleId: pick(activeVehicleTempIds),
        driverId: pick(activeDriverTempIds),
        collection_date: cursor.toISOString(),
        volume_litros: volume,
        status,
      });

      if (status === "completed") {
        if (volume >= VOLUME_THRESHOLD_LITROS) {
          financialEntries.push({
            categoryName: "Compra de oleo usado",
            type: "despesa",
            description: `Compra de oleo usado -- ${company.razao_social} (${volume} L)`,
            amount: Math.round(volume * PRECO_COMPRA_OLEO_POR_LITRO * 100) / 100,
            entry_date: iso(cursor),
            status: "paid",
            reference_type: "collection",
            referenceCollectionTempId: tempId,
          });
        } else {
          const faixa = TAXA_COLETA_POR_FAIXA.find((f) => volume <= f.ateLitros) ?? TAXA_COLETA_POR_FAIXA.at(-1)!;
          financialEntries.push({
            categoryName: "Taxa de coleta",
            type: "receita",
            description: `Taxa de coleta -- ${company.razao_social} (${volume} L)`,
            amount: faixa.valor,
            entry_date: iso(cursor),
            status: "paid",
            reference_type: "collection",
            referenceCollectionTempId: tempId,
          });
        }
      }

      cursor = addDays(cursor, INTERVALO_DIAS[company.porte]);
    }
  }

  // ---- Venda em lote para rerrefino (quinzenal, sobre volume comprado) ----
  {
    let cursor = addDays(START_DATE, 13);
    while (cursor <= END_DATE) {
      const periodoInicio = addDays(cursor, -13);
      const volumePeriodo = collections
        .filter(
          (c) =>
            c.status === "completed" &&
            c.volume_litros >= VOLUME_THRESHOLD_LITROS &&
            new Date(c.collection_date) >= periodoInicio &&
            new Date(c.collection_date) <= cursor
        )
        .reduce((sum, c) => sum + c.volume_litros, 0);
      if (volumePeriodo > 0) {
        financialEntries.push({
          categoryName: "Venda de oleo para rerrefino",
          type: "receita",
          description: `Venda de oleo para rerrefino -- lote ${iso(periodoInicio)} a ${iso(cursor)} (${volumePeriodo} L)`,
          amount: Math.round(volumePeriodo * PRECO_REVENDA_OLEO_POR_LITRO * 100) / 100,
          entry_date: iso(cursor),
          status: "paid",
        });
      }
      cursor = addDays(cursor, 14);
    }
  }

  // ---- Despesas fixas mensais + combustivel semanal ----
  {
    let monthCursor = new Date(START_DATE.getFullYear(), START_DATE.getMonth(), 1);
    while (monthCursor <= END_DATE) {
      const dueSalario = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 5);
      const dueAluguel = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 10);
      if (dueSalario <= END_DATE) {
        financialEntries.push({
          categoryName: "Salarios",
          type: "despesa",
          description: `Folha de pagamento -- ${dueSalario.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`,
          amount: SALARIO_MENSAL,
          entry_date: iso(dueSalario),
          status: "paid",
        });
      }
      if (dueAluguel <= END_DATE) {
        financialEntries.push({
          categoryName: "Aluguel",
          type: "despesa",
          description: `Aluguel do galpao -- ${dueAluguel.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`,
          amount: ALUGUEL_MENSAL,
          entry_date: iso(dueAluguel),
          status: "paid",
        });
        financialEntries.push({
          categoryName: "Contas e servicos",
          type: "despesa",
          description: `Agua, luz, internet -- ${dueAluguel.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`,
          amount: Math.round(randFloat(CONTAS_MENSAL_MIN, CONTAS_MENSAL_MAX)),
          entry_date: iso(dueAluguel),
          status: "paid",
        });

        // Imposto sobre receita bruta do mes anterior (Simples Nacional)
        const prevMonthStart = new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1);
        const prevMonthEnd = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 0);
        const receitaMesAnterior = financialEntries
          .filter((e) => e.type === "receita" && new Date(e.entry_date) >= prevMonthStart && new Date(e.entry_date) <= prevMonthEnd)
          .reduce((sum, e) => sum + e.amount, 0);
        if (receitaMesAnterior > 0) {
          financialEntries.push({
            categoryName: "Impostos",
            type: "despesa",
            description: `Simples Nacional -- referente a ${prevMonthStart.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`,
            amount: Math.round(receitaMesAnterior * IMPOSTO_PERCENT_SIMPLES * 100) / 100,
            entry_date: iso(dueAluguel),
            status: "paid",
          });
        }
      }
      monthCursor = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1);
    }

    let weekCursor = new Date(START_DATE);
    while (weekCursor <= END_DATE) {
      for (const _v of activeVehicleTempIds) {
        financialEntries.push({
          categoryName: "Combustivel",
          type: "despesa",
          description: `Abastecimento semanal de frota -- semana de ${iso(weekCursor)}`,
          amount: Math.round(randFloat(COMBUSTIVEL_SEMANAL_POR_VEICULO_MIN, COMBUSTIVEL_SEMANAL_POR_VEICULO_MAX)),
          entry_date: iso(weekCursor),
          status: "paid",
        });
      }
      weekCursor = addDays(weekCursor, 7);
    }
  }

  // ---- Manutencao de frota ----
  const maintenanceTypes = ["oleo", "pneu", "lavagem", "mecanica", "documento"] as const;
  const maintenanceCostRange: Record<(typeof maintenanceTypes)[number], [number, number]> = {
    oleo: [300, 600],
    pneu: [800, 1500],
    lavagem: [80, 150],
    mecanica: [500, 3000],
    documento: [200, 400],
  };
  const maintenanceEvents: Array<{ vehicleTempId: string; type: (typeof maintenanceTypes)[number]; cost: number; date: string }> = [];
  for (const vId of activeVehicleTempIds) {
    let cursor = addDays(START_DATE, randInt(0, 49));
    while (cursor <= END_DATE) {
      const type = pick([...maintenanceTypes]);
      const cost = Math.round(randFloat(...maintenanceCostRange[type]));
      maintenanceEvents.push({ vehicleTempId: vId, type, cost, date: iso(cursor) });
      financialEntries.push({
        categoryName: "Manutencao de frota",
        type: "despesa",
        description: `Manutencao (${type}) -- veiculo ${vId}`,
        amount: cost,
        entry_date: iso(cursor),
        status: "paid",
      });
      cursor = addDays(cursor, randInt(45, 60));
    }
  }

  // ---- BPO tasks ----
  const departments = [...DEPARTMENTS];
  const bpoTasks: Array<{ department: string; title: string; status: string; due_date: string }> = [];
  {
    let cursor = new Date(START_DATE);
    while (cursor <= END_DATE) {
      const tasksThisWeek = randInt(1, 3);
      for (let i = 0; i < tasksThisWeek; i++) {
        const dept = pick(departments);
        const title = pick(BPO_TITLES[dept]);
        const due = addDays(cursor, randInt(2, 18));
        let status: string;
        if (due < addDays(END_DATE, -5)) status = chance(0.85) ? "done" : "blocked";
        else if (due < END_DATE) status = pick(["done", "in_progress", "blocked"]);
        else status = pick(["pending", "in_progress"]);
        bpoTasks.push({ department: dept, title, status, due_date: iso(due) });
      }
      cursor = addDays(cursor, 7);
    }
  }

  // ---------------------------------------------------------------------
  // Resumo (dry-run e --apply imprimem o mesmo resumo, pra conferencia)
  // ---------------------------------------------------------------------

  printSummary({ companiesToInsert, collections, financialEntries, maintenanceEvents, bpoTasks });

  if (!APPLY) {
    console.log("\nDry-run concluido. Rode com --apply para gravar em staging.");
    return;
  }

  await applyToDatabase({
    tenantId: tenant.id,
    companiesToInsert,
    companies,
    activeVehicleTempIds,
    collections,
    financialEntries,
    maintenanceEvents,
    bpoTasks,
  });
}

function printSummary(data: {
  companiesToInsert: typeof NEW_COMPANIES;
  collections: Collection[];
  financialEntries: FinancialEntryPlan[];
  maintenanceEvents: Array<{ cost: number }>;
  bpoTasks: Array<{ status: string }>;
}) {
  console.log(`\n=== Master data nova ===`);
  console.log(`  Empresas novas: ${data.companiesToInsert.length} (de ${NEW_COMPANIES.length} planejadas -- as demais ja existem)`);
  console.log(`  Veiculos novos: ${NEW_VEHICLES.length}`);
  console.log(`  Motoristas novos: ${NEW_DRIVERS.length}`);

  console.log(`\n=== Resumo mensal ===`);
  const months = new Map<string, { coletas: number; volume: number; receita: number; despesa: number }>();
  for (const c of data.collections) {
    const key = c.collection_date.slice(0, 7);
    const m = months.get(key) ?? { coletas: 0, volume: 0, receita: 0, despesa: 0 };
    m.coletas += 1;
    if (c.status === "completed") m.volume += c.volume_litros;
    months.set(key, m);
  }
  for (const e of data.financialEntries) {
    const key = e.entry_date.slice(0, 7);
    const m = months.get(key) ?? { coletas: 0, volume: 0, receita: 0, despesa: 0 };
    if (e.type === "receita") m.receita += e.amount;
    else m.despesa += e.amount;
    months.set(key, m);
  }
  const sortedMonths = [...months.entries()].sort(([a], [b]) => a.localeCompare(b));
  console.log("  mes      coletas  volume(L)   receita(R$)   despesa(R$)   saldo(R$)");
  let totalReceita = 0;
  let totalDespesa = 0;
  let totalVolume = 0;
  let totalColetas = 0;
  for (const [key, m] of sortedMonths) {
    const saldo = m.receita - m.despesa;
    totalReceita += m.receita;
    totalDespesa += m.despesa;
    totalVolume += m.volume;
    totalColetas += m.coletas;
    console.log(
      `  ${key}   ${String(m.coletas).padStart(4)}     ${String(Math.round(m.volume)).padStart(7)}    ${m.receita.toFixed(2).padStart(10)}    ${m.despesa.toFixed(2).padStart(10)}    ${saldo.toFixed(2).padStart(9)}`
    );
  }
  console.log(`\n  TOTAL: ${totalColetas} coletas, ${Math.round(totalVolume)} L, receita R$ ${totalReceita.toFixed(2)}, despesa R$ ${totalDespesa.toFixed(2)}, saldo R$ ${(totalReceita - totalDespesa).toFixed(2)}`);

  console.log(`\n=== Outras contagens ===`);
  console.log(`  Documentos CCO a gerar: ~${Math.round(data.collections.filter((c) => c.status === "completed").length * 0.85)}`);
  console.log(`  Eventos de manutencao de frota: ${data.maintenanceEvents.length}`);
  console.log(`  Tarefas BPO: ${data.bpoTasks.length}`);
  const bpoByStatus = data.bpoTasks.reduce<Record<string, number>>((acc, t) => {
    acc[t.status] = (acc[t.status] ?? 0) + 1;
    return acc;
  }, {});
  console.log(`  BPO por status: ${JSON.stringify(bpoByStatus)}`);
}

async function applyToDatabase(args: {
  tenantId: string;
  companiesToInsert: typeof NEW_COMPANIES;
  companies: Company[];
  activeVehicleTempIds: string[];
  collections: Collection[];
  financialEntries: FinancialEntryPlan[];
  maintenanceEvents: Array<{ vehicleTempId: string; type: string; cost: number; date: string }>;
  bpoTasks: Array<{ department: string; title: string; status: string; due_date: string }>;
}) {
  const { tenantId } = args;
  console.log("\n=== Gravando em staging ===");

  // ---- Companies ----
  const companyIdMap = new Map<string, string>();
  for (const c of args.companiesToInsert) {
    const { data, error } = await supabase
      .from("companies")
      .insert({
        tenant_id: tenantId,
        cnpj: c.cnpj,
        razao_social: c.razao_social,
        nome_fantasia: c.nome_fantasia,
        address_cidade: c.address_cidade,
        address_uf: c.address_uf,
        status: c.status,
        license_expiry_date: c.license_expiry_date,
        is_synthetic: true,
      })
      .select("id")
      .single();
    if (error) {
      console.error(`Erro ao inserir empresa ${c.razao_social}:`, error.message);
      continue;
    }
    companyIdMap.set(`new-company-${c.cnpj}`, data.id);
    console.log(`  + empresa: ${c.razao_social}`);
  }
  for (const c of args.companies) {
    if (c.realId) companyIdMap.set(c.tempId, c.realId);
  }

  // ---- Vehicles ----
  const vehicleIdMap = new Map<string, string>();
  for (const v of NEW_VEHICLES) {
    const { data: existing } = await supabase.from("vehicles").select("id").eq("tenant_id", tenantId).eq("plate", v.plate).maybeSingle();
    if (existing) {
      vehicleIdMap.set(`new-vehicle-${v.plate}`, existing.id);
      continue;
    }
    const { data, error } = await supabase
      .from("vehicles")
      .insert({
        tenant_id: tenantId,
        plate: v.plate,
        model: v.model,
        brand: v.brand,
        capacity_litros: v.capacity_litros,
        status: v.status,
        license_expiry_date: v.license_expiry_date,
        insurance_expiry_date: v.insurance_expiry_date,
        is_synthetic: true,
      })
      .select("id")
      .single();
    if (error) {
      console.error(`Erro ao inserir veiculo ${v.plate}:`, error.message);
      continue;
    }
    vehicleIdMap.set(`new-vehicle-${v.plate}`, data.id);
    console.log(`  + veiculo: ${v.plate}`);
  }
  for (const id of args.activeVehicleTempIds) {
    if (!id.startsWith("new-vehicle-")) vehicleIdMap.set(id, id);
  }

  // ---- Drivers (cria auth user + profile + driver) ----
  const driverIdMap = new Map<string, string>();
  for (const d of NEW_DRIVERS) {
    const { data: existingProfile } = await supabase.from("profiles").select("id").eq("email", d.email).maybeSingle();
    let profileId = existingProfile?.id;
    if (!profileId) {
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: d.email,
        password: randomUUID(),
        email_confirm: true,
      });
      if (authError || !authUser?.user) {
        console.error(`Erro ao criar usuario auth para ${d.full_name}:`, authError?.message);
        continue;
      }
      profileId = authUser.user.id;
      const { error: profileError } = await supabase.from("profiles").insert({
        id: profileId,
        tenant_id: tenantId,
        role: "tenant_driver",
        full_name: d.full_name,
        email: d.email,
      });
      if (profileError) {
        console.error(`Erro ao criar profile para ${d.full_name}:`, profileError.message);
        continue;
      }
    }
    const { data: existingDriver } = await supabase.from("drivers").select("id").eq("profile_id", profileId).maybeSingle();
    if (existingDriver) {
      driverIdMap.set(`new-driver-${d.email}`, existingDriver.id);
      continue;
    }
    const { data, error } = await supabase
      .from("drivers")
      .insert({
        tenant_id: tenantId,
        profile_id: profileId,
        cnh_number: d.cnh_number,
        cnh_category: d.cnh_category,
        cnh_expiry: d.cnh_expiry,
        mopp_expiry: d.mopp_expiry,
        status: "active",
        is_synthetic: true,
      })
      .select("id")
      .single();
    if (error) {
      console.error(`Erro ao inserir motorista ${d.full_name}:`, error.message);
      continue;
    }
    driverIdMap.set(`new-driver-${d.email}`, data.id);
    console.log(`  + motorista: ${d.full_name}`);
  }

  // ---- Financial accounts + categories ----
  const accountIdMap = new Map<string, string>();
  for (const a of FINANCIAL_ACCOUNTS) {
    const { data: existing } = await supabase.from("financial_accounts").select("id").eq("tenant_id", tenantId).eq("name", a.name).maybeSingle();
    if (existing) {
      accountIdMap.set(a.name, existing.id);
      continue;
    }
    const { data, error } = await supabase
      .from("financial_accounts")
      .insert({ tenant_id: tenantId, name: a.name, kind: a.kind, bank_name: a.bank_name, initial_balance: a.initial_balance })
      .select("id")
      .single();
    if (error) {
      console.error(`Erro ao inserir conta ${a.name}:`, error.message);
      continue;
    }
    accountIdMap.set(a.name, data.id);
    console.log(`  + conta financeira: ${a.name}`);
  }
  const firstAccount = FINANCIAL_ACCOUNTS[0];
  if (!firstAccount) throw new Error("FINANCIAL_ACCOUNTS esta vazio.");
  const defaultAccountId = accountIdMap.get(firstAccount.name);
  if (!defaultAccountId) throw new Error(`Conta financeira "${firstAccount.name}" nao foi criada/encontrada.`);

  const categoryIdMap = new Map<string, string>();
  for (const c of FINANCIAL_CATEGORIES) {
    const { data: existing } = await supabase.from("financial_categories").select("id").eq("tenant_id", tenantId).eq("name", c.name).maybeSingle();
    if (existing) {
      categoryIdMap.set(c.name, existing.id);
      continue;
    }
    const { data, error } = await supabase
      .from("financial_categories")
      .insert({ tenant_id: tenantId, name: c.name, type: c.type })
      .select("id")
      .single();
    if (error) {
      console.error(`Erro ao inserir categoria ${c.name}:`, error.message);
      continue;
    }
    categoryIdMap.set(c.name, data.id);
    console.log(`  + categoria financeira: ${c.name}`);
  }

  // ---- Collections (em lotes) ----
  const collectionIdMap = new Map<string, string>();
  const BATCH = 200;
  for (let i = 0; i < args.collections.length; i += BATCH) {
    const batch = args.collections.slice(i, i + BATCH);
    const rows = batch.map((c) => ({
      tenant_id: tenantId,
      company_id: companyIdMap.get(c.companyTempId) ?? c.companyRealId!,
      driver_id: driverIdMap.get(c.driverId!) ?? c.driverId!,
      vehicle_id: vehicleIdMap.get(c.vehicleId!) ?? c.vehicleId!,
      collection_date: c.collection_date,
      volume_litros: c.volume_litros,
      status: c.status,
      is_synthetic: true,
    }));
    const { data, error } = await supabase.from("collections").insert(rows).select("id");
    if (error) {
      console.error("Erro ao inserir lote de coletas:", error.message);
      continue;
    }
    data.forEach((row, idx) => {
      const original = batch[idx];
      if (original) collectionIdMap.set(original.tempId, row.id);
    });
  }
  console.log(`  + coletas: ${collectionIdMap.size}`);

  // ---- Documents (85% das completed) ----
  let docCount = 0;
  let docSeq = 0;
  const docRows: Array<{ tenant_id: string; collection_id: string; type: "CCO"; document_number: string; issue_date: string; status: "issued" | "draft" }> = [];
  for (const c of args.collections) {
    if (c.status !== "completed") continue;
    if (!chance(0.85)) continue;
    const realCollectionId = collectionIdMap.get(c.tempId);
    if (!realCollectionId) continue;
    docSeq += 1;
    docRows.push({
      tenant_id: tenantId,
      collection_id: realCollectionId,
      type: "CCO",
      document_number: `CCO-2026-DEMO-${String(docSeq).padStart(4, "0")}`,
      issue_date: iso(addDays(new Date(c.collection_date), randInt(0, 3))),
      status: chance(0.9) ? "issued" : "draft",
    });
  }
  for (let i = 0; i < docRows.length; i += BATCH) {
    const batch = docRows.slice(i, i + BATCH).map((d) => ({ ...d, is_synthetic: true }));
    const { error } = await supabase.from("documents").insert(batch);
    if (error) console.error("Erro ao inserir lote de documentos:", error.message);
    else docCount += batch.length;
  }
  console.log(`  + documentos CCO: ${docCount}`);

  // ---- Vehicle maintenance ----
  let maintCount = 0;
  for (const m of args.maintenanceEvents) {
    const vehicleId = vehicleIdMap.get(m.vehicleTempId) ?? m.vehicleTempId;
    const { error } = await supabase.from("vehicle_maintenance").insert({
      tenant_id: tenantId,
      vehicle_id: vehicleId,
      maintenance_type: m.type as never,
      cost: m.cost,
      maintenance_date: m.date,
      is_synthetic: true,
    });
    if (error) console.error("Erro ao inserir manutencao:", error.message);
    else maintCount += 1;
  }
  console.log(`  + manutencoes de frota: ${maintCount}`);

  // ---- Financial entries (em lotes) ----
  let entryCount = 0;
  const entryRows = args.financialEntries.map((e) => ({
    tenant_id: tenantId,
    account_id: defaultAccountId,
    category_id: categoryIdMap.get(e.categoryName)!,
    type: e.type,
    description: e.description,
    amount: e.amount,
    entry_date: e.entry_date,
    status: e.status,
    paid_date: e.status === "paid" ? e.entry_date : null,
    reference_type: e.reference_type ?? null,
    reference_id: e.referenceCollectionTempId ? collectionIdMap.get(e.referenceCollectionTempId) ?? null : null,
    is_synthetic: true,
  }));
  for (let i = 0; i < entryRows.length; i += BATCH) {
    const batch = entryRows.slice(i, i + BATCH);
    const { error } = await supabase.from("financial_entries").insert(batch);
    if (error) console.error("Erro ao inserir lote de lancamentos:", error.message);
    else entryCount += batch.length;
  }
  console.log(`  + lancamentos financeiros: ${entryCount}`);

  // ---- BPO tasks ----
  let bpoCount = 0;
  const bpoRows = args.bpoTasks.map((t) => ({
    tenant_id: tenantId,
    department: t.department as never,
    title: t.title,
    status: t.status as never,
    due_date: t.due_date,
    is_synthetic: true,
  }));
  for (let i = 0; i < bpoRows.length; i += BATCH) {
    const batch = bpoRows.slice(i, i + BATCH);
    const { error } = await supabase.from("bpo_tasks").insert(batch);
    if (error) console.error("Erro ao inserir lote de tarefas BPO:", error.message);
    else bpoCount += batch.length;
  }
  console.log(`  + tarefas BPO: ${bpoCount}`);

  console.log("\nSeed aplicado com sucesso.");
}

main();
