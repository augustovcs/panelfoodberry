import "server-only";
import { NextResponse } from "next/server";
import { fixtureMenu, RESTAURANT } from "@/lib/menu/fixtures";
import type { DashboardStats, KitchenOrder, AdminMenu } from "./data";

/**
 * ⚠️ MODO DEMONSTRAÇÃO (MOCK) — REMOVER ANTES DE PRODUÇÃO.
 * ------------------------------------------------------------------
 * Ativado SÓ quando `DEMO_MODE=1`. Permite ver o painel (login/cozinha/cardápio)
 * sem Supabase: login com senha demo (sem 2FA) e dados fictícios.
 *
 * Para ir a produção: apague `DEMO_MODE` das envs, configure as envs reais do
 * Supabase/Resend e remova as ramificações `isDemoMode()` (ver memória do projeto
 * "anotabem-demo-mock" para a lista exata de pontos a limpar).
 */
function supabaseConfigured(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/**
 * Demo ligado quando: `DEMO_MODE=1` (forçar on) OU o Supabase ainda não está
 * configurado (caso Vercel sem envs). `DEMO_MODE=0` força off. Ao configurar o
 * Supabase real (produção), o demo se desliga sozinho → 2FA real assume.
 */
export function isDemoMode(): boolean {
  if (process.env.DEMO_MODE === "1") return true;
  if (process.env.DEMO_MODE === "0") return false;
  return !supabaseConfigured();
}

export const DEMO_USER = { userId: "demo-owner", email: "demo@anotabem.app" };
export const DEMO_PASSWORD = "demo1234";

/** Resposta padrão de mutação no modo demo (não grava nada). */
export function demoNoop() {
  return NextResponse.json({ ok: true, demo: true });
}

/* ── Dados fictícios ── */

const now = Date.now();
const day = (back: number) =>
  new Date(now - back * 86_400_000).toISOString().slice(0, 10);

const last14 = Array.from({ length: 14 }, (_, i) => {
  const net = 180 + Math.round(Math.abs(Math.sin(i + 1)) * 220) + i * 12;
  return {
    day: day(13 - i),
    net,
    orders: 6 + Math.round(net / 42),
  };
});

export const demoDashboard: DashboardStats = {
  configured: true,
  todayCount: 14,
  todayGross: 687.5,
  openOrders: 3,
  avgTicket: 687.5 / 14,
  cancelledToday: 1,
  deliveryCount: 9,
  pickupCount: 5,
  grossDelta: ((last14[13]!.net - last14[12]!.net) / last14[12]!.net) * 100,
  last14,
};

export const demoKitchen: KitchenOrder[] = [
  {
    code: "A7K2P",
    customerName: "João Silva",
    customerPhone: "5511987654321",
    status: "queue",
    deliveryType: "delivery",
    subtotal: 69.8,
    deliveryFee: 6.9,
    discount: 0,
    total: 76.7,
    couponCode: null,
    paymentMethod: "dinheiro",
    changeFor: 100,
    addressLine: "Rua das Acácias, 245 - Apto 52 — Jardim Paulista, São Paulo",
    notes: "Sem cebola",
    createdAt: new Date(now - 4 * 60000).toISOString(),
    items: [
      {
        name: "Smash Clássico",
        qty: 2,
        unitPrice: 34.9,
        options: [{ name: "Bacon crocante", price: 5 }],
        notes: "Capricha no bacon",
        lineTotal: 69.8,
      },
    ],
  },
  {
    code: "B3M9X",
    customerName: "Maria Oliveira",
    customerPhone: "5511991234567",
    status: "production",
    deliveryType: "pickup",
    subtotal: 61.9,
    deliveryFee: 0,
    discount: 8,
    total: 53.9,
    couponCode: "PRIMEIRA10",
    paymentMethod: "pix_entrega",
    changeFor: null,
    addressLine: null,
    notes: null,
    createdAt: new Date(now - 12 * 60000).toISOString(),
    items: [
      {
        name: "Margherita",
        qty: 1,
        unitPrice: 53.9,
        options: [{ name: "Borda recheada", price: 8 }],
        notes: "",
        lineTotal: 53.9,
      },
    ],
  },
  {
    code: "C8T4L",
    customerName: "Carlos Mendes",
    customerPhone: "5511996667788",
    status: "sent",
    deliveryType: "delivery",
    subtotal: 24.9,
    deliveryFee: 6.9,
    discount: 0,
    total: 31.8,
    couponCode: null,
    paymentMethod: "cartao_maquina",
    changeFor: null,
    addressLine: "Av. Brasil, 1200 — Centro, Campinas",
    notes: null,
    createdAt: new Date(now - 26 * 60000).toISOString(),
    items: [
      {
        name: "Dog Cheddar Bacon",
        qty: 1,
        unitPrice: 24.9,
        options: [],
        notes: "",
        lineTotal: 24.9,
      },
    ],
  },
];

export const demoAdminMenu: AdminMenu = {
  configured: true,
  categories: fixtureMenu.categories.map((c, ci) => ({
    id: `demo-cat-${ci}`,
    name: c.name,
    icon: c.icon,
    sort: ci,
    active: true,
    items: c.items.map((it, ii) => ({
      id: `demo-${it.id}`,
      name: it.name,
      description: it.description,
      type: "produto" as const,
      price: it.price,
      old_price: it.oldPrice ?? null,
      badge: it.badge ?? null,
      image_url: it.imageUrl ?? null,
      featured: it.featured,
      active: true,
      sort: ii,
      option_groups: it.optionGroups.map((g, gi) => ({
        id: `demo-${g.id}`,
        name: g.name,
        required: g.required,
        min_select: g.minSelect,
        max_select: g.maxSelect,
        sort: gi,
        options: g.options.map((o) => ({
          id: `demo-${o.id}`,
          name: o.name,
          price: o.price,
        })),
      })),
    })),
  })),
  settings: {
    name: RESTAURANT.name,
    is_open: RESTAURANT.isOpen,
    delivery_fee: RESTAURANT.deliveryFee,
    min_order: RESTAURANT.minOrder,
    delivery_time: RESTAURANT.deliveryTime,
    phone_whatsapp: RESTAURANT.whatsapp,
  },
  coupons: [
    {
      id: "demo-c1",
      code: "PRIMEIRA10",
      kind: "percent",
      value: 10,
      min_order: 30,
      active: true,
      scope: "order",
      target_item_ids: [],
    },
    {
      id: "demo-c2",
      code: "FRETEGRATIS",
      kind: "free_delivery",
      value: 0,
      min_order: 50,
      active: false,
      scope: "order",
      target_item_ids: [],
    },
    {
      // Cupom fixo (promoção automática) — % de desconto em combos/lanches específicos.
      id: "demo-c3",
      code: "SMASH-15OFF",
      kind: "percent",
      value: 15,
      min_order: 0,
      active: true,
      scope: "items",
      target_item_ids: ["demo-smash-classico", "demo-smash-duplo"],
    },
    {
      id: "demo-c4",
      code: "PIZZA-5REAIS",
      kind: "fixed",
      value: 5,
      min_order: 0,
      active: true,
      scope: "items",
      target_item_ids: ["demo-margherita", "demo-quatro-queijos"],
    },
  ],
};
