import { useState } from "react";
import {
  Smartphone,
  CreditCard,
  Banknote,
  Wallet,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { BackHeader } from "./BackHeader";
import { useStore } from "@/store";
import { DELIVERY_FEE } from "@/data";
import { formatCurrency, maskCurrency, cn } from "@/lib/utils";

const METHODS = [
  { id: "pix", label: "PIX", icon: Smartphone },
  { id: "credit", label: "Cartão de Crédito", icon: CreditCard },
  { id: "debit", label: "Cartão de Débito", icon: Wallet },
  { id: "cash", label: "Dinheiro", icon: Banknote },
] as const;

export function CheckoutPayment() {
  const store = useStore();
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [changeInput, setChangeInput] = useState(store.changeFor);

  const subtotal = store.cart.reduce((sum, ci) => sum + ci.totalPrice, 0);
  const fee = store.deliveryType === "delivery" ? DELIVERY_FEE : 0;
  const total = subtotal + fee;

  function selectMethod(id: string) {
    store.setPaymentMethod(id);
    if (id === "cash") {
      setChangeInput("");
      setShowChangeModal(true);
    }
  }

  function confirmChange() {
    store.setChangeFor(changeInput);
    setShowChangeModal(false);
  }

  function cancelChange() {
    store.setPaymentMethod(null);
    store.setChangeFor("");
    setShowChangeModal(false);
  }

  function handleFinalize() {
    if (!store.paymentMethod) return;
    store.placeOrder();
  }

  return (
    <>
      <BackHeader title="Pagamento" backTo="address" />

      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
        <div className="flex-1 px-4 py-5 space-y-6 animate-fade-in">
          {/* Total Summary */}
          <div className="bg-secondary/50 rounded-xl p-4">
            <div className="flex justify-between text-sm text-muted-foreground py-1">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatCurrency(subtotal)}</span>
            </div>
            {fee > 0 && (
              <div className="flex justify-between text-sm text-muted-foreground py-1">
                <span>Taxa de entrega</span>
                <span className="tabular-nums">{formatCurrency(fee)}</span>
              </div>
            )}
            <Separator className="my-2.5" />
            <div className="flex justify-between text-lg font-bold py-1">
              <span>Total</span>
              <span className="tabular-nums">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <label className="text-[13px] font-bold text-foreground mb-3 block">
              Forma de pagamento
            </label>
            <div className="space-y-2.5">
              {METHODS.map((m) => {
                const isActive = store.paymentMethod === m.id;
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => selectMethod(m.id)}
                    className={cn(
                      "w-full flex items-center gap-3.5 p-4 rounded-xl border-2 transition-all cursor-pointer",
                      isActive
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-border/80"
                    )}
                  >
                    <span
                      className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                        isActive ? "border-primary" : "border-border"
                      )}
                    >
                      {isActive && (
                        <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                      )}
                    </span>
                    <Icon
                      className={cn(
                        "w-5 h-5",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <span className="text-[14px] font-semibold">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {store.paymentMethod === "cash" && store.changeFor && (
              <p className="text-[13px] text-muted-foreground mt-3 px-1">
                Troco para R$ {store.changeFor}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-4 safe-bottom border-t border-border">
          <Button
            onClick={handleFinalize}
            size="lg"
            disabled={!store.paymentMethod}
            className="w-full h-12 text-[15px] font-bold rounded-xl cursor-pointer disabled:opacity-40"
          >
            Finalizar Pedido &middot; {formatCurrency(total)}
          </Button>
        </div>
      </div>

      {/* Change Modal */}
      <Dialog open={showChangeModal} onOpenChange={setShowChangeModal}>
        <DialogContent className="max-w-[360px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Troco para quanto?</DialogTitle>
            <DialogDescription>
              Informe o valor para calcularmos o troco.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <label className="text-[12px] font-semibold text-muted-foreground mb-1.5 block">
              Valor em R$
            </label>
            <Input
              value={changeInput}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "");
                setChangeInput(maskCurrency(raw));
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmChange();
              }}
              placeholder="0,00"
              inputMode="numeric"
              className="h-11 text-[14px] rounded-xl tabular-nums"
              autoFocus
            />
          </div>
          <div className="flex gap-3 mt-1">
            <Button
              variant="outline"
              onClick={cancelChange}
              className="flex-1 rounded-xl cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmChange}
              className="flex-1 rounded-xl cursor-pointer"
            >
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
