import { MenuEditor } from "@/components/admin/MenuEditor";
import { getAdminMenu } from "@/lib/admin/data";

export const dynamic = "force-dynamic";

export default async function CardapioPage() {
  const menu = await getAdminMenu();
  return (
    <MenuEditor
      configured={menu.configured}
      categories={menu.categories}
      settings={menu.settings}
      coupons={menu.coupons}
    />
  );
}
