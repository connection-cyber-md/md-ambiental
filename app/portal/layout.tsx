import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/context";
import { AppShellNav } from "@/components/layout/AppShellNav";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const auth = await getAuthContext();
  if (!auth) redirect("/login?redirectTo=/portal");

  return (
    <div className="min-h-screen bg-paper">
      <AppShellNav
        title="Portal do Cliente"
        auth={auth}
        links={[
          { href: "/portal", label: "Dashboard" },
          { href: "/portal/coletas", label: "Coletas" },
          { href: "/portal/documentos", label: "Documentos" },
        ]}
      />
      <main className="max-w-[1180px] mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
