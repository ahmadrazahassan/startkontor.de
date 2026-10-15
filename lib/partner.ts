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
 * Impact: Zielseite im Parameter u (URL kodiert), Platzierung als subId1.
 * Die genauen Parameter muss der Betreiber vor der Aktivierung beim Partnermanagement bestätigen.
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
  if (p.netzwerk === "Impact") {
    const trenner = p.zielLink.includes("?") ? "&" : "?";
    const href = `${p.zielLink}${trenner}u=${encodeURIComponent(anbieter.zielUrl)}&subId1=${encodeURIComponent(platzierung)}`;
    return { href, werbung: true, partner: p.schluessel };
  }
  return { href: p.zielLink, werbung: true, partner: p.schluessel };
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
