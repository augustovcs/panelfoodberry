/**
 * Seeder idempotente — popula o Supabase a partir dos fixtures do cardápio
 * (fonte única, ver src/lib/menu/fixtures.ts). Aplique antes as migrations.
 *
 * Uso:
 *   1. Exporte NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente
 *      (ou use `node --env-file=.env`).
 *   2. `npm run db:seed`
 *
 * Ver supabase/README.md.
 */
import { createClient } from "@supabase/supabase-js";
import { fixtureMenu, RESTAURANT } from "../src/lib/menu/fixtures";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY antes de rodar o seed.",
  );
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  console.log("→ business_settings");
  const { error: sErr } = await db.from("business_settings").upsert({
    id: 1,
    name: RESTAURANT.name,
    tagline: RESTAURANT.tagline,
    cover_url: RESTAURANT.coverUrl,
    phone_whatsapp: RESTAURANT.whatsapp,
    address: RESTAURANT.address,
    categories_label: RESTAURANT.categoriesLabel,
    rating: RESTAURANT.rating,
    reviews: RESTAURANT.reviews,
    delivery_time: RESTAURANT.deliveryTime,
    distance: RESTAURANT.distance,
    min_order: RESTAURANT.minOrder,
    delivery_fee: RESTAURANT.deliveryFee,
    is_open: RESTAURANT.isOpen,
    closes_at: RESTAURANT.closesAt,
  });
  if (sErr) throw sErr;

  // Limpa o cardápio (cascade remove items/groups/options) — torna o seed idempotente.
  console.log("→ limpando cardápio anterior");
  await db
    .from("categories")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  for (const [ci, cat] of fixtureMenu.categories.entries()) {
    const { data: c, error: cErr } = await db
      .from("categories")
      .insert({ name: cat.name, icon: cat.icon, sort: ci })
      .select("id")
      .single();
    if (cErr || !c) throw cErr ?? new Error("categoria não criada");
    console.log(`→ ${cat.name}`);

    for (const [ii, item] of cat.items.entries()) {
      const { data: it, error: iErr } = await db
        .from("items")
        .insert({
          category_id: c.id,
          name: item.name,
          description: item.description,
          price: item.price,
          old_price: item.oldPrice ?? null,
          badge: item.badge ?? null,
          featured: item.featured,
          gradient: item.gradient,
          image_url: item.imageUrl ?? null,
          sort: ii,
        })
        .select("id")
        .single();
      if (iErr || !it) throw iErr ?? new Error("item não criado");

      for (const [gi, group] of item.optionGroups.entries()) {
        const { data: g, error: gErr } = await db
          .from("option_groups")
          .insert({
            item_id: it.id,
            name: group.name,
            required: group.required,
            min_select: group.minSelect,
            max_select: group.maxSelect,
            sort: gi,
          })
          .select("id")
          .single();
        if (gErr || !g) throw gErr ?? new Error("grupo não criado");

        if (group.options.length > 0) {
          const { error: oErr } = await db.from("options").insert(
            group.options.map((o, oi) => ({
              group_id: g.id,
              name: o.name,
              price: o.price,
              sort: oi,
            })),
          );
          if (oErr) throw oErr;
        }
      }
    }
  }

  console.log("✅ Seed concluído.");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("❌ Seed falhou:", e);
    process.exit(1);
  });
