import "server-only";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Menu, MenuCategory, RestaurantInfo } from "./types";
import { fixtureMenu, BANNERS } from "./fixtures";

/**
 * Carrega o cardápio. Usa o Supabase quando configurado e populado; caso
 * contrário cai no cardápio de demonstração (`fixtureMenu`). Assim o storefront
 * funciona em dev antes do banco existir e degrada com segurança em produção.
 */
export async function getMenu(): Promise<Menu> {
  const supabase = createServerSupabase();
  if (!supabase) return fixtureMenu;

  try {
    const [{ data: settings }, { data: categories }] = await Promise.all([
      supabase.from("business_settings").select("*").eq("id", 1).maybeSingle(),
      supabase
        .from("categories")
        .select(
          `id, name, icon, sort,
           items:items ( id, name, description, price, old_price, badge, featured,
             gradient, image_url, sort, active,
             option_groups:option_groups ( id, name, required, min_select, max_select, sort,
               options:options ( id, name, price, active, sort ) ) )`,
        )
        .eq("active", true)
        .order("sort"),
    ]);

    if (!settings || !categories || categories.length === 0) {
      return fixtureMenu;
    }

    return {
      restaurant: mapRestaurant(settings),
      categories: categories.map(mapCategory),
      // Banners ainda não têm tabela própria; usa os da loja (mock) até existir.
      banners: BANNERS,
    };
  } catch {
    // Falha de rede/credenciais não pode derrubar o cardápio.
    return fixtureMenu;
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapRestaurant(s: any): RestaurantInfo {
  return {
    name: s.name,
    tagline: s.tagline ?? "",
    coverUrl: s.cover_url ?? "",
    logoText: (s.name?.[0] ?? "•").toUpperCase(),
    rating: Number(s.rating ?? 0),
    reviews: s.reviews ?? 0,
    deliveryTime: s.delivery_time ?? "",
    distance: s.distance ?? "",
    minOrder: Number(s.min_order ?? 0),
    deliveryFee: Number(s.delivery_fee ?? 0),
    isOpen: !!s.is_open,
    closesAt: s.closes_at ?? "",
    address: s.address ?? "",
    categoriesLabel: s.categories_label ?? "",
    whatsapp: s.phone_whatsapp ?? "",
  };
}

function mapCategory(c: any): MenuCategory {
  const items = (c.items ?? [])
    .filter((i: any) => i.active)
    .sort((a: any, b: any) => a.sort - b.sort)
    .map((i: any) => ({
      id: i.id,
      name: i.name,
      description: i.description ?? "",
      price: Number(i.price),
      oldPrice: i.old_price != null ? Number(i.old_price) : undefined,
      badge: i.badge ?? undefined,
      featured: !!i.featured,
      gradient: i.gradient ?? "linear-gradient(135deg,#d97706,#92400e)",
      imageUrl: i.image_url ?? undefined,
      optionGroups: (i.option_groups ?? [])
        .sort((a: any, b: any) => a.sort - b.sort)
        .map((g: any) => ({
          id: g.id,
          name: g.name,
          required: !!g.required,
          minSelect: g.min_select ?? 0,
          maxSelect: g.max_select ?? 1,
          options: (g.options ?? [])
            .filter((o: any) => o.active)
            .sort((a: any, b: any) => a.sort - b.sort)
            .map((o: any) => ({
              id: o.id,
              name: o.name,
              price: Number(o.price),
            })),
        })),
    }));

  return { id: c.id, name: c.name, icon: c.icon, items };
}
