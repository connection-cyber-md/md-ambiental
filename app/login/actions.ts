"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { decodeClaims, getRoleFromClaims } from "@/lib/auth/session";
import { ROLE_HOME } from "@/lib/auth/rbac";
import { loginSchema } from "@/schemas/auth.schema";

export type LoginActionState = { error: string | null };

export async function signInAction(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  let destination = "";

  try {
    const parsed = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

    // Blindagem de Nível 1: Erros tratados da API Auth do Supabase
    if (error || !data.session) {
      return { error: "E-mail ou senha incorretos." };
    }

    const rawRedirect = String(formData.get("redirectTo") ?? "");
    
    // Proteção contra Open-Redirect (mantido da versão original)
    const redirectTo = rawRedirect.startsWith("/") && !rawRedirect.startsWith("//") ? rawRedirect : "";
    const role = getRoleFromClaims(decodeClaims(data.session.access_token));
    
    destination = redirectTo || (role ? ROLE_HOME[role] : "/");

  } catch (err) {
    // Blindagem de Nível 2: Queda de servidor, Timeout ou Erro 500
    // Em produção, aqui entraria um registro silencioso: console.error("Login Crash:", err);
    return { error: "Serviço temporariamente indisponível. Tente novamente." };
  }

  // O redirecionamento DEVE ocorrer fora do try-catch para funcionar no Next.js
  redirect(destination);
}