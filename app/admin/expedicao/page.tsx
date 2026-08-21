import { createClient } from "@/lib/supabase/server";
import { ExpedicaoPageClient } from "@/components/admin/ExpedicaoPageClient";

export default async function AdminExpedicaoPage() {
  const supabase = await createClient();

  const [destinatariosRes, expeditionsRes, expeditionLotsRes, lotsRes, vehiclesRes, driversRes] = await Promise.all([
    supabase
      .from("destinatarios")
      .select("id, cnpj, razao_social, nome_fantasia, authorization_number, authorization_expiry_date, address_cidade, address_uf, status")
      .order("razao_social"),
    supabase
      .from("expeditions")
      .select(
        "id, destinatario_id, vehicle_id, driver_id, expedition_date, total_volume_litros, status, notes, is_synthetic, receipt_document_id, receipt_document:documents!expeditions_receipt_document_id_fkey(document_number, verification_code, issue_date)"
      )
      .order("expedition_date", { ascending: false }),
    supabase
      .from("expedition_lots")
      .select("id, expedition_id, lot_id, volume_litros"),
    supabase
      .from("lots")
      .select("id, tank_id, code, quality_classification, volume_litros, status, tanks(code)")
      .order("code"),
    supabase.from("vehicles").select("id, plate").order("plate"),
    supabase.from("drivers").select("id, profiles(full_name)").eq("status", "active"),
  ]);

  const hasError = Boolean(
    destinatariosRes.error || expeditionsRes.error || expeditionLotsRes.error || lotsRes.error || vehiclesRes.error || driversRes.error
  );
  const debugErrors = [
    destinatariosRes.error,
    expeditionsRes.error,
    expeditionLotsRes.error,
    lotsRes.error,
    vehiclesRes.error,
    driversRes.error,
  ]
    .filter(Boolean)
    .map((e) => `${e!.code ?? "?"}: ${e!.message}`);
  if (hasError) console.error("[/admin/expedicao] query errors:", debugErrors);

  const allDestinatarios = destinatariosRes.data ?? [];
  const expeditions = expeditionsRes.data ?? [];
  const expeditionLots = expeditionLotsRes.data ?? [];
  const lots = lotsRes.data ?? [];
  const vehicles = vehiclesRes.data ?? [];
  const drivers = driversRes.data ?? [];

  const activeDestinatarios = allDestinatarios.filter((d) => d.status === "active");
  const openLots = lots.filter((l) => l.status === "open" && Number(l.volume_litros) > 0);

  const totalExpedited = expeditions
    .filter((e) => e.status !== "canceled")
    .reduce((sum, e) => sum + Number(e.total_volume_litros ?? 0), 0);
  const inTransit = expeditions.filter((e) => e.status === "in_transit").length;
  const awaitingReconciliation = expeditions.filter((e) => e.status === "delivered").length;

  if (hasError) {
    return (
      <div>
        <h1 className="font-display text-[28px] text-ink mb-6">Expedição</h1>
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
    <ExpedicaoPageClient
      destinatarios={activeDestinatarios}
      expeditions={expeditions}
      expeditionLots={expeditionLots}
      lots={lots}
      openLots={openLots}
      vehicles={vehicles}
      drivers={drivers}
      kpis={{
        totalExpedited: `${totalExpedited.toLocaleString("pt-BR")} L`,
        inTransit: String(inTransit),
        awaitingReconciliation: String(awaitingReconciliation),
        expeditionsCount: String(expeditions.length),
      }}
    />
  );
}
