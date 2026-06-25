export type CustomerView =
  | "menu"
  | "cart"
  | "address"
  | "payment"
  | "success"
  | "tracking";

export type AdminTab = "dashboard" | "kitchen";

export type OrderStatus =
  | "queue"
  | "production"
  | "sent"
  | "done"
  | "cancelled";

export interface Extra {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  /** CSS gradient used as fallback background behind the photo */
  image: string;
  /** Real food photo URL (Unsplash). Falls back to gradient on error. */
  img?: string;
  /** Original price when the item is on promotion */
  oldPrice?: number;
  /** Short marketing tag, e.g. "Mais pedido", "Promo" */
  badge?: string;
  /** Surfaces the item in the "Destaques" carousel */
  featured?: boolean;
  extras: Extra[];
}

export interface Restaurant {
  name: string;
  tagline: string;
  cover: string;
  rating: number;
  reviews: number;
  deliveryTime: string;
  distance: string;
  minOrder: number;
  isOpen: boolean;
  closesAt: string;
  address: string;
  categories: string;
}

export interface Category {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  items: MenuItem[];
}

export interface CartItem {
  id: string;
  itemId: string;
  name: string;
  image: string;
  basePrice: number;
  extras: string[];
  extrasPrice: number;
  notes: string;
  quantity: number;
  totalPrice: number;
}

export interface Address {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
}

export interface Order {
  id: string;
  customer: { name: string; phone: string };
  items: {
    name: string;
    qty: number;
    extras: string[];
    notes: string;
    price: number;
  }[];
  delivery: { type: "pickup" | "delivery"; address?: string };
  payment: string;
  status: OrderStatus;
  total: number;
  deliveryFee: number;
  createdAt: number;
}

/** Linear production flow. `cancelled` sits outside it. */
export const STATUS_FLOW: OrderStatus[] = [
  "queue",
  "production",
  "sent",
  "done",
];

export function nextStatus(status: OrderStatus): OrderStatus | null {
  const i = STATUS_FLOW.indexOf(status);
  if (i === -1 || i === STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[i + 1];
}

export function prevStatus(status: OrderStatus): OrderStatus | null {
  const i = STATUS_FLOW.indexOf(status);
  if (i <= 0) return null;
  return STATUS_FLOW[i - 1];
}

export const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string }
> = {
  queue: {
    label: "Na fila",
    color: "text-orange-700",
    bg: "bg-orange-50",
  },
  production: {
    label: "Em produção",
    color: "text-amber-700",
    bg: "bg-amber-50",
  },
  sent: {
    label: "Enviado",
    color: "text-blue-700",
    bg: "bg-blue-50",
  },
  done: {
    label: "Finalizado",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
  },
  cancelled: {
    label: "Cancelado",
    color: "text-red-700",
    bg: "bg-red-50",
  },
};
