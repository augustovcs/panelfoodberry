import "server-only";
import { createServerSupabase } from "@/lib/supabase/server";
import type { CouponRule } from "@/lib/domain/coupon";
import type { CouponKind } from "@/lib/types";

interface ValidateCouponRow {
  code: string;
  kind: CouponKind;
  value: number;
  discount: number;
}

/**
 * Resolve um cupom via RPC `validate_coupon` (security definer). Retorna a regra
 * aplicável ou `null` se inválido / Supabase ausente. Não expõe a tabela coupons.
 */
export async function resolveCoupon(
  code: string,
  subtotal: number,
): Promise<CouponRule | null> {
  const supabase = createServerSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase.rpc("validate_coupon", {
    p_code: code,
    p_subtotal: subtotal,
  });
  if (error || !data || (data as ValidateCouponRow[]).length === 0) return null;

  const row = (data as ValidateCouponRow[])[0]!;
  return { kind: row.kind, value: Number(row.value) };
}
