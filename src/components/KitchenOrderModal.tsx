import {
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  MapPin,
  Store,
  CreditCard,
  XCircle,
  RotateCcw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/store";
import { formatCurrency, maskPhone, timeAgo, cn } from "@/lib/utils";
import {
  STATUS_CONFIG,
  nextStatus,
  prevStatus,
  type Order,
} from "@/types";

interface KitchenOrderModalProps {
  order: Order | null;
  onClose: () => void;
}

export function KitchenOrderModal({ order, onClose }: KitchenOrderModalProps) {
  const updateOrderStatus = useStore((s) => s.updateOrderStatus);

  if (!order) return null;

  const status = STATUS_CONFIG[order.status];
  const next = nextStatus(order.status);
  const prev = prevStatus(order.status);
  const isCancelled = order.status === "cancelled";

  const subtotal = order.total - order.deliveryFee;

  return (
    <Dialog open={!!order} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[440px] rounded-2xl p-0 overflow-hidden gap-0">
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-4 text-left space-y-0">
          <div className="flex items-center justify-between gap-3">
            <DialogTitle className="font-display text-xl font-extrabold tabular-nums">
              {order.id}
            </DialogTitle>
            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
                status.bg,
                status.color
              )}
            >
              {status.label}
            </span>
          </div>
          <p className="text-[12px] text-muted-foreground">
            Recebido {timeAgo(order.createdAt)}
          </p>
        </DialogHeader>

        <div className="max-h-[52vh] overflow-y-auto px-5 pb-1">
          {/* Customer */}
          <div className="rounded-xl bg-secondary/60 p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-[13px] font-semibold">
              <User className="h-4 w-4 text-muted-foreground" />
              {order.customer.name}
            </div>
            <a
              href={`tel:${order.customer.phone}`}
              className="flex items-center gap-2 text-[13px] text-muted-foreground hover:text-primary transition-colors"
            >
              <Phone className="h-4 w-4" />
              {maskPhone(order.customer.phone)}
            </a>
            <div className="flex items-start gap-2 text-[13px] text-muted-foreground">
              {order.delivery.type === "delivery" ? (
                <>
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{order.delivery.address}</span>
                </>
              ) : (
                <>
                  <Store className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Retirada no local</span>
                </>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="py-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
              Itens
            </h3>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-primary/10 text-[12px] font-bold text-primary tabular-nums">
                    {item.qty}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-[13px] font-semibold">{item.name}</p>
                      <span className="shrink-0 text-[13px] font-bold tabular-nums">
                        {formatCurrency(item.price)}
                      </span>
                    </div>
                    {item.extras.length > 0 && (
                      <p className="text-[12px] text-muted-foreground mt-0.5">
                        + {item.extras.join(", ")}
                      </p>
                    )}
                    {item.notes && (
                      <p className="text-[12px] italic text-amber-700 mt-0.5">
                        “{item.notes}”
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Payment + totals */}
          <div className="py-4 space-y-1.5">
            <div className="flex items-center gap-2 text-[13px] mb-2.5">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">{order.payment}</span>
            </div>
            <div className="flex justify-between text-[13px] text-muted-foreground">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatCurrency(subtotal)}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-[13px] text-muted-foreground">
                <span>Taxa de entrega</span>
                <span className="tabular-nums">
                  {formatCurrency(order.deliveryFee)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-[15px] font-extrabold pt-1.5">
              <span>Total</span>
              <span className="tabular-nums">
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-border bg-secondary/30 p-4 space-y-2.5">
          {!isCancelled ? (
            <>
              <div className="flex gap-2.5">
                <Button
                  variant="outline"
                  disabled={!prev}
                  onClick={() => prev && updateOrderStatus(order.id, prev)}
                  className="flex-1 h-11 rounded-xl cursor-pointer disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Voltar etapa
                </Button>
                <Button
                  disabled={!next}
                  onClick={() => next && updateOrderStatus(order.id, next)}
                  className="flex-1 h-11 rounded-xl font-bold cursor-pointer disabled:opacity-40"
                >
                  {next ? "Próxima etapa" : "Concluído"}
                  {next && <ChevronRight className="h-4 w-4 ml-1" />}
                </Button>
              </div>
              <Button
                variant="ghost"
                onClick={() => updateOrderStatus(order.id, "cancelled")}
                className="w-full h-10 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
              >
                <XCircle className="h-4 w-4 mr-1.5" />
                Cancelar pedido
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={() => updateOrderStatus(order.id, "queue")}
              className="w-full h-11 rounded-xl cursor-pointer"
            >
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Reabrir pedido
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
