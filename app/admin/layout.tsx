import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/context";
import { AppShellNav } from "@/components/layout/AppShellNav";
import { SyntheticBanner } from "@/components/ui/SyntheticBanner";
import { createClient } from "@/lib/supabase/server";
import { getSyntheticTotal } from "@/lib/synthetic/getSyntheticTotal";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await getAuthContext();
  if (!auth) redirect("/login?redirectTo=/admin");

  const supabase = await createClient();
  const syntheticTotal = await getSyntheticTotal(supabase);

  return (
    <div className="min-h-screen bg-paper">
      <AppShellNav
        title="Backoffice Administrativo"
        auth={auth}
        links={[
          { href: "/admin", label: "Visão geral" },
          { href: "/admin/financeiro", label: "Financeiro" },
          { href: "/admin/bpo", label: "BPO" },
          { href: "/admin/compliance", label: "Conformidade" },
          { href: "/admin/dashboards", label: "Dashboards" },
          { href: "/admin/impacto", label: "Impacto" },
          { href: "/admin/documentos", label: "Documentos" },
        ]}
      />
      <SyntheticBanner total={syntheticTotal} />
      <main className="max-w-[1180px] mx-auto px-6 pt-6 pb-16">{children}</main>
    </div>
  );
}
