import type {
  Menu,
  MenuCategory,
  MenuItem,
  MenuOption,
  PromoBanner,
  RestaurantInfo,
} from "./types";

/**
 * Cardápio de demonstração. Serve como (1) fallback quando o Supabase ainda não
 * está configurado e (2) fonte do seeder (`supabase/seed.ts`). Quando o banco
 * estiver populado, o repositório usa os dados reais. Ver ARCHITECTURE.md §8.
 */

const U = (id: string, w = 400) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;

// Fotos royalty-free do Pexels (image-resolver). Padrão 800px p/ itens.
const P = (id: number, w = 800) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

export const RESTAURANT: RestaurantInfo = {
  name: "Sabor & Arte",
  tagline: "Hambúrgueres artesanais, pizzas na pedra & mais",
  coverUrl: U("1504674900247-0877df9cc836", 1200),
  logoText: "S",
  rating: 4.8,
  reviews: 1247,
  deliveryTime: "30–45 min",
  distance: "2,4 km",
  minOrder: 20,
  deliveryFee: 6.9,
  isOpen: true,
  closesAt: "23:00",
  address: "Rua Augusta, 1402 — Consolação",
  categoriesLabel: "Lanches · Pizza · Brasileira",
  whatsapp: "5511999999999",
};

/**
 * Banners promocionais da loja (full-branded, criados no Canva).
 * A arte já traz título, subtítulo e botão; a UI só exibe a imagem.
 * `gradient` = cor sólida de fundo enquanto a imagem carrega.
 */
export const BANNERS: PromoBanner[] = [
  {
    id: "combo-casal",
    title: "Combo Casal — 2 smash + fritas + 2 bebidas",
    gradient: "#fa6e00",
    imageUrl: "/brand/banner-1.png",
  },
  {
    id: "frete-gratis",
    title: "Frete grátis em pedidos acima de R$ 50",
    gradient: "#1c262d",
    imageUrl: "/brand/banner-2.png",
  },
  {
    id: "cupom-boas-vindas",
    title: "Cupom de boas-vindas — 15% OFF na primeira compra",
    gradient: "#ec7708",
    imageUrl: "/brand/banner-3.png",
  },
  {
    id: "smash-dobro",
    title: "Smash em Dobro — 2ª unidade com 50% OFF",
    gradient: "#1f2937",
    imageUrl: "/brand/banner-4.png",
  },
];

interface RawItem {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  badge?: string;
  featured?: boolean;
  gradient: string;
  imageUrl?: string;
  extras?: MenuOption[];
}

interface RawCategory {
  id: string;
  name: string;
  icon: string;
  items: RawItem[];
}

const BURGER_EXTRAS: MenuOption[] = [
  { id: "bacon", name: "Bacon crocante", price: 5.0 },
  { id: "egg", name: "Ovo", price: 3.0 },
  { id: "extra-cheese", name: "Queijo extra", price: 4.0 },
  { id: "onion", name: "Cebola caramelizada", price: 3.5 },
];
const PIZZA_EXTRAS: MenuOption[] = [
  { id: "borda", name: "Borda recheada", price: 8.0 },
  { id: "catupiry", name: "Catupiry extra", price: 6.0 },
];
const DOG_EXTRAS: MenuOption[] = [
  { id: "salsicha", name: "Salsicha extra", price: 4.0 },
  { id: "cheddar-dog", name: "Cheddar cremoso", price: 3.5 },
];
const SIDE_EXTRAS: MenuOption[] = [
  { id: "molho", name: "Molho extra", price: 2.0 },
  { id: "cheddar-side", name: "Cheddar para mergulhar", price: 4.0 },
];

const RAW: RawCategory[] = [
  {
    id: "burgers",
    name: "Hambúrgueres",
    icon: "Beef",
    items: [
      {
        id: "smash-classico",
        name: "Smash Clássico",
        description:
          "Dois blends de 90g smash na chapa, queijo cheddar derretido, cebola caramelizada, picles e molho especial no pão brioche.",
        price: 29.9,
        oldPrice: 34.9,
        badge: "Mais pedido",
        featured: true,
        gradient: "linear-gradient(135deg, #d97706 0%, #92400e 100%)",
        imageUrl: P(3727243),
        extras: BURGER_EXTRAS,
      },
      {
        id: "smash-duplo",
        name: "Smash Duplo Cheddar",
        description:
          "Três blends de 90g, duplo cheddar, bacon crocante, alface americana e maionese da casa.",
        price: 36.9,
        featured: true,
        gradient: "linear-gradient(135deg, #b45309 0%, #78350f 100%)",
        imageUrl: P(15010309),
        extras: BURGER_EXTRAS,
      },
      {
        id: "burger-costela",
        name: "Burger Costela",
        description:
          "Blend de costela desfiada 180g, queijo provolone derretido, onion rings e barbecue defumado.",
        price: 39.9,
        gradient: "linear-gradient(135deg, #a16207 0%, #713f12 100%)",
        imageUrl: P(19798789),
        extras: BURGER_EXTRAS,
      },
      {
        id: "frango-crispy",
        name: "Frango Crispy",
        description:
          "Filé de frango empanado crocante, coleslaw, maionese de ervas e picles no pão de batata.",
        price: 27.9,
        gradient: "linear-gradient(135deg, #ca8a04 0%, #854d0e 100%)",
        imageUrl: P(34407059),
        extras: [BURGER_EXTRAS[0]!, BURGER_EXTRAS[2]!],
      },
    ],
  },
  {
    id: "pizzas",
    name: "Pizzas",
    icon: "Pizza",
    items: [
      {
        id: "margherita",
        name: "Margherita",
        description:
          "Molho San Marzano, mussarela de búfala, manjericão fresco e azeite extra virgem.",
        price: 45.9,
        featured: true,
        gradient: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
        imageUrl: P(31596394),
        extras: PIZZA_EXTRAS,
      },
      {
        id: "calabresa",
        name: "Calabresa",
        description:
          "Calabresa artesanal fatiada, cebola roxa, azeitonas pretas e orégano.",
        price: 42.9,
        gradient: "linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)",
        imageUrl: P(5903232),
        extras: PIZZA_EXTRAS,
      },
      {
        id: "quatro-queijos",
        name: "Quatro Queijos",
        description: "Mussarela, gorgonzola, parmesão e catupiry gratinado.",
        price: 49.9,
        gradient: "linear-gradient(135deg, #eab308 0%, #a16207 100%)",
        imageUrl: P(33458021),
        extras: PIZZA_EXTRAS,
      },
      {
        id: "portuguesa",
        name: "Portuguesa",
        description: "Presunto, ovo, cebola, azeitonas, ervilha e mussarela.",
        price: 47.9,
        gradient: "linear-gradient(135deg, #ea580c 0%, #9a3412 100%)",
        imageUrl: P(5640037),
        extras: PIZZA_EXTRAS,
      },
    ],
  },
  {
    id: "hotdogs",
    name: "Hot Dogs",
    icon: "Sandwich",
    items: [
      {
        id: "dog-tradicional",
        name: "Dog Tradicional",
        description:
          "Salsicha defumada, purê, milho, ervilha, batata palha e molhos.",
        price: 18.9,
        gradient: "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)",
        imageUrl: P(24870635),
        extras: DOG_EXTRAS,
      },
      {
        id: "dog-cheddar",
        name: "Dog Cheddar Bacon",
        description:
          "Salsicha dupla, cheddar cremoso, bacon crocante e cebola crispy.",
        price: 24.9,
        oldPrice: 28.9,
        badge: "Promo",
        featured: true,
        gradient: "linear-gradient(135deg, #d97706 0%, #92400e 100%)",
        imageUrl: P(36501077),
        extras: DOG_EXTRAS,
      },
      {
        id: "dog-calabresa",
        name: "Dog Calabresa",
        description:
          "Calabresa desfiada, vinagrete, mussarela gratinada e molho de pimenta.",
        price: 22.9,
        gradient: "linear-gradient(135deg, #c2410c 0%, #7c2d12 100%)",
        imageUrl: P(24870633),
        extras: DOG_EXTRAS,
      },
    ],
  },
  {
    id: "drinks",
    name: "Bebidas",
    icon: "GlassWater",
    items: [
      {
        id: "coca",
        name: "Coca-Cola 350ml",
        description: "Lata gelada.",
        price: 6.9,
        gradient: "linear-gradient(135deg, #991b1b 0%, #450a0a 100%)",
        imageUrl: P(9706990),
      },
      {
        id: "guarana",
        name: "Guaraná Antarctica 350ml",
        description: "Lata gelada.",
        price: 5.9,
        gradient: "linear-gradient(135deg, #15803d 0%, #14532d 100%)",
        imageUrl: P(32183186),
      },
      {
        id: "suco",
        name: "Suco Natural 500ml",
        description: "Laranja, limão, maracujá ou abacaxi. Feito na hora.",
        price: 12.9,
        gradient: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
        imageUrl: P(30900665),
      },
      {
        id: "agua",
        name: "Água Mineral 500ml",
        description: "Com ou sem gás.",
        price: 4.9,
        gradient: "linear-gradient(135deg, #0284c7 0%, #075985 100%)",
        imageUrl: P(35020123),
      },
    ],
  },
  {
    id: "desserts",
    name: "Sobremesas",
    icon: "CakeSlice",
    items: [
      {
        id: "brownie",
        name: "Brownie c/ Sorvete",
        description:
          "Brownie de chocolate belga com sorvete de creme e calda quente.",
        price: 19.9,
        gradient: "linear-gradient(135deg, #78350f 0%, #451a03 100%)",
        imageUrl: P(27359379),
        extras: [
          { id: "chantilly", name: "Chantilly extra", price: 3.0 },
          { id: "calda", name: "Calda de chocolate", price: 2.5 },
        ],
      },
      {
        id: "petit",
        name: "Petit Gâteau",
        description:
          "Bolinho com interior cremoso, acompanha sorvete de baunilha.",
        price: 22.9,
        gradient: "linear-gradient(135deg, #44403c 0%, #1c1917 100%)",
        imageUrl: P(27819685),
        extras: [{ id: "chantilly", name: "Chantilly extra", price: 3.0 }],
      },
      {
        id: "milkshake",
        name: "Milkshake 400ml",
        description: "Chocolate, morango ou Ovomaltine com chantilly.",
        price: 16.9,
        gradient: "linear-gradient(135deg, #be185d 0%, #831843 100%)",
        imageUrl: P(32469289),
        extras: [{ id: "chantilly", name: "Chantilly extra", price: 3.0 }],
      },
    ],
  },
  {
    id: "sides",
    name: "Porções",
    icon: "Drumstick",
    items: [
      {
        id: "batata",
        name: "Batata Frita",
        description:
          "Porção generosa de batata frita sequinha com sal e orégano.",
        price: 22.9,
        gradient: "linear-gradient(135deg, #eab308 0%, #a16207 100%)",
        imageUrl: P(5836772),
        extras: SIDE_EXTRAS,
      },
      {
        id: "onion-rings",
        name: "Onion Rings",
        description: "Anéis de cebola empanados crocantes com molho ranch.",
        price: 19.9,
        gradient: "linear-gradient(135deg, #ca8a04 0%, #854d0e 100%)",
        imageUrl: P(8880734),
        extras: SIDE_EXTRAS,
      },
      {
        id: "nuggets",
        name: "Nuggets (10un)",
        description:
          "Nuggets de frango artesanais crocantes com molho barbecue.",
        price: 24.9,
        gradient: "linear-gradient(135deg, #d97706 0%, #92400e 100%)",
        imageUrl: P(11710530),
        extras: SIDE_EXTRAS,
      },
    ],
  },
];

function toMenuItem(raw: RawItem): MenuItem {
  const extras = raw.extras ?? [];
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    price: raw.price,
    oldPrice: raw.oldPrice,
    badge: raw.badge,
    featured: raw.featured ?? false,
    gradient: raw.gradient,
    imageUrl: raw.imageUrl,
    optionGroups:
      extras.length > 0
        ? [
            {
              id: `${raw.id}-adicionais`,
              name: "Adicionais",
              required: false,
              minSelect: 0,
              maxSelect: extras.length,
              options: extras,
            },
          ]
        : [],
  };
}

const CATEGORIES: MenuCategory[] = RAW.map((cat) => ({
  id: cat.id,
  name: cat.name,
  icon: cat.icon,
  items: cat.items.map(toMenuItem),
}));

export const fixtureMenu: Menu = {
  restaurant: RESTAURANT,
  categories: CATEGORIES,
  banners: BANNERS,
};
