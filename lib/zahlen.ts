// Kennzahlen der Startseite. Externe Werte stehen in data/zahlen.json, alles zum Verzeichnis wird hier aus den Profilen berechnet.

import zahlenRoh from "../data/zahlen.json" with { type: "json" };
import { anbieter, anbieterNachSlug, bausteine } from "./daten.ts";

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

const anteil = (teil: number, ganz: number) => Math.round((teil / ganz) * 100);

const median = (w: number[]) => {
  const s = [...w].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

function rangliste(liste: { slug: string; paket: string; betrag: number }[]) {
  const zeilen = liste.map(zeile).sort((a, b) => a.betrag - b.betrag);
  const betraege = zeilen.map((r) => r.betrag);
  return { zeilen, median: median(betraege), medianText: euro(median(betraege)), max: Math.max(...betraege), guenstig: zeilen[0], teuer: zeilen[zeilen.length - 1] };
}

export function verzeichnisZahlen() {
  const gesamt = anbieter.length;
  const preis = { veroeffentlicht: 0, anfrage: 0, nichtVerifiziert: 0 };
  for (const a of anbieter) preis[a.preis.status] += 1;
  const kuendbar = {
    ja: anbieter.filter((a) => a.monatlichKuendbar === true).length,
    nein: anbieter.filter((a) => a.monatlichKuendbar === false).length,
    offen: anbieter.filter((a) => a.monatlichKuendbar == null).length,
  };
  const p = zahlenRoh.preise;
  return {
    gesamt,
    kategorienAnzahl: bausteine.length,
    kategorien: bausteine.map((b) => {
      const alle = anbieter.filter((a) => a.baustein === b.slug);
      const mitPreis = alle.filter((a) => a.preis.status === "veroeffentlicht").length;
      return { slug: b.slug, label: b.kurzname, anzahl: alle.length, mitPreis, anteil: anteil(mitPreis, alle.length) };
    }),
    preis: { ...preis, anteilVeroeffentlicht: anteil(preis.veroeffentlicht, gesamt) },
    kuendbar,
    gratis: p.gratis.map((slug) => anbieterNachSlug.get(slug)?.name ?? slug),
    pauschal: rangliste(p.pauschal),
    jeNutzer: rangliste(p.jeNutzer),
    darueber: p.darueber.map(zeile),
  };
}
