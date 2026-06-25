import {
  Beef,
  Pizza,
  Sandwich,
  GlassWater,
  CakeSlice,
  Drumstick,
} from "lucide-react";
import type { Category, Restaurant } from "./types";

export const DELIVERY_FEE = 6.9;

const U = (id: string, w = 400) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;

export const RESTAURANT: Restaurant = {
  name: "Sabor & Arte",
  tagline: "Hambúrgueres artesanais, pizzas na pedra & mais",
  cover: U("1504674900247-0877df9cc836", 1200),
  rating: 4.8,
  reviews: 1247,
  deliveryTime: "30–45 min",
  distance: "2,4 km",
  minOrder: 20,
  isOpen: true,
  closesAt: "23:00",
  address: "Rua Augusta, 1402 — Consolação",
  categories: "Lanches · Pizza · Brasileira",
};

export const CATEGORIES: Category[] = [
  {
    id: "burgers",
    name: "Hambúrgueres",
    icon: Beef,
    items: [
      {
        id: "smash-classico",
        name: "Smash Clássico",
        description:
          "Dois blends de 90g smash na chapa, queijo cheddar derretido, cebola caramelizada, picles e molho especial no pão brioche.",
        price: 29.9,
        image: "linear-gradient(135deg, #d97706 0%, #92400e 100%)",
        img: U("1568901346375-23c9450c58cd"),
        badge: "Mais pedido",
        featured: true,
        oldPrice: 34.9,
        extras: [
          { id: "bacon", name: "Bacon crocante", price: 5.0 },
          { id: "egg", name: "Ovo", price: 3.0 },
          { id: "extra-cheese", name: "Queijo extra", price: 4.0 },
          { id: "onion", name: "Cebola caramelizada", price: 3.5 },
        ],
      },
      {
        id: "smash-duplo",
        name: "Smash Duplo Cheddar",
        description:
          "Três blends de 90g, duplo cheddar, bacon crocante, alface americana e maionese da casa.",
        price: 36.9,
        image: "linear-gradient(135deg, #b45309 0%, #78350f 100%)",
        img: U("1553979459-d2229ba7433b"),
        featured: true,
        extras: [
          { id: "bacon", name: "Bacon crocante", price: 5.0 },
          { id: "egg", name: "Ovo", price: 3.0 },
          { id: "extra-cheese", name: "Queijo extra", price: 4.0 },
          { id: "onion", name: "Cebola caramelizada", price: 3.5 },
        ],
      },
      {
        id: "burger-costela",
        name: "Burger Costela",
        description:
          "Blend de costela desfiada 180g, queijo provolone derretido, onion rings e barbecue defumado.",
        price: 39.9,
        image: "linear-gradient(135deg, #a16207 0%, #713f12 100%)",
        img: U("1572802419224-296b0aeee0d9"),
        extras: [
          { id: "bacon", name: "Bacon crocante", price: 5.0 },
          { id: "egg", name: "Ovo", price: 3.0 },
          { id: "extra-cheese", name: "Queijo extra", price: 4.0 },
          { id: "onion", name: "Cebola caramelizada", price: 3.5 },
        ],
      },
      {
        id: "frango-crispy",
        name: "Frango Crispy",
        description:
          "Filé de frango empanado crocante, coleslaw, maionese de ervas e picles no pão de batata.",
        price: 27.9,
        image: "linear-gradient(135deg, #ca8a04 0%, #854d0e 100%)",
        img: U("1606755962773-d324e0a13086"),
        extras: [
          { id: "bacon", name: "Bacon crocante", price: 5.0 },
          { id: "extra-cheese", name: "Queijo extra", price: 4.0 },
        ],
      },
    ],
  },
  {
    id: "pizzas",
    name: "Pizzas",
    icon: Pizza,
    items: [
      {
        id: "margherita",
        name: "Margherita",
        description:
          "Molho San Marzano, mussarela de búfala, manjericão fresco e azeite extra virgem.",
        price: 45.9,
        image: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
        img: U("1574071318508-1cdbab80d002"),
        featured: true,
        extras: [
          { id: "borda", name: "Borda recheada", price: 8.0 },
          { id: "catupiry", name: "Catupiry extra", price: 6.0 },
        ],
      },
      {
        id: "calabresa",
        name: "Calabresa",
        description:
          "Calabresa artesanal fatiada, cebola roxa, azeitonas pretas e orégano.",
        price: 42.9,
        image: "linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)",
        img: U("1513104890138-7c749659a591"),
        extras: [
          { id: "borda", name: "Borda recheada", price: 8.0 },
          { id: "catupiry", name: "Catupiry extra", price: 6.0 },
        ],
      },
      {
        id: "quatro-queijos",
        name: "Quatro Queijos",
        description: "Mussarela, gorgonzola, parmesão e catupiry gratinado.",
        price: 49.9,
        image: "linear-gradient(135deg, #eab308 0%, #a16207 100%)",
        img: U("1593560708920-61dd98c46a4e"),
        extras: [
          { id: "borda", name: "Borda recheada", price: 8.0 },
          { id: "catupiry", name: "Catupiry extra", price: 6.0 },
        ],
      },
      {
        id: "portuguesa",
        name: "Portuguesa",
        description: "Presunto, ovo, cebola, azeitonas, ervilha e mussarela.",
        price: 47.9,
        image: "linear-gradient(135deg, #ea580c 0%, #9a3412 100%)",
        img: U("1565299624946-b28f40a0ae38"),
        extras: [
          { id: "borda", name: "Borda recheada", price: 8.0 },
          { id: "catupiry", name: "Catupiry extra", price: 6.0 },
        ],
      },
    ],
  },
  {
    id: "hotdogs",
    name: "Hot Dogs",
    icon: Sandwich,
    items: [
      {
        id: "dog-tradicional",
        name: "Dog Tradicional",
        description:
          "Salsicha defumada, purê, milho, ervilha, batata palha e molhos.",
        price: 18.9,
        image: "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)",
        img: U("1612392062798-2dd8c1f6fad4"),
        extras: [
          { id: "salsicha", name: "Salsicha extra", price: 4.0 },
          { id: "cheddar-dog", name: "Cheddar cremoso", price: 3.5 },
        ],
      },
      {
        id: "dog-cheddar",
        name: "Dog Cheddar Bacon",
        description:
          "Salsicha dupla, cheddar cremoso, bacon crocante e cebola crispy.",
        price: 24.9,
        image: "linear-gradient(135deg, #d97706 0%, #92400e 100%)",
        img: U("1619740455993-9d77a82c8559"),
        badge: "Promo",
        oldPrice: 28.9,
        featured: true,
        extras: [
          { id: "salsicha", name: "Salsicha extra", price: 4.0 },
          { id: "cheddar-dog", name: "Cheddar cremoso", price: 3.5 },
        ],
      },
      {
        id: "dog-calabresa",
        name: "Dog Calabresa",
        description:
          "Calabresa desfiada, vinagrete, mussarela gratinada e molho de pimenta.",
        price: 22.9,
        image: "linear-gradient(135deg, #c2410c 0%, #7c2d12 100%)",
        img: U("1599599810769-bcde5a160d32"),
        extras: [
          { id: "salsicha", name: "Salsicha extra", price: 4.0 },
          { id: "cheddar-dog", name: "Cheddar cremoso", price: 3.5 },
        ],
      },
    ],
  },
  {
    id: "drinks",
    name: "Bebidas",
    icon: GlassWater,
    items: [
      {
        id: "coca",
        name: "Coca-Cola 350ml",
        description: "Lata gelada.",
        price: 6.9,
        image: "linear-gradient(135deg, #991b1b 0%, #450a0a 100%)",
        img: U("1554866585-cd94860890b7"),
        extras: [],
      },
      {
        id: "guarana",
        name: "Guaraná Antarctica 350ml",
        description: "Lata gelada.",
        price: 5.9,
        image: "linear-gradient(135deg, #15803d 0%, #14532d 100%)",
        img: U("1625772299848-391b6a87d7b3"),
        extras: [],
      },
      {
        id: "suco",
        name: "Suco Natural 500ml",
        description: "Laranja, limão, maracujá ou abacaxi. Feito na hora.",
        price: 12.9,
        image: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
        img: U("1600271886742-f049cd451bba"),
        extras: [],
      },
      {
        id: "agua",
        name: "Água Mineral 500ml",
        description: "Com ou sem gás.",
        price: 4.9,
        image: "linear-gradient(135deg, #0284c7 0%, #075985 100%)",
        img: U("1523362628745-0c100150b504"),
        extras: [],
      },
    ],
  },
  {
    id: "desserts",
    name: "Sobremesas",
    icon: CakeSlice,
    items: [
      {
        id: "brownie",
        name: "Brownie c/ Sorvete",
        description:
          "Brownie de chocolate belga com sorvete de creme e calda quente.",
        price: 19.9,
        image: "linear-gradient(135deg, #78350f 0%, #451a03 100%)",
        img: U("1606313564200-e75d5e30476c"),
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
        image: "linear-gradient(135deg, #44403c 0%, #1c1917 100%)",
        img: U("1624353365286-3f8d62daad51"),
        extras: [{ id: "chantilly", name: "Chantilly extra", price: 3.0 }],
      },
      {
        id: "milkshake",
        name: "Milkshake 400ml",
        description: "Chocolate, morango ou Ovomaltine com chantilly.",
        price: 16.9,
        image: "linear-gradient(135deg, #be185d 0%, #831843 100%)",
        img: U("1572490122747-3968b75cc699"),
        extras: [{ id: "chantilly", name: "Chantilly extra", price: 3.0 }],
      },
    ],
  },
  {
    id: "sides",
    name: "Porções",
    icon: Drumstick,
    items: [
      {
        id: "batata",
        name: "Batata Frita",
        description:
          "Porção generosa de batata frita sequinha com sal e orégano.",
        price: 22.9,
        image: "linear-gradient(135deg, #eab308 0%, #a16207 100%)",
        img: U("1630384060421-cb20d0e0649d"),
        extras: [
          { id: "molho", name: "Molho extra", price: 2.0 },
          { id: "cheddar-side", name: "Cheddar para mergulhar", price: 4.0 },
        ],
      },
      {
        id: "onion-rings",
        name: "Onion Rings",
        description: "Anéis de cebola empanados crocantes com molho ranch.",
        price: 19.9,
        image: "linear-gradient(135deg, #ca8a04 0%, #854d0e 100%)",
        img: U("1639024471283-03518883512d"),
        extras: [
          { id: "molho", name: "Molho extra", price: 2.0 },
          { id: "cheddar-side", name: "Cheddar para mergulhar", price: 4.0 },
        ],
      },
      {
        id: "nuggets",
        name: "Nuggets (10un)",
        description:
          "Nuggets de frango artesanais crocantes com molho barbecue.",
        price: 24.9,
        image: "linear-gradient(135deg, #d97706 0%, #92400e 100%)",
        img: U("1562967914-608f82629710"),
        extras: [
          { id: "molho", name: "Molho extra", price: 2.0 },
          { id: "cheddar-side", name: "Cheddar para mergulhar", price: 4.0 },
        ],
      },
    ],
  },
];

export const FEATURED_ITEMS = CATEGORIES.flatMap((c) =>
  c.items.filter((i) => i.featured).map((i) => ({ item: i, category: c }))
);
