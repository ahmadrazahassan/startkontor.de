// Entscheidungslogik der Partner-Weiterleitung unter /weiter/. Frei von Next.js, damit sie testbar ist.
// Die Zieladresse kommt ausschließlich aus unseren Daten (freigegebene Partnerlinks, geprüfte Sage-Anzeigen).
// Aus der Anfrage wird nur die Anbieterkennung bzw. Anzeigen-ID geprüft und eine bereinigte Platzierung und Herkunftsseite
// übernommen: es gibt keinen frei wählbaren Zielparameter und damit keinen offenen Redirect.

import { anbieterNachSlug, partner as partnerDaten } from "./daten.ts";
import { bereinigePlatzierung, bereinigeSeite, istLive, mitImpactKennungen, partnerZielFuer } from "./partner.ts";
import { sageAnzeigeFuer } from "./sage-werbemittel.ts";
import type { Partner } from "./typen.ts";

export type KlickProtokoll = {
  ereignis: "partnerklick";
  partner: string;
  /** Anbieter-Slug oder "banner:{anzeigenId}" */
  ziel: string;
  platzierung: string | null;
  /** Pfad der Seite, auf der geklickt wurde (aus dem Referer der eigenen Website), sonst null */
  seite: string | null;
};

export type WeiterleitungsErgebnis =
  | { status: 302; ort: string; protokoll: KlickProtokoll | null }
  | { status: 404 };

/** Maschinelle Abrufe (Crawler, Linkvorschauen, Skripte) werden nicht an den Partner weitergegeben. Sonst entstehen dort ungültige Klicks. */
const MASCHINELL = /bot\b|crawl|spider|slurp|preview|fetch|headless|monitor|scan|curl\/|wget\/|python|java\/|okhttp|go-http|axios|facebookexternalhit|embedly|whatsapp\/|validator|lighthouse/i;

export function istMaschinell(userAgent: string | null | undefined): boolean {
  const ua = (userAgent ?? "").trim();
  return ua === "" || MASCHINELL.test(ua);
}

/**
 * Seite, von der der Klick kam: nur der Pfad aus dem Referer und nur, wenn er von derselben Website stammt
 * (gleicher Host wie die Weiterleitung). Suchparameter und Anker werden nie übernommen.
 */
export function seiteAusReferer(referer: string | null | undefined, host: string | null | undefined): string | null {
  if (!referer || !host) return null;
  let url: URL;
  try {
    url = new URL(referer);
  } catch {
    return null;
  }
  if (url.host.toLowerCase() !== host.toLowerCase()) return null;
  return bereinigeSeite(url.pathname);
}

export type Anfrage = {
  platzierung: string | null;
  /** Herkunftsseite, siehe seiteAusReferer */
  seite?: string | null;
  userAgent: string | null;
  /** false bei HEAD: Linkprüfer sollen weder zählen noch den Partner auslösen */
  zaehlen: boolean;
};

export function weiterleitungFuerAnbieter(slug: string, anfrage: Anfrage, partner: Partner[] = partnerDaten): WeiterleitungsErgebnis {
  const anbieter = anbieterNachSlug.get(slug);
  if (!anbieter) return { status: 404 };
  const platzierung = bereinigePlatzierung(anfrage.platzierung);
  const seite = bereinigeSeite(anfrage.seite);
  const ziel = partnerZielFuer(anbieter, platzierung ?? "", partner, seite);
  if (!ziel) return { status: 404 };
  if (!anfrage.zaehlen || istMaschinell(anfrage.userAgent)) return { status: 302, ort: anbieter.zielUrl, protokoll: null };
  return { status: 302, ort: ziel.url, protokoll: { ereignis: "partnerklick", partner: ziel.partner, ziel: slug, platzierung, seite } };
}

export function weiterleitungFuerBanner(anzeigeId: string, anfrage: Anfrage, partner: Partner[] = partnerDaten): WeiterleitungsErgebnis {
  if (!/^\d{1,9}$/.test(anzeigeId)) return { status: 404 };
  const sage = partner.find((p) => p.schluessel === "sage");
  if (!sage || !istLive(sage)) return { status: 404 };
  let anzeige;
  try {
    anzeige = sageAnzeigeFuer(Number(anzeigeId));
  } catch {
    return { status: 404 };
  }
  if (!anzeige) return { status: 404 };
  if (!anfrage.zaehlen || istMaschinell(anfrage.userAgent)) return { status: 302, ort: anzeige.landingPage, protokoll: null };
  const platzierung = bereinigePlatzierung(anfrage.platzierung);
  const seite = bereinigeSeite(anfrage.seite);
  const ort = mitImpactKennungen(anzeige.trackingLink, sage, { platzierung, seite, art: "banner" });
  return { status: 302, ort, protokoll: { ereignis: "partnerklick", partner: "sage", ziel: `banner:${anzeige.adId}`, platzierung, seite } };
}
