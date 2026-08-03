import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/context";
import { AppShellNav } from "@/components/layout/AppShellNav";

export default async function MotoristaLayout({ children }: { children: React.ReactNode }) {
  const auth = await getAuthContext();
  if (!auth) redirect("/login?redirectTo=/motorista");

  return (
    <div className="min-h-screen bg-paper">
      <AppShellNav
        title="App do Motorista"
        auth={auth}
        links={[{ href: "/motorista", label: "Rotas do dia" }]}
      />
      <main className="max-w-[720px] mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
