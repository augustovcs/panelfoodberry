import "server-only";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAdminSupabase } from "@/lib/supabase/admin";
import { adminConfigured } from "./session";
import type { OrderItemSnapshot, OrderStatus, DeliveryType } from "@/lib/types";

export interface DashboardStats {
  configured: boolean;
  todayCount: number;
  todayGross: number;
  openOrders: number;
  last14: { day: string; net: number }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  if (!adminConfigured()) {
    return {
      configured: false,
      todayCount: 0,
      todayGross: 0,
      openOrders: 0,
      last14: [],
    };
  }
  const db = createAdminSupabase();
  const start = new Date().toISOString().slice(0, 10);

  const [{ data: todays }, openRes, { data: sales }] = await Promise.all([
    db
      .from("orders")
      .select("total")
      .gte("created_at", `${start}T00:00:00Z`)
      .neq("status", "cancelled"),
    db
      .from("orders")
      .select("*", { count: "exact", head: true })
      .not("status", "in", "(done,cancelled)"),
    db
      .from("daily_sales")
      .select("day,net")
      .order("day", { ascending: false })
      .limit(14),
  ]);

  return {
    configured: true,
    todayCount: todays?.length ?? 0,
    todayGross: (todays ?? []).reduce(
      (s: number, o: any) => s + Number(o.total),
      0,
    ),
    openOrders: openRes.count ?? 0,
    last14: (sales ?? [])
      .map((s: any) => ({ day: s.day, net: Number(s.net) }))
      .reverse(),
  };
}

export interface KitchenOrder {
  code: string;
  customerName: string;
  items: OrderItemSnapshot[];
  total: number;
  status: OrderStatus;
  deliveryType: DeliveryType;
  notes: string | null;
  createdAt: string;
}

export async function listKitchenOrders(): Promise<KitchenOrder[]> {
  if (!adminConfigured()) return [];
  const db = createAdminSupabase();
  const { data } = await db
    .from("orders")
    .select(
      "code,customer_name,items,total,status,delivery_type,notes,created_at",
    )
    .not("status", "in", "(done,cancelled)")
    .order("created_at");

  return (data ?? []).map((o: any) => ({
    code: o.code,
    customerName: o.customer_name,
    items: o.items,
    total: Number(o.total),
    status: o.status,
    deliveryType: o.delivery_type,
    notes: o.notes,
    createdAt: o.created_at,
  }));
}

export interface AdminMenu {
  configured: boolean;
  categories: any[];
  settings: any | null;
  coupons: any[];
}

export async function getAdminMenu(): Promise<AdminMenu> {
  if (!adminConfigured()) {
    return { configured: false, categories: [], settings: null, coupons: [] };
  }
  const db = createAdminSupabase();
  const [{ data: categories }, { data: settings }, { data: coupons }] =
    await Promise.all([
      db
        .from("categories")
        .select(
          "id,name,icon,sort,active, items:items(id,name,price,old_price,badge,featured,active,sort)",
        )
        .order("sort"),
      db.from("business_settings").select("*").eq("id", 1).maybeSingle(),
      db.from("coupons").select("*").order("created_at", { ascending: false }),
    ]);

  return {
    configured: true,
    categories: categories ?? [],
    settings,
    coupons: coupons ?? [],
  };
}
