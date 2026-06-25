import { getMenu } from "@/lib/menu/repository";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";

// Depende do carrinho (client) — não prerenderizar.
export const dynamic = "force-dynamic";

export default async function CarrinhoPage() {
  const menu = await getMenu();
  return (
    <main className="flex min-h-dvh flex-col">
      <CheckoutFlow
        deliveryFee={menu.restaurant.deliveryFee}
        minOrder={menu.restaurant.minOrder}
      />
    </main>
  );
}
