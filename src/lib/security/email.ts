import "server-only";

/**
 * Envia o OTP por email via Resend. Sem RESEND_API_KEY (dev), apenas loga o código
 * no console — permite testar o fluxo sem configurar email. Ver ARCHITECTURE §9.1.
 */
export async function sendOtpEmail(to: string, code: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`[OTP] (dev) código de acesso para ${to}: ${code}`);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: "AnotaBem <onboarding@resend.dev>",
      to,
      subject: "Seu código de acesso ao painel",
      text: `Seu código de acesso é ${code}. Ele expira em 10 minutos.`,
    }),
  });

  if (!res.ok) {
    throw new Error(`Falha ao enviar OTP (Resend ${res.status})`);
  }
}
