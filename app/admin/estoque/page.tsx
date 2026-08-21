import { createClient } from "@/lib/supabase/server";
import { EstoquePageClient } from "@/components/admin/EstoquePageClient";

export default async function AdminEstoquePage() {
  const supabase = await createClient();

  const [basesRes, tanksRes, lotsRes, movementsRes] = await Promise.all([
    supabase.from("bases").select("id, name, address_cidade, address_uf, capacity_total_litros, is_active").order("name"),
    supabase
      .from("tanks")
      .select("id, base_id, code, capacity_litros, material_class, status")
      .order("code"),
    supabase
      .from("lots")
      .select("id, tank_id, code, quality_classification, volume_litros, status, opened_at, is_synthetic")
      .order("opened_at", { ascending: false }),
    supabase
      .from("stock_movements")
      .select("id, tank_id, lot_id, type, volume_litros, reason, created_at, is_synthetic")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const hasError = Boolean(basesRes.error || tanksRes.error || lotsRes.error || movementsRes.error);
  const debugErrors = [basesRes.error, tanksRes.error, lotsRes.error, movementsRes.error]
    .filter(Boolean)
    .map((e) => `${e!.code ?? "?"}: ${e!.message}`);
  if (hasError) console.error("[/admin/estoque] query errors:", debugErrors);

  const allBases = basesRes.data ?? [];
  const tanks = tanksRes.data ?? [];
  const lots = lotsRes.data ?? [];
  const movements = movementsRes.data ?? [];

  const activeBases = allBases.filter((b) => b.is_active);

  const totalCapacity = tanks.reduce((sum, t) => sum + Number(t.capacity_litros ?? 0), 0);
  const totalStock = lots
    .filter((l) => l.status === "open")
    .reduce((sum, l) => sum + Number(l.volume_litros ?? 0), 0);
  const openLots = lots.filter((l) => l.status === "open").length;
  const occupancyPct = totalCapacity > 0 ? Math.round((totalStock / totalCapacity) * 100) : 0;

  if (hasError) {
    return (
      <div>
        <h1 className="font-display text-[28px] text-ink mb-6">Estoque</h1>
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
    <EstoquePageClient
      bases={activeBases}
      tanks={tanks}
      lots={lots}
      movements={movements}
      kpis={{
        totalCapacity: `${totalCapacity.toLocaleString("pt-BR")} L`,
        totalStock: `${totalStock.toLocaleString("pt-BR")} L`,
        openLots: String(openLots),
        occupancyPct: `${occupancyPct}%`,
      }}
    />
  );
}
