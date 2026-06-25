"use client";
import { createBrowserClient } from "@supabase/ssr";
import { clientEnv } from "@/lib/env";

/**
 * Cliente Supabase para o browser (`anon key`). Sujeito a RLS.
 * Retorna `null` quando o Supabase ainda não está configurado.
 */
export function createBrowserSupabase() {
  const url = clientEnv.NEXT_PUBLIC_SUPABASE_URL;
  const key = clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createBrowserClient(url, key);
}
