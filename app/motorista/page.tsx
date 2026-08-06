import { createClient } from "@/lib/supabase/server";
import { TurnoBoard } from "@/components/motorista/TurnoBoard";
import { licenseStatus, LICENSE_STATUS_LABEL } from "@/lib/compliance/licenseStatus";

const STATUS_LABEL: Record<string, string> = {
  scheduled: "Agendada",
  in_progress: "Em andamento",
};

export default async function MotoristaPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="bg-white border border-ink/10 p-8 text-[15px] text-steel">
        Sessão expirada. Faça login novamente.
      </div>
    );
  }

  const driverRes = await supabase
    .from("drivers")
    .select("id, cnh_expiry, mopp_expiry, vehicle_id")
    .eq("profile_id", user.id)
    .single();

  if (!driverRes.data) {
    return (
      <div>
        <p className="eyebrow">Motorista</p>
        <h1 className="font-display text-[28px] text-ink mb-6">Rotas do dia</h1>
        <div className="bg-white border border-ink/10 p-8 text-[15px] text-steel">
          Seu usuário ainda não está vinculado a um cadastro de motorista. Fale com o administrador
          da MD Ambiental.
        </div>
      </div>
    );
  }

  const driver = driverRes.data;
  const cnhStatus = licenseStatus(driver.cnh_expiry);
  const moppStatus = licenseStatus(driver.mopp_expiry);
  const blocked = cnhStatus === "vencida" || moppStatus === "vencida";

  if (blocked) {
    return (
      <div>
        <p className="eyebrow">Motorista</p>
        <h1 className="font-display text-[28px] text-ink mb-6">Rotas do dia</h1>
        <div className="bg-white border-[1.5px] border-red-300 p-8">
          <p className="text-[15px] font-medium text-red-700 mb-2">
            Acesso bloqueado — documentação vencida
          </p>
          <p className="text-[13.5px] text-steel">
            {cnhStatus === "vencida" && "CNH vencida. "}
            {moppStatus === "vencida" && "MOPP vencido. "}
            Regularize com o administrador antes de abrir um novo turno.
          </p>
        </div>
      </div>
    );
  }

  const [vehiclesRes, shiftRes] = await Promise.all([
    supabase
      .from("vehicles")
      .select("id, plate, model, license_expiry_date, insurance_expiry_date")
      .eq("status", "active")
      .order("plate", { ascending: true }),
    supabase
      .from("vehicle_shifts")
      .select("id, start_time, start_km, vehicles(plate)")
      .eq("driver_id", driver.id)
      .is("end_time", null)
      .order("start_time", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const allVehicles = vehiclesRes.data ?? [];
  const availableVehicles = allVehicles.filter((v) => {
    const lic = licenseStatus(v.license_expiry_date);
    const ins = licenseStatus(v.insurance_expiry_date);
    return lic !== "vencida" && ins !== "vencida";
  });

  const openShift = shiftRes.data ?? null;

  let collections: {
    id: string;
    collection_date: string;
    volume_litros: number | null;
    status: string;
    notes: string | null;
    companies: { razao_social: string; address_bairro: string | null; address_cidade: string | null } | { razao_social: string; address_bairro: string | null; address_cidade: string | null }[] | null;
  }[] = [];

  if (openShift) {
    const collectionsRes = await supabase
      .from("collections")
      .select("id, collection_date, volume_litros, status, notes, companies(razao_social, address_bairro, address_cidade)")
      .eq("driver_id", driver.id)
      .in("status", ["scheduled", "in_progress"])
      .order("route_order", { ascending: true, nullsFirst: false })
      .order("collection_date", { ascending: true });
    collections = collectionsRes.data ?? [];
  }

  return (
    <div>
      <p className="eyebrow">Motorista</p>
      <h1 className="font-display text-[28px] text-ink mb-6">Rotas do dia</h1>

      {(cnhStatus === "vence_em_breve" || moppStatus === "vence_em_breve") && (
        <div className="bg-white border border-brand-amber/40 p-4 mb-6 text-[13px] text-brand-amber-deep">
          {cnhStatus === "vence_em_breve" && `CNH ${LICENSE_STATUS_LABEL[cnhStatus].toLowerCase()}. `}
          {moppStatus === "vence_em_breve" && `MOPP ${LICENSE_STATUS_LABEL[moppStatus].toLowerCase()}. `}
          Regularize em breve para não perder acesso.
        </div>
      )}

      <div className="mb-8">
        <TurnoBoard vehicles={availableVehicles} defaultVehicleId={driver.vehicle_id} shift={openShift} />
      </div>

      {openShift && (
        <section>
          <h2 className="font-mono text-[11.5px] uppercase tracking-[0.06em] text-steel mb-3">
            Coletas de hoje
          </h2>
          {collections.length === 0 ? (
            <div className="bg-white border border-ink/10 p-8 text-[15px] text-steel">
              Nenhuma coleta atribuída para este turno.
            </div>
          ) : (
            <div className="bg-white border border-ink/10 divide-y divide-ink/10">
              {collections.map((c) => {
                const company = Array.isArray(c.companies) ? c.companies[0] : c.companies;
                return (
                  <div key={c.id} className="p-4">
                    <div className="text-[14.5px] font-medium text-ink">{company?.razao_social ?? "Cliente"}</div>
                    <div className="text-[12.5px] text-steel mt-1">
                      {company?.address_bairro}, {company?.address_cidade}
                      {" · "}
                      {STATUS_LABEL[c.status] ?? c.status}
                    </div>
                    {c.notes && <div className="text-[12px] text-steel mt-1 italic">{c.notes}</div>}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
