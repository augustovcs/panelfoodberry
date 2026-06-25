import { NextResponse } from "next/server";

// Health check usado pelo cron diário (anti-pausa do Supabase) e por monitoramento.
// Na Fase 1 passa a tocar o banco (SELECT 1) para manter o projeto ativo. Ver ARCHITECTURE §8.
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ status: "ok", ts: new Date().toISOString() });
}
