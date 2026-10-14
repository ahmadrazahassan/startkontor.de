// Signierte Tokens für das Double Opt in. HMAC SHA 256, base64url, ohne Datenbank.

import { createHmac, timingSafeEqual } from "node:crypto";

const b64 = (s: string) => Buffer.from(s, "utf8").toString("base64url");
const unb64 = (s: string) => Buffer.from(s, "base64url").toString("utf8");

function signatur(daten: string, geheimnis: string): string {
  return createHmac("sha256", geheimnis).update(daten).digest("base64url");
}

function gleich(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export const BESTAETIGUNG_GUELTIG_MS = 48 * 60 * 60 * 1000;

/** Bestätigungstoken: Adresse, Ausstellzeit und Zweck, 48 Stunden gültig. */
export function erzeugeBestaetigungsToken(email: string, geheimnis: string, jetzt = Date.now()): string {
  const nutzlast = `${email.toLowerCase()}|${jetzt}|bestaetigen`;
  return `${b64(nutzlast)}.${signatur(nutzlast, geheimnis)}`;
}

export function pruefeBestaetigungsToken(token: string, geheimnis: string, jetzt = Date.now()): string | null {
  const [teil, sig] = token.split(".");
  if (!teil || !sig) return null;
  let nutzlast: string;
  try {
    nutzlast = unb64(teil);
  } catch {
    return null;
  }
  if (!gleich(sig, signatur(nutzlast, geheimnis))) return null;
  const [email, ausgestellt, zweck] = nutzlast.split("|");
  if (zweck !== "bestaetigen" || !email) return null;
  const alter = jetzt - Number(ausgestellt);
  if (!Number.isFinite(alter) || alter < 0 || alter > BESTAETIGUNG_GUELTIG_MS) return null;
  return email;
}

/** Abmeldetoken: je Adresse fest, läuft nie ab. */
export function erzeugeAbmeldeToken(email: string, geheimnis: string): string {
  const nutzlast = `${email.toLowerCase()}|abmelden`;
  return `${b64(nutzlast)}.${signatur(nutzlast, geheimnis)}`;
}

export function pruefeAbmeldeToken(token: string, geheimnis: string): string | null {
  const [teil, sig] = token.split(".");
  if (!teil || !sig) return null;
  let nutzlast: string;
  try {
    nutzlast = unb64(teil);
  } catch {
    return null;
  }
  if (!gleich(sig, signatur(nutzlast, geheimnis))) return null;
  const [email, zweck] = nutzlast.split("|");
  return zweck === "abmelden" && email ? email : null;
}
