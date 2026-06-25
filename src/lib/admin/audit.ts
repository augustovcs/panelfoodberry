import "server-only";
import { createAdminSupabase } from "@/lib/supabase/admin";

/** Registra uma ação sensível no audit_log (best-effort). */
export async function audit(
  actor: string,
  action: string,
  entity?: string,
  entityId?: string,
  meta?: unknown,
): Promise<void> {
  try {
    await createAdminSupabase()
      .from("audit_log")
      .insert({
        actor,
        action,
        entity,
        entity_id: entityId,
        meta: meta ?? null,
      });
  } catch (e) {
    console.error("[audit] falhou:", e);
  }
}
