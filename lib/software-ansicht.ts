// Aufbereitung der Anbieterdaten für Software Karten (Startseite, Reviews). Nur Server, prüft Logodateien.

import type { SoftwareKarteDaten, SoftwareKarteTexte } from "../components/software-karte.tsx";
import { holeLogo } from "./bilder.ts";
import { bausteinNachSlug, bewertungen, partner, startseite, ui } from "./daten.ts";
import { linkFuer } from "./partner.ts";
import { preisText } from "./anbieter-ansicht.ts";
import type { Anbieter } from "./typen.ts";

export function softwareKarte(a: Anbieter, platzierung = "softwarekarte"): SoftwareKarteDaten {
  const fakten: SoftwareKarteDaten["fakten"] = [{ text: preisText(a) }];
  if (a.monatlichKuendbar === true) fakten.push({ text: ui.anbieterFilter.vertrag, ton: "ok" });
  const bewertung = bewertungen.get(a.slug)?.gesamt;
  return {
    slug: a.slug,
    name: a.name,
    href: a.url,
    kategorie: bausteinNachSlug.get(a.baustein)?.name ?? a.baustein,
    kurz: a.kurz,
    logo: holeLogo(a.slug),
    fakten,
    geprueft: a.geprueft,
    hersteller: linkFuer(a, `${platzierung}-${a.slug}`, partner),
    ...(bewertung !== undefined ? { bewertung } : {}),
  };
}

export const softwareKarteTexte: SoftwareKarteTexte = {
  reviewLesen: startseite.zuletzt.reviewLesen,
  geprueftAm: startseite.zuletzt.geprueftAm,
  von: startseite.review.von,
};
