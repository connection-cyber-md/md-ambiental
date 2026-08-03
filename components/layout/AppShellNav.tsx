import Image from "next/image";
import Link from "next/link";
import type { AuthContext } from "@/lib/auth/context";

const ROLE_LABEL: Record<string, string> = {
  system_admin: "System Admin",
  tenant_admin: "Administrador",
  tenant_operator: "Operador",
  tenant_driver: "Motorista",
  client: "Cliente",
};

export function AppShellNav({
  title,
  auth,
  links,
}: {
  title: string;
  auth: AuthContext;
  links: { href: string; label: string }[];
}) {
  return (
    <header className="bg-ink text-paper">
      <div className="max-w-[1180px] mx-auto px-6 py-4 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/brand/logo.png" alt="MD Ambiental" width={28} height={28} className="h-7 w-auto" />
          </Link>
          <span className="font-mono text-[12px] uppercase tracking-[0.08em] text-steel-light">{title}</span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-[14px] text-[#eef0e9] opacity-85 hover:opacity-100">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-[13px] text-white">{auth.email}</div>
            <div className="font-mono text-[11px] uppercase tracking-[0.05em] text-steel-light">
              {auth.role ? ROLE_LABEL[auth.role] : "—"}
            </div>
          </div>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="font-mono text-[11.5px] uppercase tracking-[0.05em] border border-white/25 px-3 py-2 hover:border-white"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
