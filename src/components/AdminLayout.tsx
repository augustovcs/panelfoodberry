import { UtensilsCrossed, Store } from "lucide-react";
import { useStore } from "@/store";
import { cn } from "@/lib/utils";
import { AdminDashboard } from "./AdminDashboard";
import { AdminKitchen } from "./AdminKitchen";

export function AdminLayout() {
  const adminTab = useStore((s) => s.adminTab);
  const setAdminTab = useStore((s) => s.setAdminTab);
  const setMode = useStore((s) => s.setMode);

  return (
    <div className="min-h-dvh flex flex-col bg-background">
      {/* Admin Header */}
      <header className="sticky top-0 z-40 bg-foreground text-background">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-[14px] font-semibold hidden min-[400px]:inline">
              Sabor & Arte
            </span>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white/10 rounded-lg p-0.5">
            {(["dashboard", "kitchen"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setAdminTab(tab)}
                className={cn(
                  "px-4 py-1.5 rounded-md text-[13px] font-medium transition-all cursor-pointer",
                  adminTab === tab
                    ? "bg-primary text-primary-foreground"
                    : "text-white/60 hover:text-white"
                )}
              >
                {tab === "dashboard" ? "Dashboard" : "Cozinha"}
              </button>
            ))}
          </div>

          <button
            onClick={() => setMode("customer")}
            className="flex items-center gap-1.5 text-[13px] text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <Store className="w-4 h-4" />
            <span className="hidden sm:inline">Cardápio</span>
          </button>
        </div>
      </header>

      {/* Content */}
      {adminTab === "dashboard" ? <AdminDashboard /> : <AdminKitchen />}
    </div>
  );
}
