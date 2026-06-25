/**
 * Login do gestor (subdomínio admin). Placeholder da Fase 0 — autenticação real
 * (senha + 2FA por OTP de email + trusted device) é implementada na Fase 5.
 */
export default function AdminLogin() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="rounded-full bg-foreground/5 px-3 py-1 text-sm font-semibold text-muted-foreground">
        Painel do gestor
      </span>
      <h1 className="font-display text-3xl font-bold">Acesso restrito</h1>
      <p className="text-sm text-muted-foreground">
        Login com 2FA chega na Fase 5.
      </p>
    </main>
  );
}
