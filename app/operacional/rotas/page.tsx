import { createClient } from "@/lib/supabase/server";
import { RotasBoard } from "@/components/operacional/RotasBoard";

export default async function OperacionalRotasPage() {
  const supabase = await createClient();

  const [companiesRes, driversRes, pendingRes] = await Promise.all([
    supabase
      .from("companies")
      .select("id, razao_social, address_bairro, address_cidade")
      .eq("status", "active")
      .order("razao_social"),
    supabase
      .from("drivers")
      .select("id, profiles(full_name)")
      .eq("status", "active"),
    supabase
      .from("collections")
      .select("id, collection_date, notes, companies(id, razao_social, address_bairro, address_cidade), drivers(profiles(full_name))")
      .eq("status", "scheduled")
      .order("collection_date", { ascending: true }),
  ]);

  const hasError = Boolean(companiesRes.error || driversRes.error || pendingRes.error);
  const debugErrors = [companiesRes.error, driversRes.error, pendingRes.error]
    .filter(Boolean)
    .map((e) => `${e!.code ?? "?"}: ${e!.message}`);
  if (hasError) console.error("[/operacional/rotas] query errors:", debugErrors);

  const companies = companiesRes.data ?? [];
  const drivers = driversRes.data ?? [];
  const pending = pendingRes.data ?? [];

  return (
    <div>
      <p className="eyebrow">Painel Operacional</p>
      <h1 className="font-display text-[28px] text-ink mb-6">Central de operações</h1>

      {hasError ? (
        <div className="bg-white border border-ink/10 p-8 text-[15px] text-steel">
          <p className="mb-2">Não foi possível carregar os dados agora.</p>
          <p className="font-mono text-[12px] text-brand-amber-deep whitespace-pre-wrap">
            {debugErrors.join("\n")}
          </p>
        </div>
      ) : (
        <RotasBoard companies={companies} drivers={drivers} pending={pending} />
      )}
    </div>
  );
}
