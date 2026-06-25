/** Tipos do cardápio para a UI (mapeados do Supabase ou dos fixtures). */

export interface MenuOption {
  id: string;
  name: string;
  price: number;
}

export interface MenuOptionGroup {
  id: string;
  name: string;
  required: boolean;
  minSelect: number;
  maxSelect: number;
  options: MenuOption[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  badge?: string;
  featured: boolean;
  /** CSS gradient usado como fundo / fallback da foto */
  gradient: string;
  imageUrl?: string;
  optionGroups: MenuOptionGroup[];
}

export interface MenuCategory {
  id: string;
  name: string;
  /** nome do glyph lucide (ver @/lib/menu/icons) */
  icon: string;
  items: MenuItem[];
}

export interface RestaurantInfo {
  name: string;
  tagline: string;
  coverUrl: string;
  logoText: string;
  rating: number;
  reviews: number;
  deliveryTime: string;
  distance: string;
  minOrder: number;
  deliveryFee: number;
  isOpen: boolean;
  closesAt: string;
  address: string;
  categoriesLabel: string;
  /** destino do wa.me (E.164) */
  whatsapp: string;
}

export interface Menu {
  restaurant: RestaurantInfo;
  categories: MenuCategory[];
}

export interface FeaturedItem {
  item: MenuItem;
  category: MenuCategory;
}

/** Itens marcados como destaque, achatados com a categoria de origem. */
export function featuredItems(menu: Menu): FeaturedItem[] {
  return menu.categories.flatMap((category) =>
    category.items
      .filter((item) => item.featured)
      .map((item) => ({ item, category })),
  );
}
