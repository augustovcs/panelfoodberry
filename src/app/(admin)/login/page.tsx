import { LoginForm } from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-secondary/40 px-6">
      <LoginForm />
    </main>
  );
}
