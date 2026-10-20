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

/** Seitenpfad als Kennung: "/" → "startseite", sonst der Pfad ohne Schrägstriche am Rand, nur a-z, 0-9, /, _ und -, höchstens 100 Zeichen. */
export function bereinigeSeite(pfad: string | null | undefined): string | null {
  if (pfad == null) return null;
  const sauber = pfad
    .toLowerCase()
    .replace(/[^a-z0-9/_-]+/g, "-")
    .replace(/\/{2,}/g, "/")
    .slice(0, 100)
    .replace(/^[/-]+|[/-]+$/g, "");
  return sauber || "startseite";
}

export type ImpactHerkunft = { platzierung: string | null; seite: string | null; art: "textlink" | "banner" };

/**
 * Hängt die Impact-Kennungen an einen Trackinglink: sharedid = Website, subId1 = Platzierung, subId2 = Seite, subId3 = Linkart.
 * Lange Links (/c/…) aus dem Werbemittel-Export tragen keine Media Property, dort ergänzen wir partnerpropertyid,
 * sonst landet der Klick in Impact ohne Website. Die Kurzlinks aus "Create a link" enthalten sie bereits.
 */
export function mitImpactKennungen(link: string, p: Pick<Partner, "impact">, herkunft: ImpactHerkunft): string {
  const url = new URL(link);
  const zusatz = new URLSearchParams();
  if (p.impact && url.pathname.startsWith("/c/") && !url.searchParams.has("partnerpropertyid")) {
    zusatz.set("partnerpropertyid", String(p.impact.medienEigenschaft));
  }
  if (p.impact) zusatz.set("sharedid", p.impact.website);
  const platzierung = bereinigePlatzierung(herkunft.platzierung);
  if (platzierung) zusatz.set("subId1", platzierung);
  const seite = bereinigeSeite(herkunft.seite);
  if (seite) zusatz.set("subId2", seite);
  zusatz.set("subId3", herkunft.art);
  return `${link}${link.includes("?") ? "&" : "?"}${zusatz.toString()}`;
}

/**
 * Die tatsächliche Zieladresse beim Partner (nur serverseitig in der Weiterleitung verwendet).
 * Impact: der im Konto erzeugte Produktlink (Zielseite hinterlegt). Fehlt er, der Kurzlink des Betreibers mit
 * Tiefenlink im Parameter u. Dazu Website, Platzierung, Seite und Linkart als Kennungen (siehe mitImpactKennungen).
 * Der Kurzlink selbst bleibt unverändert, es werden nur Parameter angehängt.
 * Alle anderen Partner: der freigegebene Link zeichengetreu.
 */
export function partnerZielFuer(
  anbieter: Pick<Anbieter, "partner" | "zielUrl" | "slug">,
  platzierung: string,
  partner: Partner[],
  seite: string | null = null,
): { url: string; partner: string } | null {
  const p = partnerFuer(anbieter, partner);
  if (!p || !istLive(p)) return null;
  if (p.netzwerk === "Impact") {
    const produktLink = p.produktLinks?.[anbieter.slug];
    const basis = produktLink ?? `${p.zielLink}${p.zielLink.includes("?") ? "&" : "?"}u=${encodeURIComponent(anbieter.zielUrl)}`;
    return { url: mitImpactKennungen(basis, p, { platzierung, seite, art: "textlink" }), partner: p.schluessel };
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
