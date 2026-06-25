/**
 * Cálculo de valores monetários. Fonte única da verdade — usado tanto no carrinho
 * (cliente) quanto no servidor ao fechar o pedido. Sempre arredonda a 2 casas.
 */

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export interface PricedOption {
  price: number;
}

/** Preço unitário = base + soma das opções. */
export function lineUnitPrice(
  basePrice: number,
  options: PricedOption[],
): number {
  return round2(basePrice + options.reduce((s, o) => s + o.price, 0));
}

/** Total da linha = preço unitário × quantidade. */
export function lineTotal(
  basePrice: number,
  options: PricedOption[],
  quantity: number,
): number {
  return round2(lineUnitPrice(basePrice, options) * quantity);
}

export interface PricedLine {
  basePrice: number;
  options: PricedOption[];
  quantity: number;
}

/** Soma de todas as linhas do carrinho. */
export function cartSubtotal(lines: PricedLine[]): number {
  return round2(
    lines.reduce(
      (s, l) => s + lineTotal(l.basePrice, l.options, l.quantity),
      0,
    ),
  );
}
