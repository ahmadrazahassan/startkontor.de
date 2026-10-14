// Kennzahlen der Startseite. Externe Werte stehen in data/zahlen.json, alles zum Verzeichnis wird hier aus den Profilen berechnet.

import zahlenRoh from "../data/zahlen.json" with { type: "json" };
import { anbieter, anbieterNachSlug, bausteine } from "./daten.ts";
import type { Anbieter } from "./typen.ts";

export type Preiszeile = { slug: string; name: string; href: string; paket: string; betrag: number; text: string };

export const zahlenQuelle = zahlenRoh;

/** Deutsche Zahlenschreibweise: 4,50 oder 1.390 (ohne Nachkommastellen, wenn ganzzahlig). */
export function euro(betrag: number): string {
  const ganz = Number.isInteger(betrag);
  return `${betrag.toLocaleString("de-DE", { minimumFractionDigits: ganz ? 0 : 2, maximumFractionDigits: 2 })} Euro`;
}

function zeile(z: { slug: string; paket: string; betrag: number }): Preiszeile {
  const a = anbieterNachSlug.get(z.slug);
  if (!a) throw new Error(`zahlen.json: unbekannter Anbieter ${z.slug}`);
  return { slug: z.slug, name: a.name, href: a.url, paket: z.paket, betrag: z.betrag, text: euro(z.betrag) };
}

const istSage = (a: Anbieter) => a.partner === "sage";
const anteil = (teil: number, ganz: number) => Math.round((teil / ganz) * 100);

export function verzeichnisZahlen() {
  const gesamt = anbieter.length;
  const sage = anbieter.filter(istSage);
  const preis = { veroeffentlicht: 0, anfrage: 0, nichtVerifiziert: 0 };
  for (const a of anbieter) preis[a.preis.status] += 1;
  const kuendbar = (liste: Anbieter[]) => ({
    ja: liste.filter((a) => a.monatlichKuendbar === true).length,
    nein: liste.filter((a) => a.monatlichKuendbar === false).length,
    offen: liste.filter((a) => a.monatlichKuendbar == null).length,
  });
  return {
    gesamt,
    kategorien: bausteine.map((b) => {
      const alle = anbieter.filter((a) => a.baustein === b.slug);
      return { slug: b.slug, label: b.kurzname, anzahl: alle.length, sage: alle.filter(istSage).length };
    }),
    preis: { ...preis, anteilVeroeffentlicht: anteil(preis.veroeffentlicht, gesamt) },
    kuendbar: kuendbar(anbieter),
    sage: {
      anzahl: sage.length,
      anteil: anteil(sage.length, gesamt),
      preisVeroeffentlicht: sage.filter((a) => a.preis.status === "veroeffentlicht").length,
      kuendbar: kuendbar(sage),
      kategorien: bausteine.filter((b) => sage.some((a) => a.baustein === b.slug)).length,
      pauschal: zahlenRoh.sage.pauschal.map(zeile),
      jeNutzer: zahlenRoh.sage.jeNutzer.map(zeile),
      richtpreis: zeile(zahlenRoh.sage.richtpreis),
    },
  };
}
