import "server-only";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { readAdmin2fa } from "@/lib/security/session";
import { clientEnv } from "@/lib/env";
import { isDemoMode, DEMO_USER } from "./demo"; // ⚠️ DEMO — remover em produção

export interface AdminSession {
  userId: string;
  email: string;
}

/** Auth admin só funciona com Supabase + service_role configurados. */
export function adminConfigured(): boolean {
  return (
    !!clientEnv.NEXT_PUBLIC_SUPABASE_URL &&
    !!clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/**
 * Sessão admin válida = sessão Supabase (senha) **e** cookie 2FA aprovado para o
 * mesmo usuário. Sem os dois, retorna null. Ver ARCHITECTURE.md §9.1.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  // ⚠️ DEMO — remover em produção: sessão fictícia sem Supabase.
  if (isDemoMode()) {
    const twofa = readAdmin2fa();
    return twofa?.userId === DEMO_USER.userId ? { ...DEMO_USER } : null;
  }

  const supabase = createServerSupabase();
  if (!supabase) return null;

  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;

  const twofa = readAdmin2fa();
  if (!twofa || twofa.userId !== data.user.id) return null;

  return { userId: data.user.id, email: data.user.email ?? "" };
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/login");
  return session;
}
