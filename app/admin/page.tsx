import { createClient } from "@/lib/supabase/server";
import { VisaoGeralPageClient } from "@/components/admin/VisaoGeralPageClient";
import { DEPARTMENTS, DEPARTMENT_LABEL, isPriorityTask } from "@/lib/bpo/constants";
import { licenseStatus } from "@/lib/compliance/licenseStatus";
import Link from "next/link";

export default async function AdminPage() {
  const supabase = await createClient();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
  const today = now.toISOString().slice(0, 10);
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [collectionsRes, companiesRes, bpoRes, driversRes, vehiclesRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase.from("collections" as any)
      .select("id, status, volume_litros")
      .gte("collection_date", monthStart)
      .lt("collection_date", monthEnd),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase.from("companies" as any).select("id, status, license_expiry_date"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase.from("bpo_tasks" as any).select("id, department, title, status, due_date"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase.from("drivers" as any).select("id, status, cnh_expiry"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase.from("vehicles" as any).select("id, status, license_expiry_date, insurance_expiry_date"),
  ]);

  const hasError = Boolean(
    collectionsRes.error || companiesRes.error || bpoRes.error || driversRes.error || vehiclesRes.error
  );
  const debugErrors = [collectionsRes.error, companiesRes.error, bpoRes.error, driversRes.error, vehiclesRes.error]
    .filter(Boolean)
    .map((e) => `${e!.code ?? "?"}: ${e!.message}`);
  if (hasError) console.error("[/admin] query errors:", debugErrors);

  if (hasError) {
    return (
      <div>
        <h1 className="font-display text-[28px] text-ink mb-6">Visão geral</h1>
        <div className="bg-white border border-ink/10 p-8 text-[15px] text-steel">
          <p className="mb-2">Não foi possível carregar os dados agora. Tente recarregar a página.</p>
          <p className="font-mono text-[12px] text-brand-amber-deep whitespace-pre-wrap">
            {debugErrors.join("\n")}
          </p>
        </div>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const collections = (collectionsRes.data ?? []) as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const companies = (companiesRes.data ?? []) as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bpoTasks = (bpoRes.data ?? []) as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const drivers = (driversRes.data ?? []) as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vehicles = (vehiclesRes.data ?? []) as any[];

  const totalCollections = collections.length;
  const completedCollections = collections.filter((c) => c.status === "completed").length;
  const totalVolume = collections.reduce((sum, c) => sum + Number(c.volume_litros ?? 0), 0);

  const activeCompanies = companies.filter((c) => c.status === "active").length;
  const expiringLicenses = companies.filter(
    (c) => c.license_expiry_date && c.license_expiry_date >= today && c.license_expiry_date <= in30Days
  ).length;
  const companiesVencidas = companies.filter((c) => licenseStatus(c.license_expiry_date) === "vencida").length;

  const departments = DEPARTMENTS.map((dept) => {
    const deptTasks = bpoTasks.filter((t) => t.department === dept);
    return {
      department: dept,
      label: DEPARTMENT_LABEL[dept] ?? dept,
      total: deptTasks.filter((t) => t.status !== "done").length,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      priorityTasks: deptTasks.filter(isPriorityTask).map((t: any) => ({ id: t.id, title: t.title, due_date: t.due_date })),
    };
  });

  const driversAtivos = drivers.filter((d) => d.status === "active").length;
  const vehiclesAtivos = vehicles.filter((v) => v.status === "active").length;
  const alertasFrota =
    drivers.filter((d) => ["vencida", "vence_em_breve"].includes(licenseStatus(d.cnh_expiry))).length +
    vehicles.filter((v) => ["vencida", "vence_em_breve"].includes(licenseStatus(v.license_expiry_date))).length +
    vehicles.filter((v) => ["vencida", "vence_em_breve"].includes(licenseStatus(v.insurance_expiry_date))).length;

  return (
    <div>
      {/* Atalho / Card para o Manual de Instruções */}
      <div className="mb-8">
        <Link
          href="/admin/manual"
          className="bg-white p-6 rounded-lg border border-ink/10 hover:border-brand-green-deep transition-all shadow-xs group block"
        >
          <span className="font-mono text-[11px] uppercase text-brand-green-deep block mb-1">Documentação & Uso</span>
          <h3 className="font-display text-[18px] text-ink group-hover:text-brand-green-deep transition-colors mb-2">
            Manual de Instruções →
          </h3>
          <p className="text-[13px] text-steel">
            Consulte o guia operacional completo da plataforma e especificações arquiteturais.
          </p>
        </Link>
      </div>

      <VisaoGeralPageClient
        kpis={{ totalCollections, completedCollections, totalVolume, activeCompanies, expiringLicenses }}
        departments={departments}
        clientes={{ ativos: activeCompanies, vencidas: companiesVencidas }}
        frota={{ motoristas: driversAtivos, veiculos: vehiclesAtivos, alertas: alertasFrota }}
      />
    </div>
  );
}