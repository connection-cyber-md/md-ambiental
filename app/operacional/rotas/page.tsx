import { createClient } from "@/lib/supabase/server";
import { RotasBoard } from "@/components/operacional/RotasBoard";

export default async function OperacionalRotasPage() {
  const supabase = await createClient();

  const [companiesRes, driversRes, pendingRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase.from("companies" as any)
      .select("id, razao_social, address_bairro, address_cidade")
      .eq("status", "active")
      .order("razao_social"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase.from("drivers" as any)
      .select("id, profiles(full_name)")
      .eq("status", "active"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase.from("collections" as any)
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
    <div className="p-8 max-w-7xl mx-auto">
      <p className="eyebrow mb-1">Painel Operacional</p>
      <h1 className="font-display text-[28px] text-ink mb-6">Central de operações</h1>

      {hasError ? (
        <div className="bg-white border border-ink/10 p-8 text-[15px] text-steel">
          <p className="mb-2">Não foi possível carregar os dados agora.</p>
          <p className="font-mono text-[12px] text-brand-amber-deep whitespace-pre-wrap">
            {debugErrors.join("\n")}
          </p>
        </div>
      ) : (
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        <RotasBoard companies={companies as any} drivers={drivers as any} pending={pending as any} />
      )}
    </div>
  );
}