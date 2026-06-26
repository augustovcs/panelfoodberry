import { LoginForm } from "@/components/admin/LoginForm";
import { isDemoMode } from "@/lib/admin/demo"; // ⚠️ DEMO — remover em produção

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-secondary/40 px-6">
      {/* demo={true} enquanto o Supabase não estiver configurado */}
      <LoginForm demo={isDemoMode()} />
    </main>
  );
}
