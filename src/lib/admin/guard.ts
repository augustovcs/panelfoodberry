import "server-only";
import { NextResponse } from "next/server";
import { getAdminSession, type AdminSession } from "./session";

/**
 * Gate de rota admin. Retorna a sessão ou uma resposta 401 pronta.
 * Uso: `const a = await assertAdmin(); if ("response" in a) return a.response;`
 */
export async function assertAdmin(): Promise<
  { session: AdminSession } | { response: NextResponse }
> {
  const session = await getAdminSession();
  if (!session) {
    return {
      response: NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
    };
  }
  return { session };
}
