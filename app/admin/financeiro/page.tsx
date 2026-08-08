import { createClient } from "@/lib/supabase/server";
import { FinanceiroPageClient } from "@/components/admin/FinanceiroPageClient";
import { buildMonthlySeries, projectNextMonths } from "@/lib/financeiro/projection";

export default async function AdminFinanceiroPage() {
  const supabase = await createClient();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().slice(0, 10);

  const [accountsRes, categoriesRes, entriesRes] = await Promise.all([
    supabase
      .from("financial_accounts")
      .select("id, name, kind, bank_name, initial_balance, is_active")
      .order("name", { ascending: true }),
    supabase
      .from("financial_categories")
      .select("id, name, type, is_active")
      .order("name", { ascending: true }),
    supabase
      .from("financial_entries")
      .select("id, account_id, category_id, type, description, amount, entry_date, due_date, paid_date, status, is_synthetic")
      .order("entry_date", { ascending: false }),
  ]);

  const hasError = Boolean(accountsRes.error || categoriesRes.error || entriesRes.error);
  const debugErrors = [accountsRes.error, categoriesRes.error, entriesRes.error]
    .filter(Boolean)
    .map((e) => `${e!.code ?? "?"}: ${e!.message}`);
  if (hasError) console.error("[/admin/financeiro] query errors:", debugErrors);

  const allAccounts = accountsRes.data ?? [];
  const allCategories = categoriesRes.data ?? [];
  const entries = entriesRes.data ?? [];

  const activeAccounts = allAccounts.filter((a) => a.is_active);
  const activeCategories = allCategories.filter((c) => c.is_active);

  const paidReceitas = entries.filter((e) => e.type === "receita" && e.status === "paid");
  const paidDespesas = entries.filter((e) => e.type === "despesa" && e.status === "paid");

  const saldoInicial = allAccounts.reduce((sum, a) => sum + Number(a.initial_balance ?? 0), 0);
  const totalReceitas = paidReceitas.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalDespesas = paidDespesas.reduce((sum, e) => sum + Number(e.amount), 0);
  const saldoTotal = saldoInicial + totalReceitas - totalDespesas;

  const receitasMes = paidReceitas
    .filter((e) => (e.paid_date ?? e.entry_date) >= monthStart && (e.paid_date ?? e.entry_date) < monthEnd)
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const despesasMes = paidDespesas
    .filter((e) => (e.paid_date ?? e.entry_date) >= monthStart && (e.paid_date ?? e.entry_date) < monthEnd)
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const aReceber = entries
    .filter((e) => e.type === "receita" && e.status === "pending")
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const aPagar = entries
    .filter((e) => e.type === "despesa" && e.status === "pending")
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const monthlySeries = buildMonthlySeries(entries, saldoInicial);
  const projected = projectNextMonths(monthlySeries, 3);

  if (hasError) {
    return (
      <div>
        <h1 className="font-display text-[28px] text-ink mb-6">Financeiro</h1>
        <div className="bg-white border border-ink/10 p-8 text-[15px] text-steel">
          <p className="mb-2">Não foi possível carregar os dados agora. Tente recarregar a página.</p>
          <p className="font-mono text-[12px] text-brand-amber-deep whitespace-pre-wrap">
            {debugErrors.join("\n")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <FinanceiroPageClient
      accounts={activeAccounts}
      categories={activeCategories}
      entries={entries}
      kpis={{
        saldoTotal: fmt(saldoTotal),
        receitasMes: fmt(receitasMes),
        despesasMes: fmt(despesasMes),
        aPagar: fmt(aPagar),
        aReceber: fmt(aReceber),
      }}
      projection={{ series: monthlySeries, projected }}
    />
  );
}
