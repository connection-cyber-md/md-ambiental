"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { signInAction, type LoginActionState } from "@/app/login/actions";

const initialState: LoginActionState = { error: null };

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction, isPending] = useActionState(signInAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="redirectTo" value={redirectTo ?? ""} />

      <div>
        <label htmlFor="email" className="block text-[13px] font-medium text-ink mb-1.5">
          E-mail
        </label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>

      <div>
        <label htmlFor="password" className="block text-[13px] font-medium text-ink mb-1.5">
          Senha
        </label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>

      {state.error && <p className="text-[13.5px] text-red-700">{state.error}</p>}

      <Button type="submit" disabled={isPending} className="justify-center w-full">
        {isPending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
