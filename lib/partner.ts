// Partnerlinks und Werbemittel. Standard: alles aus. Ein Partner ist nur live, wenn
// aktiv === true UND der Ziellink keinen Platzhalter mehr enthält.

import type { Anbieter, Partner } from "./typen.ts";

export type AusgehenderLink = {
  href: string;
  /** true nur bei aktivem Partner: rel="sponsored", sichtbares Label "Werbung", neuer Tab */
  werbung: boolean;
  partner: string | null;
};

export function istLive(partner: Partner | undefined | null): boolean {
  if (!partner) return false;
  return partner.aktiv === true && partner.zielLink.trim() !== "" && !partner.zielLink.includes("{{");
}

export function partnerFuer(anbieter: Pick<Anbieter, "partner">, partner: Partner[]): Partner | null {
  if (!anbieter.partner) return null;
  return partner.find((p) => p.schluessel === anbieter.partner) ?? null;
}

/**
 * Baut den ausgehenden Link. Ohne live Partner ist das immer die direkte Herstellerseite (zielUrl).
 * Impact: Standard ist der Trackinglink unverändert, so wie ihn das Partnerkonto liefert.
 * Nur mit tiefenlinks === true werden Zielseite (u, URL kodiert) und Platzierung (subId1) angehängt.
 * Das darf der Betreiber erst aktivieren, wenn das Partnerprogramm Tiefenlinks ausdrücklich erlaubt.
 */
export function linkFuer(
  anbieter: Pick<Anbieter, "partner" | "zielUrl" | "slug">,
  platzierung: string,
  partner: Partner[],
): AusgehenderLink {
  const p = partnerFuer(anbieter, partner);
  if (!p || !istLive(p)) {
    return { href: anbieter.zielUrl, werbung: false, partner: null };
  }
  if (p.netzwerk === "Impact" && p.tiefenlinks === true) {
    const trenner = p.zielLink.includes("?") ? "&" : "?";
    const href = `${p.zielLink}${trenner}u=${encodeURIComponent(anbieter.zielUrl)}&subId1=${encodeURIComponent(platzierung)}`;
    return { href, werbung: true, partner: p.schluessel };
  }
  return { href: p.zielLink, werbung: true, partner: p.schluessel };
}

export type BannerPlatzierung =
  | { art: "anbieterakte"; anbieter: Pick<Anbieter, "slug" | "baustein" | "partner"> }
  | { art: "baustein"; baustein: string };

/** Welcher Bannersatz darf auf dieser Seite stehen (laut werbemittel.einsatz)? Null, wenn keiner. */
export function bannerSatzFuer(platzierung: BannerPlatzierung, partner: Partner[]): { partner: Partner; satz: string } | null {
  const sage = partner.find((p) => p.schluessel === "sage");
  if (!sage || !istLive(sage) || !sage.werbemittel) return null;
  if (platzierung.art === "baustein") {
    return platzierung.baustein === "betrieb" ? { partner: sage, satz: "operations" } : null;
  }
  const a = platzierung.anbieter;
  if (a.partner !== "sage") return null;
  if (["sage-100", "sage-50-handwerk"].includes(a.slug)) return { partner: sage, satz: "erp" };
  if (a.slug === "sage-intacct") return { partner: sage, satz: "intacct" };
  if (["personal", "lohn"].includes(a.baustein)) return { partner: sage, satz: "hr" };
  return null;
}

/** Link eines Banners: bei Impact mit erlaubten Tiefenlinks auf die Landingpage des Bannersatzes, sonst der Trackinglink. Nur bei live Partner aufrufen. */
export function bannerLink(partner: Partner, landing: string, platzierung: string): string {
  if (partner.netzwerk === "Impact" && partner.tiefenlinks === true) {
    const trenner = partner.zielLink.includes("?") ? "&" : "?";
    return `${partner.zielLink}${trenner}u=${encodeURIComponent(landing)}&subId1=${encodeURIComponent(platzierung)}`;
  }
  return partner.zielLink;
}
