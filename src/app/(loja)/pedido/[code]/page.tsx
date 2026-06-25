import { OrderTracking } from "@/components/checkout/OrderTracking";

export default function PedidoTrackingPage({
  params,
}: {
  params: { code: string };
}) {
  return <OrderTracking code={params.code.toUpperCase()} />;
}
