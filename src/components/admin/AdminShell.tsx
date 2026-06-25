"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ChefHat,
  UtensilsCrossed,
  LogOut,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cozinha", label: "Cozinha", icon: ChefHat },
  { href: "/cardapio", label: "Cardápio", icon: UtensilsCrossed },
];

export function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh bg-secondary/30">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-border/60 bg-card p-4 md:flex">
        <div className="mb-6 flex items-center gap-2 px-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Store className="h-[15px] w-[15px]" />
          </div>
          <span className="font-display text-[15px] font-extrabold">
            AnotaBem
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[14px] font-semibold transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border/60 pt-3">
          <p className="truncate px-3 text-[11px] text-muted-foreground">
            {email}
          </p>
          <button
            onClick={logout}
            className="mt-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[14px] font-semibold text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Sair
          </button>
        </div>
      </aside>

      {/* Top bar (mobile) */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border/60 bg-card px-4 py-3 md:hidden">
          <span className="font-display text-[15px] font-extrabold">
            AnotaBem
          </span>
          <button
            onClick={logout}
            className="text-[13px] font-semibold text-muted-foreground"
          >
            Sair
          </button>
        </header>
        <nav className="flex gap-1 border-b border-border/60 bg-card px-2 py-2 md:hidden">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[12px] font-semibold",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="min-w-0 flex-1 p-4 lg:p-6">{children}</div>
      </div>
    </div>
  );
}
