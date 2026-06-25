import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { clientEnv } from "@/lib/env";

/**
 * Cliente Supabase server-side (RSC / Route Handlers) com o `anon key`.
 * Sujeito a RLS — só lê o cardápio público. Retorna `null` quando o Supabase
 * ainda não está configurado, permitindo fallback (ver `@/lib/menu/repository`).
 */
export function createServerSupabase() {
  const url = clientEnv.NEXT_PUBLIC_SUPABASE_URL;
  const key = clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const cookieStore = cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // `setAll` chamado de um Server Component (cookies read-only).
          // O middleware cuida de renovar a sessão — pode ignorar aqui.
        }
      },
    },
  });
}
