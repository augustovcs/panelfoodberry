import "server-only";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAdminSupabase } from "@/lib/supabase/admin";
import { adminConfigured } from "./session";
import type {
  OrderItemSnapshot,
  OrderStatus,
  DeliveryType,
  PaymentMethod,
} from "@/lib/types";
import { formatAddress } from "@/lib/validators/address";
// ⚠️ DEMO — remover em produção
import { isDemoMode, demoDashboard, demoKitchen, demoAdminMenu } from "./demo";

export interface DashboardStats {
  configured: boolean;
  todayCount: number;
  todayGross: number;
  openOrders: number;
  avgTicket: number;
  cancelledToday: number;
  deliveryCount: number;
  pickupCount: number;
  /** Variação % do faturamento líquido vs. o dia anterior (null se sem base). */
  grossDelta: number | null;
  last14: { day: string; net: number; orders: number }[];
}

const EMPTY_STATS: DashboardStats = {
  configured: false,
  todayCount: 0,
  todayGross: 0,
  openOrders: 0,
  avgTicket: 0,
  cancelledToday: 0,
  deliveryCount: 0,
  pickupCount: 0,
  grossDelta: null,
  last14: [],
};

export async function getDashboardStats(): Promise<DashboardStats> {
  if (isDemoMode()) return demoDashboard; // ⚠️ DEMO — remover em produção
  if (!adminConfigured()) return EMPTY_STATS;
  const db = createAdminSupabase();
  const start = new Date().toISOString().slice(0, 10);

  const [{ data: todays }, openRes, { data: sales }] = await Promise.all([
    db
      .from("orders")
      .select("total,status,delivery_type")
      .gte("created_at", `${start}T00:00:00Z`),
    db
      .from("orders")
      .select("*", { count: "exact", head: true })
      .not("status", "in", "(done,cancelled)"),
    db
      .from("daily_sales")
      .select("day,net,orders")
      .order("day", { ascending: false })
      .limit(14),
  ]);

  const rows = todays ?? [];
  const valid = rows.filter((o: any) => o.status !== "cancelled");
  const todayGross = valid.reduce(
    (s: number, o: any) => s + Number(o.total),
    0,
  );
  const todayCount = valid.length;
  const last14 = (sales ?? [])
    .map((s: any) => ({
      day: s.day,
      net: Number(s.net),
      orders: Number(s.orders ?? 0),
    }))
    .reverse();

  const prev = last14.length >= 2 ? last14[last14.length - 2]!.net : 0;
  const curr = last14.length >= 1 ? last14[last14.length - 1]!.net : 0;

  return {
    configured: true,
    todayCount,
    todayGross,
    openOrders: openRes.count ?? 0,
    avgTicket: todayCount ? todayGross / todayCount : 0,
    cancelledToday: rows.filter((o: any) => o.status === "cancelled").length,
    deliveryCount: valid.filter((o: any) => o.delivery_type === "delivery")
      .length,
    pickupCount: valid.filter((o: any) => o.delivery_type === "pickup").length,
    grossDelta: prev > 0 ? ((curr - prev) / prev) * 100 : null,
    last14,
  };
}

export interface KitchenOrder {
  code: string;
  customerName: string;
  customerPhone: string | null;
  items: OrderItemSnapshot[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  couponCode: string | null;
  paymentMethod: PaymentMethod | null;
  changeFor: number | null;
  addressLine: string | null;
  status: OrderStatus;
  deliveryType: DeliveryType;
  notes: string | null;
  createdAt: string;
}

export async function listKitchenOrders(): Promise<KitchenOrder[]> {
  if (isDemoMode()) return demoKitchen; // ⚠️ DEMO — remover em produção
  if (!adminConfigured()) return [];
  const db = createAdminSupabase();
  const { data } = await db
    .from("orders")
    .select(
      "code,customer_name,customer_phone,items,subtotal,delivery_fee,discount,total,coupon_code,payment_method,change_for,address,status,delivery_type,notes,created_at",
    )
    .not("status", "in", "(done,cancelled)")
    .order("created_at");

  return (data ?? []).map((o: any) => ({
    code: o.code,
    customerName: o.customer_name,
    customerPhone: o.customer_phone ?? null,
    items: o.items,
    subtotal: Number(o.subtotal ?? 0),
    deliveryFee: Number(o.delivery_fee ?? 0),
    discount: Number(o.discount ?? 0),
    total: Number(o.total),
    couponCode: o.coupon_code ?? null,
    paymentMethod: o.payment_method ?? null,
    changeFor: o.change_for != null ? Number(o.change_for) : null,
    addressLine: o.address ? formatAddress(o.address) : null,
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
  if (isDemoMode()) return demoAdminMenu; // ⚠️ DEMO — remover em produção
  if (!adminConfigured()) {
    return { configured: false, categories: [], settings: null, coupons: [] };
  }
  const db = createAdminSupabase();
  const [{ data: categories }, { data: settings }, { data: coupons }] =
    await Promise.all([
      db
        .from("categories")
        .select(
          "id,name,icon,sort,active, items:items(id,name,description,type,price,old_price,badge,image_url,featured,active,sort, option_groups:option_groups(id,name,required,min_select,max_select,sort, options:options(id,name,price,sort)))",
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
