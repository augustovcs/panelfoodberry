import { KitchenBoard } from "@/components/admin/KitchenBoard";
import { listKitchenOrders } from "@/lib/admin/data";
import { adminConfigured } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

export default async function CozinhaPage() {
  const initial = await listKitchenOrders();
  return <KitchenBoard initial={initial} configured={adminConfigured()} />;
}
