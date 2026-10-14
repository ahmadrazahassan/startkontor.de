import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { resendAnfrage, resendOk } from "./resend.ts";

export type Anmeldung = { email: string; angemeldetAm: string; bestaetigtAm: string; einwilligung: string };
export interface NewsletterSpeicher {
  bestaetigen(anmeldung: Anmeldung): Promise<{ willkommenSenden: boolean }>;
  willkommenGesendet(email: string): Promise<void>;
  abmelden(email: string): Promise<void>;
}
export type Mail = {
  an: string; betreff: string; text: string; html: string; antwortAn?: string;
  abmeldeLink?: string; idempotenz?: string; kategorie?: string;
};
export interface MailVersand { senden(mail: Mail): Promise<{ id: string }>; }
export const EINWILLIGUNG_VERSION = "v1";
export const NEWSLETTER_EIGENSCHAFTEN = [
  "startkontor_requested_at", "startkontor_confirmed_at", "startkontor_consent_version",
  "startkontor_unsubscribed_at", "startkontor_welcome_at",
] as const;

export function umgebungVollstaendig(namen: string[]): boolean {
  return namen.every(n => (process.env[n] ?? "").trim() !== "");
}
type Kontakt = { id: string; email: string; unsubscribed: boolean; properties?: Record<string, unknown> };
/** Resend liefert benutzerdefinierte Werte als { value, type }; ältere Antworten enthalten Klarwerte. */
export function newsletterFeld(properties: Record<string, unknown> | undefined, name: string): string {
  const roh = properties?.[name];
  const wert = roh && typeof roh === "object" ? (roh as { value?: unknown }).value : roh;
  return typeof wert === "string" ? wert : "";
}
async function kontakt(email: string): Promise<Kontakt | null> {
  const antwort = await resendAnfrage(`/contacts/${encodeURIComponent(email)}`);
  if (antwort.status === 404) return null;
  if (!antwort.ok) throw new Error(`Resend Kontakt: HTTP ${antwort.status}`);
  return antwort.json() as Promise<Kontakt>;
}

/** Aktuelle Contacts/Segments API. Die bestehende Audience ID ist zugleich die Segment ID. */
export const resendSpeicher: NewsletterSpeicher = {
  async bestaetigen(a) {
    const vorher = await kontakt(a.email);
    const werte = vorher?.properties ?? {};
    const abgemeldet = Date.parse(newsletterFeld(werte, "startkontor_unsubscribed_at"));
    if (Number.isFinite(abgemeldet) && Date.parse(a.angemeldetAm) <= abgemeldet) {
      throw new Error("Nach einer Abmeldung ist eine neue Anmeldung erforderlich.");
    }
    const anfrage = newsletterFeld(werte, "startkontor_requested_at");
    if (Date.parse(anfrage) > Date.parse(a.angemeldetAm)) return { willkommenSenden: false };
    const bereitsBestaetigt = !!vorher && !vorher.unsubscribed && anfrage === a.angemeldetAm && !!newsletterFeld(werte, "startkontor_confirmed_at");
    const properties = bereitsBestaetigt ? undefined : {
      startkontor_requested_at: a.angemeldetAm,
      startkontor_confirmed_at: a.bestaetigtAm,
      startkontor_consent_version: a.einwilligung,
      ...(vorher ? { startkontor_welcome_at: null } : {}),
    };
    let id = vorher?.id;
    if (vorher) {
      if (!bereitsBestaetigt) await resendOk(`/contacts/${vorher.id}`, "PATCH", { unsubscribed: false, properties });
    } else {
      const neu = await resendOk("/contacts", "POST", { email: a.email, unsubscribed: false, properties });
      id = (await neu.json()).id;
    }
    await resendOk(`/contacts/${id}/segments/${encodeURIComponent(process.env.NEWSLETTER_AUDIENCE_ID as string)}`, "POST");
    return { willkommenSenden: !bereitsBestaetigt || !newsletterFeld(werte, "startkontor_welcome_at") };
  },
  async willkommenGesendet(email) {
    await resendOk(`/contacts/${encodeURIComponent(email)}`, "PATCH", { properties: { startkontor_welcome_at: new Date().toISOString() } });
  },
  async abmelden(email) {
    const vorher = await kontakt(email);
    if (!vorher) return;
    await resendOk(`/contacts/${vorher.id}`, "PATCH", {
      unsubscribed: true,
      properties: { startkontor_unsubscribed_at: new Date().toISOString() },
    });
  },
};

let logo: string | undefined;
export const resendVersand: MailVersand = {
  async senden({ an, betreff, text, html, antwortAn, abmeldeLink, idempotenz, kategorie }) {
    // Inline PNG aus dem echten Websitezeichen; keine externe Bildverbindung im Mailprogramm.
    if (html.includes("cid:startkontor-logo")) logo ??= readFileSync(join(process.cwd(), "public/marke/startkontor-email-logo.png")).toString("base64");
    const antwort = await resendAnfrage("/emails", "POST", {
      from: process.env.MAIL_FROM, to: [an], subject: betreff, text, html,
      reply_to: antwortAn ?? process.env.MAIL_TO,
      ...(abmeldeLink ? { headers: { "List-Unsubscribe": `<${abmeldeLink}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } } : {}),
      ...(html.includes("cid:startkontor-logo") ? { attachments: [{ filename: "startkontor.png", content: logo, content_type: "image/png", content_id: "startkontor-logo" }] } : {}),
      ...(kategorie ? { tags: [{ name: "category", value: kategorie }] } : {}),
    }, idempotenz);
    if (!antwort.ok) throw new Error(`Resend Versand: HTTP ${antwort.status}`);
    return antwort.json() as Promise<{ id: string }>;
  },
};

export function mailSchluessel(zweck: string, email: string, zeit: string): string {
  return `${zweck}-${createHash("sha256").update(`${email.toLowerCase()}|${zeit}`).digest("hex")}`;
}
