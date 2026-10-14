import freigaben from "../data/affiliate-partner.json" with { type: "json" };
import type { Daten, Partner } from "./typen.ts";

/** Vom Betreiber freigegebene Links. Originaldaten und Trackingparameter bleiben erhalten. */
export function aktiviereAffiliatePartner(daten: Daten): void {
  for (const partner of freigaben.partner as Partner[]) {
    const url = new URL(partner.zielLink);
    if (url.protocol !== "https:" || url.hostname !== `www.${partner.schluessel}.com`) throw new Error(`Ungültiger Partnerlink: ${partner.schluessel}`);
    const vorhanden = daten.partner.anbieter.findIndex((p) => p.schluessel === partner.schluessel);
    if (vorhanden >= 0) daten.partner.anbieter[vorhanden] = structuredClone(partner);
    else daten.partner.anbieter.push(structuredClone(partner));
    for (const slug of partner.produkte) {
      const anbieter = daten.anbieter.find((a) => a.slug === slug);
      if (!anbieter) throw new Error(`Affiliatepartner ohne Softwareprofil: ${slug}`);
      anbieter.partner = partner.schluessel;
    }
  }
  daten.seiten.werbung.einleitung = "Startkontor ist Affiliatepartner von Pipedrive, weclapp und Odoo. Unsere Teilnahme an diesen Partnerprogrammen ist freigegeben. Wenn Sie über einen als Werbung gekennzeichneten Link ein Angebot nutzen, können wir eine Provision erhalten. Hier erklären wir, wie wir Werbung und Redaktion trennen.";
  daten.seiten.werbung.partnerstatus.textAktiv = "Für diese Anbieter bestehen freigegebene Affiliatepartnerschaften. Die Freigabe betrifft unsere Teilnahme am Partnerprogramm; unsere redaktionellen Einschätzungen entstehen unabhängig davon.";
  const faq = daten.faq.find((f) => f.id === "finanzierung");
  if (faq) faq.antwort = "Startkontor ist Affiliatepartner von Pipedrive, weclapp und Odoo. Wenn Sie über einen als Werbung gekennzeichneten Partnerlink ein Angebot nutzen, können wir eine Provision erhalten. Eine Provision beeinflusst weder die Inhalte noch die Reihenfolge. Die aktuellen Partnerschaften und unsere Regeln stehen unter Werbung und Partner.";
  const links = daten.seiten.datenschutz.abschnitte.find((a) => a.id === "links");
  if (links?.absaetze) links.absaetze[1] = "Ein als Werbung gekennzeichneter Partnerlink enthält feste Zuordnungskennungen für das Partnerprogramm. Nach Ihrem Klick können der Anbieter oder sein Partnernetzwerk Cookies oder ähnliche Kennungen setzen und Ihre IP Adresse verarbeiten, um Besuche oder Abschlüsse unserem Partnerkonto zuzuordnen und eine Provision abzurechnen. Die Links werden ohne Angaben aus Formularen oder Ihrem Bausteinplan aufgerufen.";
}
