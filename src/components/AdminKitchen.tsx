import { useCallback, useState, type DragEvent } from "react";
import {
  Clock,
  ChefHat,
  Truck,
  CheckCircle2,
  XCircle,
  GripVertical,
  User,
  MapPin,
  Store,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useStore } from "@/store";
import { formatCurrency, timeAgo, cn } from "@/lib/utils";
import { nextStatus, prevStatus, type Order, type OrderStatus } from "@/types";
import { KitchenOrderModal } from "./KitchenOrderModal";

const COLUMNS: {
  id: OrderStatus;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  dotColor: string;
}[] = [
  { id: "queue", label: "Na Fila", icon: Clock, dotColor: "bg-orange-500" },
  {
    id: "production",
    label: "Em Produção",
    icon: ChefHat,
    dotColor: "bg-amber-500",
  },
  {
    id: "sent",
    label: "Enviado p/ Entrega",
    icon: Truck,
    dotColor: "bg-blue-500",
  },
  {
    id: "done",
    label: "Finalizados",
    icon: CheckCircle2,
    dotColor: "bg-emerald-500",
  },
  {
    id: "cancelled",
    label: "Cancelados",
    icon: XCircle,
    dotColor: "bg-red-500",
  },
];

export function AdminKitchen() {
  const orders = useStore((s) => s.orders);
  const updateOrderStatus = useStore((s) => s.updateOrderStatus);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedOrder = orders.find((o) => o.id === selectedId) ?? null;

  const handleDragStart = useCallback(
    (e: DragEvent<HTMLDivElement>, orderId: string) => {
      e.dataTransfer.setData("text/plain", orderId);
      e.dataTransfer.effectAllowed = "move";
      (e.currentTarget as HTMLElement).classList.add("opacity-40", "rotate-1");
    },
    []
  );

  const handleDragEnd = useCallback((e: DragEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLElement).classList.remove("opacity-40", "rotate-1");
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    (e.currentTarget as HTMLElement).classList.add(
      "bg-primary/5",
      "outline-dashed",
      "outline-2",
      "outline-primary/30"
    );
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    const target = e.currentTarget as HTMLElement;
    if (!target.contains(e.relatedTarget as Node)) {
      target.classList.remove(
        "bg-primary/5",
        "outline-dashed",
        "outline-2",
        "outline-primary/30"
      );
    }
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>, newStatus: OrderStatus) => {
      e.preventDefault();
      const target = e.currentTarget as HTMLElement;
      target.classList.remove(
        "bg-primary/5",
        "outline-dashed",
        "outline-2",
        "outline-primary/30"
      );
      const orderId = e.dataTransfer.getData("text/plain");
      if (orderId) {
        updateOrderStatus(orderId, newStatus);
      }
    },
    [updateOrderStatus]
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="max-w-7xl w-full mx-auto px-4 md:px-6 pt-5 pb-1 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold leading-tight">
            Minha cozinha
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Arraste os cartões ou use as setas para mudar de etapa. Toque para
            ver os detalhes.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-3.5 p-4 md:p-6 min-h-[calc(100dvh-140px)]">
        {COLUMNS.map((col) => {
          const colOrders = orders
            .filter((o) => o.status === col.id)
            .sort((a, b) => a.createdAt - b.createdAt);

          return (
            <div
              key={col.id}
              className="min-w-[280px] max-w-[320px] flex-shrink-0 md:flex-1 bg-secondary/50 rounded-xl flex flex-col max-h-[calc(100dvh-172px)]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 shrink-0">
                <div className="flex items-center gap-2 text-[13px] font-bold">
                  <span className={cn("w-2 h-2 rounded-full", col.dotColor)} />
                  {col.label}
                </div>
                <span className="text-[11px] font-semibold text-muted-foreground bg-background px-2 py-0.5 rounded-full tabular-nums">
                  {colOrders.length}
                </span>
              </div>

              {/* Cards */}
              <div
                className="flex-1 overflow-y-auto p-2.5 space-y-2 rounded-b-xl transition-colors duration-150"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                {colOrders.map((order) => (
                  <KanbanCard
                    key={order.id}
                    order={order}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onOpen={() => setSelectedId(order.id)}
                    onStep={(s) => updateOrderStatus(order.id, s)}
                  />
                ))}

                {colOrders.length === 0 && (
                  <div className="text-center py-8 text-[12px] text-muted-foreground/50">
                    Nenhum pedido
                  </div>
                )}
              </div>
            </div>
          );
        })}
        </div>
      </div>

      <KitchenOrderModal
        order={selectedOrder}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}

function KanbanCard({
  order,
  onDragStart,
  onDragEnd,
  onOpen,
  onStep,
}: {
  order: Order;
  onDragStart: (e: DragEvent<HTMLDivElement>, id: string) => void;
  onDragEnd: (e: DragEvent<HTMLDivElement>) => void;
  onOpen: () => void;
  onStep: (status: OrderStatus) => void;
}) {
  const next = nextStatus(order.status);
  const prev = prevStatus(order.status);
  const showSteps = order.status !== "cancelled";

  const stepBtn = (e: React.MouseEvent, status: OrderStatus | null) => {
    e.stopPropagation();
    if (status) onStep(status);
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, order.id)}
      onDragEnd={onDragEnd}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className="bg-background border border-border rounded-lg p-3 cursor-pointer hover:shadow-sm hover:border-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all select-none"
    >
      {/* Top Row */}
      <div className="flex items-start justify-between mb-2">
        <span className="text-[11px] font-bold text-primary tabular-nums">
          {order.id}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground tabular-nums">
            {timeAgo(order.createdAt)}
          </span>
          <GripVertical className="w-3.5 h-3.5 text-muted-foreground/30 cursor-grab active:cursor-grabbing" />
        </div>
      </div>

      {/* Customer */}
      <div className="flex items-center gap-1.5 mb-2">
        <User className="w-3 h-3 text-muted-foreground/50" />
        <span className="text-[13px] font-semibold">{order.customer.name}</span>
      </div>

      {/* Items */}
      <div className="text-[11px] text-muted-foreground leading-relaxed mb-3">
        {order.items.map((item, j) => (
          <div key={j}>
            {item.qty}x {item.name}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-2 border-t border-border/40">
        <span className="text-[12px] font-bold tabular-nums">
          {formatCurrency(order.total)}
        </span>
        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
          {order.delivery.type === "delivery" ? (
            <>
              <MapPin className="w-3 h-3" />
              Entrega
            </>
          ) : (
            <>
              <Store className="w-3 h-3" />
              Retirada
            </>
          )}
        </span>
      </div>

      {/* Step controls */}
      {showSteps && (
        <div className="flex items-center gap-2 mt-2.5">
          <button
            onClick={(e) => stepBtn(e, prev)}
            disabled={!prev}
            draggable={false}
            aria-label="Voltar etapa"
            className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => stepBtn(e, next)}
            disabled={!next}
            draggable={false}
            className="flex-1 inline-flex items-center justify-center gap-1 h-8 rounded-lg bg-primary text-primary-foreground text-[12px] font-bold hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {next ? (
              <>
                Avançar
                <ChevronRight className="h-3.5 w-3.5" />
              </>
            ) : (
              "Concluído"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
