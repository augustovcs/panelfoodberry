import { Search, ClipboardList, Truck, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { BackHeader } from "./BackHeader";
import { useStore } from "@/store";
import { maskPhone, timeAgo, formatCurrency, cn } from "@/lib/utils";
import { STATUS_CONFIG } from "@/types";

export function OrderTracking() {
  const store = useStore();

  const phone = store.trackingPhone.replace(/\D/g, "");
  const searched = phone.length >= 10;
  const myOrders = searched
    ? store.orders
        .filter((o) => o.customer.phone === phone)
        .sort((a, b) => b.createdAt - a.createdAt)
    : [];

  return (
    <>
      <BackHeader title="Meus Pedidos" backTo="menu" />

      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-5 animate-fade-in">
        <p className="text-[13px] font-bold text-foreground mb-3">
          Digite seu telefone para encontrar seus pedidos
        </p>

        <div className="flex gap-2.5 mb-6">
          <Input
            type="tel"
            inputMode="numeric"
            value={maskPhone(store.trackingPhone)}
            onChange={(e) =>
              store.setTrackingPhone(e.target.value.replace(/\D/g, ""))
            }
            placeholder="(00) 00000-0000"
            className="flex-1 h-11 text-[14px] rounded-xl"
          />
          <Button className="h-11 px-4 rounded-xl cursor-pointer">
            <Search className="w-4 h-4" />
          </Button>
        </div>

        {searched &&
          (myOrders.length > 0 ? (
            <div className="space-y-3">
              {myOrders.map((order, i) => {
                const status = STATUS_CONFIG[order.status];
                return (
                  <div
                    key={order.id}
                    className="border border-border rounded-xl overflow-hidden animate-slide-up"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="flex items-center justify-between px-4 py-3 bg-secondary/50">
                      <div>
                        <p className="text-[14px] font-bold tabular-nums">
                          {order.id}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {timeAgo(order.createdAt)}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide",
                          status.bg,
                          status.color
                        )}
                      >
                        {status.label}
                      </span>
                    </div>

                    <div className="px-4 py-3">
                      <div className="space-y-1 mb-3">
                        {order.items.map((item, j) => (
                          <p
                            key={j}
                            className="text-[13px] text-muted-foreground"
                          >
                            {item.qty}x {item.name}
                            {item.extras.length > 0 &&
                              ` (${item.extras.join(", ")})`}
                            {item.notes && ` — ${item.notes}`}
                          </p>
                        ))}
                      </div>

                      <Separator className="mb-3" />

                      <div className="flex justify-between items-center">
                        <span className="text-[12px] text-muted-foreground flex items-center gap-1">
                          {order.delivery.type === "delivery" ? (
                            <>
                              <Truck className="w-3.5 h-3.5" />
                              Entrega
                            </>
                          ) : (
                            <>
                              <Store className="w-3.5 h-3.5" />
                              Retirada
                            </>
                          )}
                        </span>
                        <span className="text-[14px] font-bold tabular-nums">
                          {formatCurrency(order.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="w-6 h-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm text-muted-foreground">
                Nenhum pedido encontrado para este telefone.
              </p>
            </div>
          ))}
      </div>
    </>
  );
}
