/**
 * Fails fast with a clear message if required env vars are missing,
 * instead of letting a build/dev run limp along and fail deep inside
 * Supabase client construction. Run manually or wire into `predev`/`prebuild`.
 */
const REQUIRED = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"];

const missing = REQUIRED.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(
    `Variáveis de ambiente ausentes: ${missing.join(", ")}\n` +
      "Copie .env.example para .env.local e preencha com um projeto Supabase real."
  );
  process.exit(1);
}

console.log("Env OK.");
