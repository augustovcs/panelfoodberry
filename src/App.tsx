import { useStore } from "./store";
import { MenuView } from "./components/MenuView";
import { CartView } from "./components/CartView";
import { CheckoutAddress } from "./components/CheckoutAddress";
import { CheckoutPayment } from "./components/CheckoutPayment";
import { OrderSuccess } from "./components/OrderSuccess";
import { OrderTracking } from "./components/OrderTracking";
import { AdminLayout } from "./components/AdminLayout";
import { FloatingCart } from "./components/FloatingCart";

export default function App() {
  const { mode, view } = useStore();

  if (mode === "admin") return <AdminLayout />;

  return (
    <div className="min-h-dvh flex flex-col bg-background">
      {view === "menu" && <MenuView />}
      {view === "cart" && <CartView />}
      {view === "address" && <CheckoutAddress />}
      {view === "payment" && <CheckoutPayment />}
      {view === "success" && <OrderSuccess />}
      {view === "tracking" && <OrderTracking />}
      {view === "menu" && <FloatingCart />}
    </div>
  );
}
