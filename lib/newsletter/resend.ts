// Gemeinsamer Resend Transport. Geheimnisse bleiben ausschließlich auf dem Server.
import { setTimeout as pause } from "node:timers/promises";

export async function resendAnfrage(pfad: string, methode = "GET", body?: unknown, idempotenz?: string): Promise<Response> {
  for (let versuch = 0; ; versuch += 1) {
    const antwort = await fetch(`https://api.resend.com${pfad}`, {
      method: methode,
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        ...(idempotenz ? { "Idempotency-Key": idempotenz } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if ((antwort.status === 429 || (antwort.status >= 500 && (methode === "GET" || idempotenz))) && versuch < 3) {
      await antwort.arrayBuffer();
      const sekunden = Number(antwort.headers.get("retry-after")) || (versuch + 1);
      await pause(Math.min(5, Math.max(1, sekunden)) * 1000);
      continue;
    }
    return antwort;
  }
}

export async function resendOk(pfad: string, methode = "GET", body?: unknown): Promise<Response> {
  const antwort = await resendAnfrage(pfad, methode, body);
  if (!antwort.ok) throw new Error(`Resend: ${methode} HTTP ${antwort.status}`);
  return antwort;
}
