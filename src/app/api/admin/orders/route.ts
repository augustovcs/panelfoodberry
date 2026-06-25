import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin/guard";
import { listKitchenOrders } from "@/lib/admin/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const a = await assertAdmin();
  if ("response" in a) return a.response;
  return NextResponse.json({ orders: await listKitchenOrders() });
}
