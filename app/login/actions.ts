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
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.session) {
    return { error: "E-mail ou senha incorretos." };
  }

  const rawRedirect = String(formData.get("redirectTo") ?? "");
  // Only allow same-app relative paths — reject protocol-relative ("//evil.com")
  // or absolute URLs to prevent an open-redirect via the redirectTo param.
  const redirectTo = rawRedirect.startsWith("/") && !rawRedirect.startsWith("//") ? rawRedirect : "";
  const role = getRoleFromClaims(decodeClaims(data.session.access_token));
  const destination = redirectTo || (role ? ROLE_HOME[role] : "/");

  redirect(destination);
}
