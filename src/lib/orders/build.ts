import type { Menu, MenuItem, MenuOption } from "@/lib/menu/types";
import type {
  OrderItemSnapshot,
  DeliveryType,
  PaymentMethod,
} from "@/lib/types";
import type { CreateOrderInput } from "@/lib/validators/order";
import { type AddressInput, formatAddress } from "@/lib/validators/address";
import { lineUnitPrice, round2 } from "@/lib/domain/money";
import { computeOrderPricing, type CouponRule } from "@/lib/domain/coupon";
import { generateOrderCode } from "./code";

export interface OrderDraft {
  code: string;
  customerName: string;
  customerPhone: string;
  deliveryType: DeliveryType;
  address?: AddressInput;
  addressLine?: string;
  paymentMethod: PaymentMethod;
  changeFor?: number;
  items: OrderItemSnapshot[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  couponCode?: string;
  notes: string;
}

function indexMenu(menu: Menu) {
  const items = new Map<string, MenuItem>();
  const options = new Map<string, MenuOption>();
  for (const cat of menu.categories) {
    for (const item of cat.items) {
      items.set(item.id, item);
      for (const group of item.optionGroups) {
        for (const opt of group.options) options.set(opt.id, opt);
      }
    }
  }
  return { items, options };
}

/**
 * Monta o pedido a partir da entrada do cliente, recalculando TODOS os preços a
 * partir do cardápio (o valor enviado pelo cliente é ignorado — ver §9.4).
 * Lança erro se um item/opção não existir no cardápio.
 */
export function buildOrderDraft(
  input: CreateOrderInput,
  menu: Menu,
  couponRule?: CouponRule | null,
): OrderDraft {
  const { items: itemIndex, options: optionIndex } = indexMenu(menu);

  const items: OrderItemSnapshot[] = input.items.map((line) => {
    const item = itemIndex.get(line.itemId);
    if (!item) throw new Error(`Item inexistente: ${line.itemId}`);

    // Só aceita opções que pertençam de fato a este item.
    const validIds = new Set(
      item.optionGroups.flatMap((g) => g.options.map((o) => o.id)),
    );
    const options = line.optionIds
      .filter((id) => validIds.has(id))
      .map((id) => optionIndex.get(id)!)
      .map((o) => ({ name: o.name, price: o.price }));

    const unitPrice = lineUnitPrice(item.price, options);
    return {
      name: item.name,
      qty: line.quantity,
      unitPrice,
      options,
      notes: line.notes,
      lineTotal: round2(unitPrice * line.quantity),
    };
  });

  const subtotal = round2(items.reduce((s, it) => s + it.lineTotal, 0));
  const baseFee =
    input.deliveryType === "delivery" ? menu.restaurant.deliveryFee : 0;

  const pricing = computeOrderPricing({
    subtotal,
    deliveryFee: baseFee,
    coupon: couponRule ?? null,
  });

  return {
    code: generateOrderCode(),
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    deliveryType: input.deliveryType,
    address: input.address,
    addressLine: input.address ? formatAddress(input.address) : undefined,
    paymentMethod: input.paymentMethod,
    changeFor: input.changeFor,
    items,
    subtotal: pricing.subtotal,
    deliveryFee: pricing.deliveryFee,
    discount: pricing.discount,
    total: pricing.total,
    couponCode: couponRule ? input.couponCode : undefined,
    notes: input.notes,
  };
}
