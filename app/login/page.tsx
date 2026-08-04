import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { LogoMark } from "@/components/ui/LogoMark";

export const metadata: Metadata = {
  title: "Entrar",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; config?: string }>;
}) {
  const { redirectTo, config } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-6 py-16">
      <div className="w-full max-w-[400px]">
        <Link href="/" className="flex items-center gap-2.5 justify-center mb-10">
          <LogoMark />
          <span className="font-mono text-[13px] tracking-[0.08em] text-ink uppercase">MD Ambiental</span>
        </Link>

        {config === "missing" && (
          <div className="bg-amber-50 border border-brand-amber/40 text-[13.5px] text-brand-amber-deep px-4 py-3 mb-5">
            Este ambiente ainda não tem um projeto Supabase configurado
            (<code>.env.local</code>). Copie <code>.env.example</code> e preencha as
            credenciais para habilitar o login.
          </div>
        )}

        <div className="bg-white border border-ink/10 p-9">
          <h1 className="font-display text-[24px] text-ink mb-1.5">Acessar o sistema</h1>
          <p className="text-[14px] text-steel mb-7">
            Portal do Cliente, painel operacional, área do motorista e administração.
          </p>
          <LoginForm redirectTo={redirectTo} />
        </div>

        <Link href="/" className="block text-center text-[13.5px] text-steel mt-6 hover:text-ink">
          ← Voltar ao site institucional
        </Link>
      </div>
    </div>
  );
}
