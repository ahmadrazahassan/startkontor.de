// Partnerlinks und Werbemittel. Standard: alles aus. Ein Partner ist nur live, wenn
// aktiv === true UND der Ziellink keinen Platzhalter mehr enthält.
//
// Gekennzeichnete Links zeigen nie direkt auf das Partnernetzwerk, sondern auf die eigene
// Weiterleitung unter /weiter/. Dort wird der Klick gezählt und sofort an den Partner geschickt.
// Vorteil: Besucher sehen beim Überfahren startkontor.de statt einer Netzwerkadresse, die echte
// Partneradresse steht nur serverseitig (kein Link-Austausch im Browser) und die Herkunftsseite
// (startkontor.de) kommt beim Partnernetzwerk an.

import type { Anbieter, Partner } from "./typen.ts";

export type AusgehenderLink = {
  /** Gekennzeichnete Links: interne Weiterleitung /weiter/{slug}. Sonst die direkte Herstellerseite. */
  href: string;
  /** true nur bei aktivem Partner: rel="sponsored", sichtbares Label "Werbung", neuer Tab */
  werbung: boolean;
  partner: string | null;
};

export const WEITERLEITUNG = "/weiter";

/** rel für externe Links. Werbelinks senden die Herkunftsdomain mit (kein noreferrer), sonst kann das Partnernetzwerk den Klick keiner Website zuordnen. */
export function relFuer(werbung: boolean): string {
  return werbung ? "sponsored nofollow noopener" : "noopener noreferrer";
}

/** Platzierungskennung: nur a-z, 0-9, Bindestrich und Unterstrich, höchstens 64 Zeichen. Leer → null. */
export function bereinigePlatzierung(roh: string | null | undefined): string | null {
  if (!roh) return null;
  const sauber = roh.toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64);
  return sauber || null;
}

export function weiterleitungsPfadAnbieter(slug: string, platzierung: string): string {
  const p = bereinigePlatzierung(platzierung);
  return `${WEITERLEITUNG}/${slug}${p ? `?p=${encodeURIComponent(p)}` : ""}`;
}

export function weiterleitungsPfadBanner(anzeigeId: number, platzierung: string): string {
  const p = bereinigePlatzierung(platzierung);
  return `${WEITERLEITUNG}/banner/${anzeigeId}${p ? `?p=${encodeURIComponent(p)}` : ""}`;
}

export function istLive(partner: Partner | undefined | null): boolean {
  if (!partner) return false;
  return partner.aktiv === true && partner.zielLink.trim() !== "" && !partner.zielLink.includes("{{");
}

export function partnerFuer(anbieter: Pick<Anbieter, "partner">, partner: Partner[]): Partner | null {
  if (!anbieter.partner) return null;
  return partner.find((p) => p.schluessel === anbieter.partner) ?? null;
}

/**
 * Die tatsächliche Zieladresse beim Partner (nur serverseitig in der Weiterleitung verwendet).
 * Impact: Zielseite im Parameter u (URL kodiert, Tiefenlink auf die Produktseite), Platzierung als subId1.
 * Der Kurzlink des Betreibers bleibt dabei unverändert, es werden nur Parameter angehängt.
 * Alle anderen Partner: der freigegebene Link zeichengetreu.
 */
export function partnerZielFuer(
  anbieter: Pick<Anbieter, "partner" | "zielUrl" | "slug">,
  platzierung: string,
  partner: Partner[],
): { url: string; partner: string } | null {
  const p = partnerFuer(anbieter, partner);
  if (!p || !istLive(p)) return null;
  if (p.netzwerk === "Impact") {
    const trenner = p.zielLink.includes("?") ? "&" : "?";
    const sub = bereinigePlatzierung(platzierung);
    const url = `${p.zielLink}${trenner}u=${encodeURIComponent(anbieter.zielUrl)}${sub ? `&subId1=${encodeURIComponent(sub)}` : ""}`;
    return { url, partner: p.schluessel };
  }
  return { url: p.zielLink, partner: p.schluessel };
}

/** Link für Seiten und Buttons. Ohne live Partner ist das immer die direkte Herstellerseite (zielUrl), ohne Werbekennzeichnung. */
export function linkFuer(
  anbieter: Pick<Anbieter, "partner" | "zielUrl" | "slug">,
  platzierung: string,
  partner: Partner[],
): AusgehenderLink {
  const ziel = partnerZielFuer(anbieter, platzierung, partner);
  if (!ziel) return { href: anbieter.zielUrl, werbung: false, partner: null };
  return { href: weiterleitungsPfadAnbieter(anbieter.slug, platzierung), werbung: true, partner: ziel.partner };
}

export type BannerPlatzierung =
  | { art: "anbieterakte"; anbieter: Pick<Anbieter, "slug" | "baustein" | "partner"> }
  | { art: "startseite"; satz: "hr" | "erp" | "intacct" | "operations" }
  | { art: "baustein"; baustein: string };

/** Welcher Bannersatz darf auf dieser Seite stehen (laut werbemittel.einsatz)? Null, wenn keiner. */
export function bannerSatzFuer(platzierung: BannerPlatzierung, partner: Partner[]): { partner: Partner; satz: string } | null {
  const sage = partner.find((p) => p.schluessel === "sage");
  if (!sage || !istLive(sage) || !sage.werbemittel) return null;
  const passt = (satz: string) => (sage.werbemittel?.saetze[satz] ? { partner: sage, satz } : null);
  if (platzierung.art === "startseite") return passt(platzierung.satz);
  if (platzierung.art === "baustein") {
    return platzierung.baustein === "betrieb" ? passt("operations") : null;
  }
  const a = platzierung.anbieter;
  if (a.partner !== "sage") return null;
  if (["sage-100", "sage-50-handwerk"].includes(a.slug)) return passt("erp");
  if (a.slug === "sage-intacct") return passt("intacct");
  if (["personal", "lohn"].includes(a.baustein)) return passt("hr");
  // Für weitere Sage-Produkte ohne eigene Creative-Kampagne nutzen wir den allgemeinen ERP-Bannersatz.
  return passt("erp");
}
