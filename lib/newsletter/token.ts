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
export function erzeugeBestaetigungsToken(email: string, geheimnis: string, jetzt = Date.now(), einwilligung = "v1"): string {
  const nutzlast = JSON.stringify({ email: email.toLowerCase(), jetzt, zweck: "bestaetigen", einwilligung });
  return `${b64(nutzlast)}.${signatur(nutzlast, geheimnis)}`;
}

export function leseBestaetigungsToken(token: string, geheimnis: string, jetzt = Date.now()): { email: string; angemeldetAm: string; einwilligung: string } | null {
  const [teil, sig, rest] = token.split(".");
  if (!teil || !sig || rest !== undefined) return null;
  let nutzlast: string;
  try {
    nutzlast = unb64(teil);
  } catch {
    return null;
  }
  if (!gleich(sig, signatur(nutzlast, geheimnis))) return null;
  let email: string, ausgestellt: number, zweck: string, einwilligung: string;
  try {
    if (nutzlast.startsWith("{")) {
      const wert = JSON.parse(nutzlast);
      if (typeof wert.email !== "string" || typeof wert.jetzt !== "number" || typeof wert.einwilligung !== "string") return null;
      ({ email, zweck, einwilligung } = wert);
      ausgestellt = wert.jetzt;
    } else {
      // Bereits ausgestellte Links behalten ihre Gültigkeit von 48 Stunden.
      const teile = nutzlast.split("|");
      if (teile.length !== 3) return null;
      [email, , zweck] = teile;
      ausgestellt = Number(teile[1]);
      einwilligung = "v1";
    }
  } catch { return null; }
  if (zweck !== "bestaetigen" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  const alter = jetzt - ausgestellt;
  if (!Number.isFinite(alter) || alter < 0 || alter > BESTAETIGUNG_GUELTIG_MS) return null;
  return { email, angemeldetAm: new Date(ausgestellt).toISOString(), einwilligung };
}

export function pruefeBestaetigungsToken(token: string, geheimnis: string, jetzt = Date.now()): string | null {
  return leseBestaetigungsToken(token, geheimnis, jetzt)?.email ?? null;
}

/** Abmeldetoken: je Adresse fest, läuft nie ab. */
export function erzeugeAbmeldeToken(email: string, geheimnis: string): string {
  const nutzlast = `${encodeURIComponent(email.toLowerCase())}|abmelden`;
  return `${b64(nutzlast)}.${signatur(nutzlast, geheimnis)}`;
}

export function pruefeAbmeldeToken(token: string, geheimnis: string): string | null {
  const [teil, sig, rest] = token.split(".");
  if (!teil || !sig || rest !== undefined) return null;
  let nutzlast: string;
  try {
    nutzlast = unb64(teil);
  } catch {
    return null;
  }
  if (!gleich(sig, signatur(nutzlast, geheimnis))) return null;
  const [email, zweck, extra] = nutzlast.split("|");
  if (zweck !== "abmelden" || !email || extra !== undefined) return null;
  try { return decodeURIComponent(email); } catch { return null; }
}
