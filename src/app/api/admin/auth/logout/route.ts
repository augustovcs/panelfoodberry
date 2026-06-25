import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { clearAdmin2fa } from "@/lib/security/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const supabase = createServerSupabase();
  if (supabase) await supabase.auth.signOut();
  clearAdmin2fa();
  return NextResponse.json({ ok: true });
}
