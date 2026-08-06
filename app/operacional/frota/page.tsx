import { createClient } from "@/lib/supabase/server";
import { FrotaBoard } from "@/components/operacional/FrotaBoard";
import { licenseStatus, LICENSE_STATUS_LABEL, LICENSE_STATUS_CLASSES } from "@/lib/compliance/licenseStatus";

export default async function OperacionalFrotaPage() {
  const supabase = await createClient();

  const [vehiclesRes, driversRes, maintenanceRes] = await Promise.all([
    supabase
      .from("vehicles")
      .select("id, plate, model, license_expiry_date, insurance_expiry_date")
      .order("plate", { ascending: true }),
    supabase
      .from("drivers")
      .select("id, cnh_expiry, mopp_expiry, profiles(full_name)")
      .order("id", { ascending: true }),
    supabase
      .from("vehicle_maintenance")
      .select("id, vehicle_id, maintenance_type, description, cost, maintenance_date, vehicles(plate)")
      .order("maintenance_date", { ascending: false })
      .limit(20),
  ]);

  const hasError = Boolean(vehiclesRes.error || driversRes.error || maintenanceRes.error);
  const debugErrors = [vehiclesRes.error, driversRes.error, maintenanceRes.error]
    .filter(Boolean)
    .map((e) => `${e!.code ?? "?"}: ${e!.message}`);
  if (hasError) console.error("[/operacional/frota] query errors:", debugErrors);

  const vehicles = vehiclesRes.data ?? [];
  const drivers = driversRes.data ?? [];
  const maintenances = maintenanceRes.data ?? [];

  type Alert = { key: string; label: string; status: ReturnType<typeof licenseStatus> };
  const alerts: Alert[] = [];

  for (const v of vehicles) {
    const lic = licenseStatus(v.license_expiry_date);
    if (lic === "vencida" || lic === "vence_em_breve") {
      alerts.push({ key: `${v.id}-lic`, label: `Veículo ${v.plate} — licenciamento`, status: lic });
    }
    const ins = licenseStatus(v.insurance_expiry_date);
    if (ins === "vencida" || ins === "vence_em_breve") {
      alerts.push({ key: `${v.id}-ins`, label: `Veículo ${v.plate} — seguro`, status: ins });
    }
  }

  for (const d of drivers) {
    const profile = Array.isArray(d.profiles) ? d.profiles[0] : d.profiles;
    const name = profile?.full_name ?? "Motorista";
    const cnh = licenseStatus(d.cnh_expiry);
    if (cnh === "vencida" || cnh === "vence_em_breve") {
      alerts.push({ key: `${d.id}-cnh`, label: `${name} — CNH`, status: cnh });
    }
    const mopp = licenseStatus(d.mopp_expiry);
    if (mopp === "vencida" || mopp === "vence_em_breve") {
      alerts.push({ key: `${d.id}-mopp`, label: `${name} — MOPP`, status: mopp });
    }
  }

  return (
    <div>
      <p className="eyebrow">Painel Operacional</p>
      <h1 className="font-display text-[28px] text-ink mb-6">Frota e conformidade</h1>

      {hasError ? (
        <div className="bg-white border border-ink/10 p-8 text-[15px] text-steel mb-10">
          <p className="mb-2">Não foi possível carregar os dados de frota agora.</p>
          <p className="font-mono text-[12px] text-brand-amber-deep whitespace-pre-wrap">
            {debugErrors.join("\n")}
          </p>
        </div>
      ) : (
        <>
          <section className="mb-10">
            <h2 className="font-mono text-[11.5px] uppercase tracking-[0.06em] text-steel mb-3">
              Radar de vencimentos (30 dias)
            </h2>
            {alerts.length === 0 ? (
              <div className="bg-white border border-ink/10 p-6 text-[14px] text-brand-green-deep">
                Nenhum veículo ou motorista com vencimento próximo.
              </div>
            ) : (
              <div className="bg-white border border-ink/10 divide-y divide-ink/10">
                {alerts.map((a) => (
                  <div key={a.key} className="p-4 flex items-center justify-between gap-6 flex-wrap">
                    <span className="text-[14px] text-ink">{a.label}</span>
                    <span
                      className={`text-[11.5px] font-mono uppercase tracking-[0.04em] border rounded-full px-3 py-1 whitespace-nowrap ${LICENSE_STATUS_CLASSES[a.status]}`}
                    >
                      {LICENSE_STATUS_LABEL[a.status]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="font-mono text-[11.5px] uppercase tracking-[0.06em] text-steel mb-3">
              Manutenção e custos (TCO)
            </h2>
            <FrotaBoard vehicles={vehicles} maintenances={maintenances} />
          </section>
        </>
      )}
    </div>
  );
}
