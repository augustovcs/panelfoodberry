import { getMenu } from "@/lib/menu/repository";
import { MenuBrowser } from "@/components/storefront/MenuBrowser";

// ISR: o cardápio é revalidado a cada 60s (econômico em egress; ver ARCHITECTURE §8).
export const revalidate = 60;

export default async function LojaHome() {
  const menu = await getMenu();
  return (
    <div className="bg-paper flex min-h-dvh flex-col">
      <MenuBrowser menu={menu} />
    </div>
  );
}
