import { LoginForm } from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  // ⚠️ DEMO — remover em produção
  const demo = process.env.DEMO_MODE === "1";
  return (
    <main className="flex min-h-dvh items-center justify-center bg-secondary/40 px-6">
      <LoginForm demo={demo} />
    </main>
  );
}
