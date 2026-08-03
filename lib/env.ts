import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
});

const serverEnvSchema = clientEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
});

/**
 * Client-safe env — only NEXT_PUBLIC_* values. Safe to call from client
 * components. Lazy on purpose: this project ships before any real Supabase
 * project is linked (see Phase 1 plan), so validation only happens when a
 * Supabase client is actually constructed (login submit, a protected route
 * request) — not at module-import time, which would otherwise break
 * `npm run dev`/`npm run build` for every page for lack of a .env.local.
 */
export function getClientEnv() {
  return clientEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  });
}

/**
 * Server-only env, includes the service-role key. Never import this from a
 * client component — Next.js will inline the value into the client bundle if you do.
 */
export function getServerEnv() {
  return serverEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
}
