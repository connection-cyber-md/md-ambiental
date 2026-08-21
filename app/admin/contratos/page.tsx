import { createClient } from "@/lib/supabase/server";
import { ContratosPageClient } from "@/components/admin/ContratosPageClient";

export default async function AdminContratosPage() {
  const supabase = await createClient();

  const [contractsRes, companiesRes, destinatariosRes] = await Promise.all([
    supabase
      .from("contracts")
      .select("id, party_type, company_id, destinatario_id, start_date, end_date, price_per_litro, sla_hours, status, notes, is_synthetic")
      .order("start_date", { ascending: false }),
    supabase.from("companies").select("id, razao_social").eq("status", "active").order("razao_social"),
    supabase.from("destinatarios").select("id, razao_social").eq("status", "active").order("razao_social"),
  ]);

  const hasError = Boolean(contractsRes.error || companiesRes.error || destinatariosRes.error);
  const debugErrors = [contractsRes.error, companiesRes.error, destinatariosRes.error]
    .filter(Boolean)
    .map((e) => `${e!.code ?? "?"}: ${e!.message}`);
  if (hasError) console.error("[/admin/contratos] query errors:", debugErrors);

  const contracts = contractsRes.data ?? [];
  const companies = companiesRes.data ?? [];
  const destinatarios = destinatariosRes.data ?? [];

  const activeCount = contracts.filter((c) => c.status === "active").length;
  const avgPrice =
    contracts.filter((c) => c.price_per_litro !== null).reduce((sum, c) => sum + Number(c.price_per_litro), 0) /
    (contracts.filter((c) => c.price_per_litro !== null).length || 1);

  if (hasError) {
    return (
      <div>
        <h1 className="font-display text-[28px] text-ink mb-6">Contratos</h1>
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
    <ContratosPageClient
      contracts={contracts}
      companies={companies}
      destinatarios={destinatarios}
      kpis={{
        total: String(contracts.length),
        active: String(activeCount),
        avgPrice: contracts.some((c) => c.price_per_litro !== null) ? `R$ ${avgPrice.toFixed(2)}/L` : "—",
      }}
    />
  );
}
