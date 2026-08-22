import { createClient } from "@/lib/supabase/server";

const STATUS_LABEL: Record<string, string> = {
  scheduled: "Agendada",
  in_progress: "Em andamento",
  completed: "Concluída",
  canceled: "Cancelada",
};

const STATUS_CLASSES: Record<string, string> = {
  scheduled: "text-steel border-ink/15",
  in_progress: "text-brand-amber-deep border-brand-amber/40",
  completed: "text-brand-green-deep border-brand-green/40",
  canceled: "text-red-700 border-red-300",
};

export default async function PortalColetasPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profileRes = user
    ? await supabase.from("profiles").select("company_id").eq("id", user.id).single()
    : { data: null, error: null };

  const companyId = profileRes.data?.company_id ?? null;

  if (!companyId) {
    return (
      <div>
        <p className="eyebrow">Portal do Cliente</p>
        <h1 className="font-display text-[28px] text-ink mb-6">Coletas</h1>
        <div className="bg-white border border-ink/10 p-8 text-[15px] text-steel">
          Seu usuário ainda não está vinculado a uma empresa.
        </div>
      </div>
    );
  }

  const collectionsRes = await supabase
    .from("collections")
    .select("id, collection_date, volume_litros, status, notes")
    .eq("company_id", companyId)
    .order("collection_date", { ascending: false });

  const collections = collectionsRes.data ?? [];

  return (
    <div>
      <p className="eyebrow">Portal do Cliente</p>
      <h1 className="font-display text-[28px] text-ink mb-6">Coletas</h1>

      {collectionsRes.error ? (
        <div className="bg-white border border-ink/10 p-8 text-[15px] text-steel">
          <p className="mb-2">Não foi possível carregar as coletas agora. Tente recarregar a página.</p>
          {/* Erro técnico sanitizado para conformidade corporativa enterprise */}
          <p className="font-mono text-[12px] text-brand-amber-deep">
            Erro interno de sincronização de dados.
          </p>
        </div>
      ) : collections.length === 0 ? (
        <div className="bg-white border border-ink/10 p-8 text-[15px] text-steel">
          Nenhuma coleta registrada ainda.
        </div>
      ) : (
        <div className="bg-white border border-ink/10 divide-y divide-ink/10">
          {collections.map((c) => (
            <div key={c.id} className="p-4 flex items-center justify-between gap-6 flex-wrap">
              <div>
                <div className="text-[14.5px] font-medium text-ink">
                  {new Date(c.collection_date).toLocaleDateString("pt-BR")}
                  {c.volume_litros != null && ` · ${c.volume_litros.toLocaleString("pt-BR")} L`}
                </div>
                {c.notes && <div className="text-[13px] text-steel mt-1">{c.notes}</div>}
              </div>
              <span
                className={`text-[11.5px] font-mono uppercase tracking-[0.04em] border rounded-full px-3 py-1 whitespace-nowrap ${
                  STATUS_CLASSES[c.status] ?? "text-steel border-ink/15"
                }`}
              >
                {STATUS_LABEL[c.status] ?? c.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}