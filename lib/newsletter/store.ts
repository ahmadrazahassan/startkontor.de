// Adapter für den Newsletter Dienst. Die Routen kennen nur diese Schnittstelle.
// Standard ist Resend (Kontakte und E-Mail Versand). Ein anderer Dienst ersetzt nur diese Datei.

export type Anmeldung = {
  email: string;
  /** ISO Zeit der Anmeldung (Tokenausstellung) */
  angemeldetAm: string;
  /** ISO Zeit der Bestätigung */
  bestaetigtAm: string;
  /** Version des Einwilligungstextes */
  einwilligung: string;
};

export interface NewsletterSpeicher {
  bestaetigen(anmeldung: Anmeldung): Promise<void>;
  abmelden(email: string): Promise<void>;
}

export interface MailVersand {
  senden(mail: { an: string; betreff: string; text: string; html: string; antwortAn?: string }): Promise<void>;
}

export const EINWILLIGUNG_VERSION = "v1";

export function umgebungVollstaendig(namen: string[]): boolean {
  return namen.every((n) => (process.env[n] ?? "").trim() !== "");
}

const RESEND = "https://api.resend.com";

async function resend(pfad: string, methode: "POST" | "PATCH", body: unknown): Promise<Response> {
  return fetch(`${RESEND}${pfad}`, {
    method: methode,
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
}

/** Resend Implementierung. Die genauen Felder der Kontakte API vor dem Start gegen die aktuelle Dokumentation prüfen. */
export const resendSpeicher: NewsletterSpeicher = {
  async bestaetigen(a) {
    const audience = process.env.NEWSLETTER_AUDIENCE_ID;
    const antwort = await resend(`/audiences/${audience}/contacts`, "POST", {
      email: a.email,
      unsubscribed: false,
      // Resend kennt keine freien Felder in jedem Tarif. Zeitpunkte und Version stehen daher zusätzlich in der Mail an die Redaktion.
    });
    if (!antwort.ok && antwort.status !== 409) {
      throw new Error(`Resend Kontakt: HTTP ${antwort.status}`);
    }
    if (antwort.status === 409) {
      const upd = await resend(`/audiences/${audience}/contacts/${encodeURIComponent(a.email)}`, "PATCH", {
        unsubscribed: false,
      });
      if (!upd.ok) throw new Error(`Resend Kontakt Update: HTTP ${upd.status}`);
    }
  },
  async abmelden(email) {
    const audience = process.env.NEWSLETTER_AUDIENCE_ID;
    const antwort = await resend(`/audiences/${audience}/contacts/${encodeURIComponent(email)}`, "PATCH", {
      unsubscribed: true,
    });
    if (!antwort.ok && antwort.status !== 404) throw new Error(`Resend Abmeldung: HTTP ${antwort.status}`);
  },
};

export const resendVersand: MailVersand = {
  async senden({ an, betreff, text, html, antwortAn }) {
    const antwort = await resend("/emails", "POST", {
      from: process.env.MAIL_FROM,
      to: [an],
      subject: betreff,
      text,
      html,
      ...(antwortAn ? { reply_to: antwortAn } : {}),
    });
    if (!antwort.ok) throw new Error(`Resend Versand: HTTP ${antwort.status}`);
  },
};
