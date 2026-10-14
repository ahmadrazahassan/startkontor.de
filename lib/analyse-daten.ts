// Verbindet die reinen Auswertungen aus analyse.ts mit den Daten des Portals.

import tarifeRoh from "../data/tarife.json" with { type: "json" };
import zahlenRoh from "../data/zahlen.json" with { type: "json" };
import { preisposition, type PreisGruppe, type Tarife } from "./analyse.ts";
import { anbieterNachSlug } from "./daten.ts";

function gruppe(schluessel: PreisGruppe["schluessel"], titel: string, einheit: string, liste: { slug: string; betrag: number }[]): PreisGruppe {
  return {
    schluessel,
    titel,
    einheit,
    punkte: liste.flatMap((z) => {
      const a = anbieterNachSlug.get(z.slug);
      return a ? [{ slug: z.slug, name: a.name, betrag: z.betrag, baustein: a.baustein, href: a.url }] : [];
    }),
  };
}

export const preisGruppen: PreisGruppe[] = [
  gruppe("pauschal", "Pauschalpreis je Monat", "im Monat", zahlenRoh.preise.pauschal),
  gruppe("jeNutzer", "Preis je Nutzer und Monat", "je Nutzer und Monat", zahlenRoh.preise.jeNutzer),
];

export const preisPositionFuer = (slug: string) => preisposition(slug, preisGruppen);

const profile = tarifeRoh.profile as Record<string, Tarife>;
export const tarifeFuer = (slug: string): Tarife | null => profile[slug] ?? null;
