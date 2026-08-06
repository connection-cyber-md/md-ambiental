import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/context";
import { AppShellNav } from "@/components/layout/AppShellNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await getAuthContext();
  if (!auth) redirect("/login?redirectTo=/admin");

  return (
    <div className="min-h-screen bg-paper">
      <AppShellNav
        title="Backoffice Administrativo"
        auth={auth}
        links={[
          { href: "/admin", label: "Visão geral" },
          { href: "/admin/bpo", label: "BPO" },
          { href: "/admin/compliance", label: "Conformidade" },
          { href: "/admin/dashboards", label: "Dashboards" },
          { href: "/admin/impacto", label: "Impacto" },
          { href: "/admin/documentos", label: "Documentos" },
        ]}
      />
      <main className="max-w-[1180px] mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
