import { createClient } from "@/lib/supabase/server";
import { KpiCard } from "@/components/ui/KpiCard";

const DEPARTMENT_LABEL: Record<string, string> = {
  comercial: "Comercial",
  operacional: "Operacional",
  administrativo: "Administrativo",
  financeiro: "Financeiro",
  rh: "RH",
};

const DEPARTMENTS = ["comercial", "operacional", "administrativo", "financeiro", "rh"] as const;

export default async function AdminPage() {
  const supabase = await createClient();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
  const today = now.toISOString().slice(0, 10);
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [collectionsRes, companiesRes, bpoRes] = await Promise.all([
    supabase
      .from("collections")
      .select("id, status, volume_litros")
      .gte("collection_date", monthStart)
      .lt("collection_date", monthEnd),
    supabase.from("companies").select("id, status, license_expiry_date"),
    supabase.from("bpo_tasks").select("id, department, status"),
  ]);

  const hasError = Boolean(collectionsRes.error || companiesRes.error || bpoRes.error);
  const debugErrors = [collectionsRes.error, companiesRes.error, bpoRes.error]
    .filter(Boolean)
    .map((e) => `${e!.code ?? "?"}: ${e!.message}`);
  if (hasError) console.error("[/admin] query errors:", debugErrors);

  const collections = collectionsRes.data ?? [];
  const companies = companiesRes.data ?? [];
  const bpoTasks = bpoRes.data ?? [];

  const totalCollections = collections.length;
  const completedCollections = collections.filter((c) => c.status === "completed").length;
  const totalVolume = collections.reduce((sum, c) => sum + Number(c.volume_litros ?? 0), 0);

  const activeCompanies = companies.filter((c) => c.status === "active").length;
  const expiringLicenses = companies.filter(
    (c) =>
      c.license_expiry_date &&
      c.license_expiry_date >= today &&
      c.license_expiry_date <= in30Days
  ).length;

  const openBpoByDept = DEPARTMENTS.map((dept) => ({
    department: dept,
    label: DEPARTMENT_LABEL[dept],
    count: bpoTasks.filter((t) => t.department === dept && t.status !== "done").length,
  }));

  return (
    <div>
      <p className="eyebrow">Backoffice</p>
      <h1 className="font-display text-[28px] text-ink mb-6">Visão geral</h1>

      {hasError ? (
        <div className="bg-white border border-ink/10 p-8 text-[15px] text-steel">
          <p className="mb-2">Não foi possível carregar os dados agora. Tente recarregar a página.</p>
          <p className="font-mono text-[12px] text-brand-amber-deep whitespace-pre-wrap">
            {debugErrors.join("\n")}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <KpiCard label="Coletas (mês)" value={String(totalCollections)} hint={`${completedCollections} concluídas`} />
            <KpiCard label="Volume total" value={`${totalVolume.toLocaleString("pt-BR")} L`} />
            <KpiCard label="Clientes ativos" value={String(activeCompanies)} />
            <KpiCard
              label="Licenças vencendo"
              value={String(expiringLicenses)}
              hint="próx. 30 dias"
              accent={expiringLicenses > 0}
            />
          </div>

          <div className="bg-white border border-ink/10 p-6">
            <h2 className="font-mono text-[11.5px] uppercase tracking-[0.06em] text-steel mb-3">
              Tarefas BPO por departamento
            </h2>
            <div className="flex flex-wrap gap-2">
              {openBpoByDept.map((d) => (
                <span
                  key={d.department}
                  className="text-[12.5px] border border-ink/10 rounded-full px-3.5 py-1.5"
                >
                  {d.label} · {d.count}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
