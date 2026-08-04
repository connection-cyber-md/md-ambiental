import { createClient } from "@/lib/supabase/server";
import { KpiCard } from "@/components/ui/KpiCard";
import { licenseStatus, LICENSE_STATUS_LABEL } from "@/lib/compliance/licenseStatus";

export default async function PortalDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profileRes = user
    ? await supabase.from("profiles").select("company_id, full_name").eq("id", user.id).single()
    : { data: null, error: null };

  const companyId = profileRes.data?.company_id ?? null;

  if (!companyId) {
    return (
      <div>
        <p className="eyebrow">Portal do Cliente</p>
        <h1 className="font-display text-[28px] text-ink mb-6">Dashboard</h1>
        <div className="bg-white border border-ink/10 p-8 text-[15px] text-steel">
          Seu usuário ainda não está vinculado a uma empresa. Fale com o administrador da MD
          Ambiental para concluir seu cadastro.
        </div>
      </div>
    );
  }

  const [companyRes, collectionsRes] = await Promise.all([
    supabase
      .from("companies")
      .select("id, razao_social, license_expiry_date")
      .eq("id", companyId)
      .single(),
    supabase
      .from("collections")
      .select("id, collection_date, volume_litros, status")
      .eq("company_id", companyId)
      .order("collection_date", { ascending: false }),
  ]);

  const hasError = Boolean(companyRes.error || collectionsRes.error);
  const debugErrors = [companyRes.error, collectionsRes.error]
    .filter(Boolean)
    .map((e) => `${e!.code ?? "?"}: ${e!.message}`);
  if (hasError) console.error("[/portal] query errors:", debugErrors);

  const company = companyRes.data;
  const collections = collectionsRes.data ?? [];

  const totalVolume = collections.reduce((sum, c) => sum + Number(c.volume_litros ?? 0), 0);
  const lastCollection = collections.find((c) => c.status === "completed") ?? collections[0];
  const status = company ? licenseStatus(company.license_expiry_date) : "sem_data";

  return (
    <div>
      <p className="eyebrow">Portal do Cliente</p>
      <h1 className="font-display text-[28px] text-ink mb-6">{company?.razao_social ?? "Dashboard"}</h1>

      {hasError ? (
        <div className="bg-white border border-ink/10 p-8 text-[15px] text-steel">
          <p className="mb-2">Não foi possível carregar os dados agora. Tente recarregar a página.</p>
          <p className="font-mono text-[12px] text-brand-amber-deep whitespace-pre-wrap">
            {debugErrors.join("\n")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard label="Volume coletado (total)" value={`${totalVolume.toLocaleString("pt-BR")} L`} />
          <KpiCard
            label="Última coleta"
            value={
              lastCollection
                ? new Date(lastCollection.collection_date).toLocaleDateString("pt-BR")
                : "—"
            }
          />
          <KpiCard
            label="Licença"
            value={LICENSE_STATUS_LABEL[status]}
            accent={status === "vencida" || status === "vence_em_breve"}
          />
        </div>
      )}
    </div>
  );
}
