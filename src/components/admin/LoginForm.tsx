"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Step = "credentials" | "otp";

export function LoginForm({ demo = false }: { demo?: boolean }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  function finish() {
    router.replace("/dashboard");
    router.refresh();
  }

  // ⚠️ DEMO — remover em produção
  async function loginDemo() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: "demo@anotabem.app",
          password: "demo1234",
        }),
      });
      if (!res.ok) {
        setError("Não foi possível acessar o demo.");
        return;
      }
      finish();
    } catch {
      setError("Falha de conexão.");
    } finally {
      setLoading(false);
    }
  }

  async function submitCredentials(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Não foi possível entrar.");
        return;
      }
      if (data.step === "otp") {
        setStep("otp");
        setInfo("Enviamos um código de verificação para o seu e-mail.");
      } else {
        finish();
      }
    } catch {
      setError("Falha de conexão.");
    } finally {
      setLoading(false);
    }
  }

  async function submitOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/auth/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Código incorreto.");
        return;
      }
      finish();
    } catch {
      setError("Falha de conexão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="shadow-soft w-full max-w-sm rounded-2xl border border-border/60 bg-card p-6">
      <div className="mb-5 flex items-center gap-2.5">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-lg font-extrabold leading-none">
            Painel do gestor
          </h1>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Acesso protegido por 2FA
          </p>
        </div>
      </div>

      {step === "credentials" ? (
        <>
          <form onSubmit={submitCredentials} className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-[12px] font-semibold text-muted-foreground">
                E-mail
              </span>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[12px] font-semibold text-muted-foreground">
                Senha
              </span>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </label>
            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-xl font-bold"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          {/* ⚠️ DEMO — remover em produção */}
          {demo && (
            <div className="mt-4 border-t border-border/60 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={loginDemo}
                disabled={loading}
                className="h-11 w-full rounded-xl font-bold"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Acessar demo"
                )}
              </Button>
              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                Modo demonstração — dados fictícios, sem login real.
              </p>
            </div>
          )}
        </>
      ) : (
        <form onSubmit={submitOtp} className="space-y-3">
          {info && (
            <p className="flex items-start gap-2 rounded-xl bg-primary/5 p-3 text-[12.5px] text-muted-foreground">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              {info}
            </p>
          )}
          <label className="block">
            <span className="mb-1 block text-[12px] font-semibold text-muted-foreground">
              Código de 6 dígitos
            </span>
            <Input
              inputMode="numeric"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="••••••"
              className="text-center text-lg tracking-[0.4em]"
              required
            />
          </label>
          <Button
            type="submit"
            disabled={loading || code.length !== 6}
            className="h-11 w-full rounded-xl font-bold"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Verificar"
            )}
          </Button>
        </form>
      )}

      {error && (
        <p className="mt-3 text-[12.5px] font-semibold text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
