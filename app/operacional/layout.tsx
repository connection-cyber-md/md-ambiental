import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/context";
import { AppShellNav } from "@/components/layout/AppShellNav";

export default async function OperacionalLayout({ children }: { children: React.ReactNode }) {
  const auth = await getAuthContext();
  if (!auth) redirect("/login?redirectTo=/operacional");

  return (
    <div className="min-h-screen bg-paper">
      <AppShellNav
        title="Painel Operacional"
        auth={auth}
        links={[
          { href: "/operacional", label: "Visão geral" },
          { href: "/operacional/rotas", label: "Rotas" },
          { href: "/operacional/frota", label: "Frota" },
        ]}
      />
      <main className="max-w-[1180px] mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
