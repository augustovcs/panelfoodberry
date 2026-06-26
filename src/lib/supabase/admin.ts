import "server-only";
import { createClient } from "@supabase/supabase-js";
import { clientEnv } from "@/lib/env";
import { getServerEnv } from "@/lib/env.server";

/**
 * Cliente Supabase com a `service_role` — IGNORA RLS. Uso EXCLUSIVO no servidor,
 * após validação (Zod) e rate limit. Nunca importar em componentes client.
 * Ver ARCHITECTURE.md §7/§9.5.
 */
export function createAdminSupabase() {
  const url = clientEnv.NEXT_PUBLIC_SUPABASE_URL;
  const { SUPABASE_SERVICE_ROLE_KEY } = getServerEnv();

  if (!url || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Supabase admin não configurado (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).",
    );
  }

  return createClient(url, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
