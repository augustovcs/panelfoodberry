import Link from "next/link";
import Image from "next/image";
import { LayoutGrid, ClipboardList } from "lucide-react";

interface TopBarProps {
  name: string;
  adminUrl: string;
}

/** Barra fina fixa no topo (logo + atalhos). */
export function TopBar({ name, adminUrl }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-[#faf6f0]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-3 px-4 lg:px-8">
        <div className="flex min-w-0 items-center">
          <Image
            src="/brand/logo.png"
            alt={name}
            width={216}
            height={168}
            priority
            className="h-9 w-auto"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            href="/pedido"
            className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ClipboardList className="h-4 w-4" />
            <span className="hidden min-[380px]:inline">Meus pedidos</span>
          </Link>
          <a
            href={adminUrl}
            className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Painel administrativo"
          >
            <LayoutGrid className="h-[18px] w-[18px]" />
          </a>
        </div>
      </div>
    </header>
  );
}
