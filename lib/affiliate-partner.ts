import freigaben from "../data/affiliate-partner.json" with { type: "json" };
import type { Daten, Partner } from "./typen.ts";

/** Vom Betreiber freigegebene Links. Originaldaten und Trackingparameter bleiben erhalten. */
export function aktiviereAffiliatePartner(daten: Daten): void {
  for (const partner of freigaben.partner as Partner[]) {
    const url = new URL(partner.zielLink);
    const erlaubteHosts: Record<string, string> = {
      sage: "sagegmbh.sjv.io",
      pipedrive: "www.pipedrive.com",
      weclapp: "www.weclapp.com",
      odoo: "www.odoo.com",
    };
    if (url.protocol !== "https:" || url.hostname !== erlaubteHosts[partner.schluessel]) throw new Error(`Ungültiger Partnerlink: ${partner.schluessel}`);
    const vorhanden = daten.partner.anbieter.findIndex((p) => p.schluessel === partner.schluessel);
    const bestehenderPartner = vorhanden >= 0 ? daten.partner.anbieter[vorhanden] : null;
    const aktivierterPartner = structuredClone(partner);
    if (!aktivierterPartner.werbemittel && bestehenderPartner?.werbemittel) {
      aktivierterPartner.werbemittel = structuredClone(bestehenderPartner.werbemittel);
    }
    if (vorhanden >= 0) daten.partner.anbieter[vorhanden] = aktivierterPartner;
    else daten.partner.anbieter.push(aktivierterPartner);
    for (const slug of partner.produkte) {
      const anbieter = daten.anbieter.find((a) => a.slug === slug);
      if (!anbieter) throw new Error(`Affiliatepartner ohne Softwareprofil: ${slug}`);
      anbieter.partner = partner.schluessel;
    }
  }
  daten.seiten.werbung.einleitung = "Startkontor ist Affiliatepartner von Sage, Pipedrive, weclapp und Odoo. Unsere Teilnahme an diesen Partnerprogrammen ist freigegeben. Wenn Sie über einen als Werbung gekennzeichneten Link ein Angebot nutzen, können wir eine Provision erhalten. Hier erklären wir, wie wir Werbung und Redaktion trennen.";
  daten.seiten.werbung.partnerstatus.textAktiv = "Für diese Anbieter bestehen freigegebene Affiliatepartnerschaften. Die Freigabe betrifft unsere Teilnahme am Partnerprogramm; unsere redaktionellen Einschätzungen entstehen unabhängig davon.";
  const faq = daten.faq.find((f) => f.id === "finanzierung");
  if (faq) faq.antwort = "Startkontor ist Affiliatepartner von Sage, Pipedrive, weclapp und Odoo. Wenn Sie über einen als Werbung gekennzeichneten Partnerlink ein Angebot nutzen, können wir eine Provision erhalten. Eine Provision beeinflusst weder die Inhalte noch die Reihenfolge. Die aktuellen Partnerschaften und unsere Regeln stehen unter Werbung und Partner.";
  const links = daten.seiten.datenschutz.abschnitte.find((a) => a.id === "links");
  if (links?.absaetze) {
    links.absaetze[0] = "Normale externe Anbieterlinks übertragen erst beim Anklicken Daten an das Ziel. Werbebanner von Sage werden als Bild direkt von Impact geladen, damit wir die Originalmotive nicht kopieren oder auf unserem Server speichern. Dabei erhält Impact technische Verbindungsdaten wie Ihre IP Adresse und Browserangaben. Die Bildanfrage sendet keine Seitenadresse von Startkontor mit.";
    links.absaetze[1] = "Ein als Werbung gekennzeichneter Partnerlink führt über das Partnernetzwerk und enthält eine feste Anzeigenkennung. Beim Klick verarbeitet Impact technische Verbindungsdaten, um den Klick Startkontor zuzuordnen. Sage oder sein Partnernetzwerk können beim anschließenden Besuch Cookies oder ähnliche Kennungen verwenden, um einen späteren Abschluss zuzuordnen und eine Provision abzurechnen. Angaben aus Formularen oder Ihrem Bausteinplan werden nicht an den Partnerlink angehängt.";
    links.absaetze[2] = "Für die Banner laden wir ausschließlich das jeweilige Bild von Impact. Ein zusätzlicher Pixel zur Messung von Anzeigen oder Einblendungen wird nicht eingebunden. Der Klick führt über den zum Motiv gehörenden Trackinglink aus dem Export von Sage. Die Bilddateien liegen nicht auf unserem Server.";
  }
}
