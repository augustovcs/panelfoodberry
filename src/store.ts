import { create } from "zustand";
import type {
  CartItem,
  CustomerView,
  AdminTab,
  Address,
  Order,
  OrderStatus,
} from "./types";
import { generateOrderId } from "./lib/utils";
import { DELIVERY_FEE } from "./data";

interface AppStore {
  mode: "customer" | "admin";
  view: CustomerView;
  adminTab: AdminTab;
  selectedCategory: string;

  cart: CartItem[];
  deliveryType: "pickup" | "delivery";
  customerName: string;
  customerPhone: string;
  address: Address;
  paymentMethod: string | null;
  changeFor: string;

  orders: Order[];
  trackingPhone: string;

  setMode: (mode: "customer" | "admin") => void;
  setView: (view: CustomerView) => void;
  setAdminTab: (tab: AdminTab) => void;
  setCategory: (id: string) => void;

  addToCart: (item: Omit<CartItem, "id">) => void;
  removeFromCart: (id: string) => void;
  updateCartQuantity: (id: string, delta: number) => void;
  clearCart: () => void;

  setDeliveryType: (type: "pickup" | "delivery") => void;
  setCustomerName: (name: string) => void;
  setCustomerPhone: (phone: string) => void;
  setAddress: (address: Partial<Address>) => void;
  setPaymentMethod: (method: string | null) => void;
  setChangeFor: (value: string) => void;
  setTrackingPhone: (phone: string) => void;

  placeOrder: () => string;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
}

export const useStore = create<AppStore>((set, get) => ({
  mode: "customer",
  view: "menu",
  adminTab: "dashboard",
  selectedCategory: "burgers",

  cart: [],
  deliveryType: "pickup",
  customerName: "",
  customerPhone: "",
  address: {
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
  },
  paymentMethod: null,
  changeFor: "",

  orders: seedDemoOrders(),
  trackingPhone: "",

  setMode: (mode) => set({ mode, view: "menu", adminTab: "dashboard" }),
  setView: (view) => set({ view }),
  setAdminTab: (tab) => set({ adminTab: tab }),
  setCategory: (id) => set({ selectedCategory: id }),

  addToCart: (item) =>
    set((s) => ({
      cart: [...s.cart, { ...item, id: crypto.randomUUID() }],
    })),

  removeFromCart: (id) =>
    set((s) => ({ cart: s.cart.filter((ci) => ci.id !== id) })),

  updateCartQuantity: (id, delta) =>
    set((s) => ({
      cart: s.cart
        .map((ci) => {
          if (ci.id !== id) return ci;
          const newQty = ci.quantity + delta;
          if (newQty < 1) return ci;
          const unitPrice = ci.basePrice + ci.extrasPrice;
          return {
            ...ci,
            quantity: newQty,
            totalPrice: unitPrice * newQty,
          };
        })
        .filter((ci) => ci.quantity > 0),
    })),

  clearCart: () => set({ cart: [] }),

  setDeliveryType: (type) => set({ deliveryType: type }),
  setCustomerName: (name) => set({ customerName: name }),
  setCustomerPhone: (phone) => set({ customerPhone: phone }),
  setAddress: (address) =>
    set((s) => ({ address: { ...s.address, ...address } })),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setChangeFor: (value) => set({ changeFor: value }),
  setTrackingPhone: (phone) => set({ trackingPhone: phone }),

  placeOrder: () => {
    const s = get();
    const subtotal = s.cart.reduce((sum, ci) => sum + ci.totalPrice, 0);
    const fee = s.deliveryType === "delivery" ? DELIVERY_FEE : 0;
    const methodLabels: Record<string, string> = {
      pix: "PIX",
      credit: "Cartão Crédito",
      debit: "Cartão Débito",
      cash: "Dinheiro",
    };

    const order: Order = {
      id: generateOrderId(),
      customer: { name: s.customerName, phone: s.customerPhone },
      items: s.cart.map((ci) => ({
        name: ci.name,
        qty: ci.quantity,
        extras: ci.extras,
        notes: ci.notes,
        price: ci.totalPrice,
      })),
      delivery:
        s.deliveryType === "delivery"
          ? {
              type: "delivery",
              address: `${s.address.street}, ${s.address.number}${s.address.complement ? " - " + s.address.complement : ""} — ${s.address.neighborhood}, ${s.address.city}`,
            }
          : { type: "pickup" },
      payment:
        (methodLabels[s.paymentMethod ?? ""] ?? s.paymentMethod ?? "") +
        (s.paymentMethod === "cash" && s.changeFor
          ? ` (troco p/ R$ ${s.changeFor})`
          : ""),
      status: "queue",
      total: subtotal + fee,
      deliveryFee: fee,
      createdAt: Date.now(),
    };

    set((prev) => ({
      orders: [...prev.orders, order],
      cart: [],
      paymentMethod: null,
      changeFor: "",
      view: "success",
    }));

    return order.id;
  },

  updateOrderStatus: (id, status) =>
    set((s) => ({
      orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
    })),
}));

function seedDemoOrders(): Order[] {
  const now = Date.now();
  return [
    {
      id: "PED-1001",
      customer: { name: "João Silva", phone: "11999001122" },
      items: [
        { name: "Smash Clássico", qty: 2, extras: ["Bacon crocante"], notes: "Sem cebola", price: 69.8 },
        { name: "Coca-Cola 350ml", qty: 2, extras: [], notes: "", price: 13.8 },
      ],
      delivery: { type: "delivery", address: "Rua das Flores, 123 — Centro" },
      payment: "PIX",
      status: "queue",
      total: 90.5,
      deliveryFee: DELIVERY_FEE,
      createdAt: now - 4 * 60000,
    },
    {
      id: "PED-1002",
      customer: { name: "Maria Oliveira", phone: "11988776655" },
      items: [
        { name: "Margherita", qty: 1, extras: ["Borda recheada"], notes: "", price: 53.9 },
        { name: "Suco Natural 500ml", qty: 1, extras: [], notes: "Maracujá", price: 12.9 },
      ],
      delivery: { type: "pickup" },
      payment: "Cartão Crédito",
      status: "production",
      total: 66.8,
      deliveryFee: 0,
      createdAt: now - 12 * 60000,
    },
    {
      id: "PED-1003",
      customer: { name: "Carlos Mendes", phone: "11977665544" },
      items: [
        { name: "Dog Cheddar Bacon", qty: 3, extras: [], notes: "", price: 74.7 },
        { name: "Batata Frita", qty: 1, extras: ["Cheddar para mergulhar"], notes: "", price: 26.9 },
      ],
      delivery: { type: "delivery", address: "Av. Brasil, 456 — Jardim América" },
      payment: "Dinheiro",
      status: "production",
      total: 108.5,
      deliveryFee: DELIVERY_FEE,
      createdAt: now - 18 * 60000,
    },
    {
      id: "PED-1004",
      customer: { name: "Ana Costa", phone: "11966554433" },
      items: [{ name: "Quatro Queijos", qty: 1, extras: [], notes: "", price: 49.9 }],
      delivery: { type: "pickup" },
      payment: "PIX",
      status: "sent",
      total: 49.9,
      deliveryFee: 0,
      createdAt: now - 30 * 60000,
    },
    {
      id: "PED-1005",
      customer: { name: "Pedro Santos", phone: "11955443322" },
      items: [
        { name: "Smash Duplo Cheddar", qty: 1, extras: ["Ovo", "Bacon"], notes: "Ovo mole", price: 44.9 },
        { name: "Milkshake 400ml", qty: 1, extras: [], notes: "Ovomaltine", price: 16.9 },
      ],
      delivery: { type: "delivery", address: "Rua Alegria, 789 — Vila Nova" },
      payment: "Cartão Débito",
      status: "done",
      total: 68.7,
      deliveryFee: DELIVERY_FEE,
      createdAt: now - 55 * 60000,
    },
    {
      id: "PED-1006",
      customer: { name: "Lucas Ferreira", phone: "11944332211" },
      items: [{ name: "Burger Costela", qty: 1, extras: [], notes: "", price: 39.9 }],
      delivery: { type: "pickup" },
      payment: "PIX",
      status: "done",
      total: 39.9,
      deliveryFee: 0,
      createdAt: now - 70 * 60000,
    },
    {
      id: "PED-1007",
      customer: { name: "Fernanda Lima", phone: "11933221100" },
      items: [{ name: "Dog Tradicional", qty: 2, extras: [], notes: "Sem ervilha", price: 37.8 }],
      delivery: { type: "delivery", address: "Rua Sol, 321 — Parque Real" },
      payment: "Dinheiro",
      status: "cancelled",
      total: 44.7,
      deliveryFee: DELIVERY_FEE,
      createdAt: now - 45 * 60000,
    },
    {
      id: "PED-1008",
      customer: { name: "Roberto Alves", phone: "11999001122" },
      items: [
        { name: "Frango Crispy", qty: 1, extras: ["Queijo extra"], notes: "", price: 31.9 },
        { name: "Onion Rings", qty: 1, extras: [], notes: "", price: 19.9 },
        { name: "Guaraná 350ml", qty: 2, extras: [], notes: "", price: 11.8 },
      ],
      delivery: { type: "pickup" },
      payment: "Cartão Crédito",
      status: "queue",
      total: 63.6,
      deliveryFee: 0,
      createdAt: now - 2 * 60000,
    },
  ];
}
