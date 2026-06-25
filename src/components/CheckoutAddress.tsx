import { useState } from "react";
import { MapPin, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BackHeader } from "./BackHeader";
import { useStore } from "@/store";
import { DELIVERY_FEE } from "@/data";
import { formatCurrency, maskPhone, maskCEP, cn } from "@/lib/utils";

export function CheckoutAddress() {
  const store = useStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isDelivery = store.deliveryType === "delivery";

  function validate(): boolean {
    const e: Record<string, string> = {};

    if (!store.customerName.trim()) e.name = "Informe seu nome";
    if (store.customerPhone.replace(/\D/g, "").length < 10)
      e.phone = "Telefone inválido";

    if (isDelivery) {
      if (!store.address.street.trim()) e.street = "Informe a rua";
      if (!store.address.number.trim()) e.number = "Informe o número";
      if (!store.address.neighborhood.trim()) e.neighborhood = "Informe o bairro";
      if (!store.address.city.trim()) e.city = "Informe a cidade";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleContinue() {
    if (validate()) {
      store.setView("payment");
    }
  }

  function clearError(field: string) {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  return (
    <>
      <BackHeader title="Dados de entrega" backTo="cart" />

      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
        <div className="flex-1 px-4 py-5 space-y-6 animate-fade-in">
          {/* Delivery Type */}
          <div>
            <label className="text-[13px] font-bold text-foreground mb-3 block">
              Como deseja receber?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => store.setDeliveryType("pickup")}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer",
                  !isDelivery
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-border/80"
                )}
              >
                <Store
                  className={cn(
                    "w-6 h-6",
                    !isDelivery ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span className="text-[13px] font-semibold">
                  Retirar no local
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Sem taxa
                </span>
              </button>

              <button
                onClick={() => store.setDeliveryType("delivery")}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer",
                  isDelivery
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-border/80"
                )}
              >
                <MapPin
                  className={cn(
                    "w-6 h-6",
                    isDelivery ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span className="text-[13px] font-semibold">Entrega</span>
                <span className="text-[11px] text-muted-foreground">
                  Taxa: {formatCurrency(DELIVERY_FEE)}
                </span>
              </button>
            </div>
          </div>

          {/* Personal Info */}
          <div>
            <label className="text-[13px] font-bold text-foreground mb-3 block">
              Seus dados
            </label>
            <div className="space-y-3">
              <FormField
                label="Nome completo"
                required
                error={errors.name}
                value={store.customerName}
                onChange={(v) => {
                  store.setCustomerName(v);
                  clearError("name");
                }}
                placeholder="Seu nome"
              />
              <FormField
                label="Telefone (WhatsApp)"
                required
                error={errors.phone}
                value={maskPhone(store.customerPhone)}
                onChange={(v) => {
                  store.setCustomerPhone(v.replace(/\D/g, ""));
                  clearError("phone");
                }}
                placeholder="(00) 00000-0000"
                type="tel"
                inputMode="numeric"
              />
            </div>
          </div>

          {/* Address Fields */}
          {isDelivery && (
            <div className="animate-slide-up">
              <label className="text-[13px] font-bold text-foreground mb-3 block">
                Endereço de entrega
              </label>
              <div className="space-y-3">
                <FormField
                  label="CEP"
                  value={maskCEP(store.address.cep)}
                  onChange={(v) => {
                    store.setAddress({ cep: v.replace(/\D/g, "") });
                  }}
                  placeholder="00000-000"
                  inputMode="numeric"
                />
                <FormField
                  label="Rua"
                  required
                  error={errors.street}
                  value={store.address.street}
                  onChange={(v) => {
                    store.setAddress({ street: v });
                    clearError("street");
                  }}
                  placeholder="Nome da rua"
                />
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    label="Número"
                    required
                    error={errors.number}
                    value={store.address.number}
                    onChange={(v) => {
                      store.setAddress({ number: v });
                      clearError("number");
                    }}
                    placeholder="Nº"
                  />
                  <FormField
                    label="Complemento"
                    value={store.address.complement}
                    onChange={(v) => store.setAddress({ complement: v })}
                    placeholder="Apto, bloco..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    label="Bairro"
                    required
                    error={errors.neighborhood}
                    value={store.address.neighborhood}
                    onChange={(v) => {
                      store.setAddress({ neighborhood: v });
                      clearError("neighborhood");
                    }}
                    placeholder="Bairro"
                  />
                  <FormField
                    label="Cidade"
                    required
                    error={errors.city}
                    value={store.address.city}
                    onChange={(v) => {
                      store.setAddress({ city: v });
                      clearError("city");
                    }}
                    placeholder="Cidade"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-4 safe-bottom border-t border-border">
          <Button
            onClick={handleContinue}
            size="lg"
            className="w-full h-12 text-[15px] font-bold rounded-xl cursor-pointer"
          >
            Continuar
          </Button>
        </div>
      </div>
    </>
  );
}

function FormField({
  label,
  required,
  error,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
}: {
  label: string;
  required?: boolean;
  error?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  inputMode?: "numeric" | "tel" | "text";
}) {
  return (
    <div>
      <label className="text-[12px] font-semibold text-muted-foreground mb-1.5 block">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      <Input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "h-11 text-[14px] rounded-xl",
          error && "border-destructive focus-visible:ring-destructive"
        )}
      />
      {error && (
        <p className="text-[12px] text-destructive mt-1">{error}</p>
      )}
    </div>
  );
}
