// Auswertungen für die Grafiken im Softwareprofil. Reine Funktionen ohne Datenzugriff.
// Alles wird aus belegten Angaben des Profils berechnet. Es gibt keine geschätzten oder erfundenen Werte.

import { istPreiszeile } from "./produkt.ts";
import type { Anbieter } from "./typen.ts";

export type Kriterium = { schluessel: string; label: string; wert: number; grund: string };
export type Transparenz = { gesamt: number; einordnung: string; kriterien: Kriterium[] };

export type TransparenzEingabe = Pick<Anbieter, "preis" | "monatlichKuendbar" | "vertrag" | "grenzen" | "quellen"> & {
  /** Es liegt ein Herstellerprofil mit Unternehmen und Ort vor. */
  herstellerprofil: boolean;
  /** Es liegt eine ausführliche Analyse mit Hinweis zum deutschen Markt vor. */
  analyse: boolean;
};

const runde1 = (n: number) => Math.round(n * 10) / 10;

function anzahlWort(n: number, einzahl: string, mehrzahl: string): string {
  return `${n} ${n === 1 ? einzahl : mehrzahl}`;
}

/** Sechs Kriterien von 1 bis 5 dazu, wie nachvollziehbar Preis, Vertrag und Quellen belegt sind. Es ist keine Qualitätsnote. */
export function transparenzwert(e: TransparenzEingabe): Transparenz {
  const preisstufen = (e.preis.zeilen ?? []).filter(istPreiszeile).length;
  const grenzen = e.grenzen.length;
  const quellen = e.quellen.length;

  const preis: Kriterium =
    e.preis.status === "veroeffentlicht"
      ? { schluessel: "preis", label: "Preisangabe", wert: 5, grund: "Preis in Euro veröffentlicht" }
      : e.preis.status === "anfrage"
        ? { schluessel: "preis", label: "Preisangabe", wert: 2, grund: "Preis nur auf Anfrage" }
        : { schluessel: "preis", label: "Preisangabe", wert: 1, grund: "Kein verifizierter Listenpreis" };

  const stufen: Kriterium = {
    schluessel: "stufen",
    label: "Preisstufen",
    wert: e.preis.status !== "veroeffentlicht" ? 1 : preisstufen >= 3 ? 5 : preisstufen === 2 ? 4 : 3,
    grund:
      e.preis.status !== "veroeffentlicht"
        ? "Keine Beträge zum Vergleichen"
        : preisstufen === 0
          ? "Nur ein Einstiegspreis genannt"
          : `${anzahlWort(preisstufen, "Zeile", "Zeilen")} mit Betrag`,
  };

  const vertrag: Kriterium = {
    schluessel: "vertrag",
    label: "Vertragsangaben",
    wert: e.monatlichKuendbar === null ? (e.vertrag ? 3 : 1) : 5,
    grund:
      e.monatlichKuendbar === true
        ? "Monatliche Kündbarkeit belegt"
        : e.monatlichKuendbar === false
          ? "Bindung ausdrücklich genannt"
          : e.vertrag
            ? "Kündigungsfrist nicht belegt"
            : "Keine Vertragsangaben",
  };

  const grenzenKriterium: Kriterium = {
    schluessel: "grenzen",
    label: "Grenzen benannt",
    wert: grenzen >= 3 ? 5 : grenzen === 2 ? 4 : grenzen === 1 ? 3 : 1,
    grund: grenzen === 0 ? "Keine Grenzen dokumentiert" : `${anzahlWort(grenzen, "Grenze", "Grenzen")} und Ausschlüsse`,
  };

  const quellenKriterium: Kriterium = {
    schluessel: "quellen",
    label: "Quellenlage",
    wert: quellen >= 3 ? 5 : quellen === 2 ? 4 : quellen === 1 ? 3 : 1,
    grund: quellen === 0 ? "Keine Quelle genannt" : `${anzahlWort(quellen, "Quelle", "Quellen")} verlinkt`,
  };

  const hersteller: Kriterium = {
    schluessel: "hersteller",
    label: "Herstellerangaben",
    wert: e.herstellerprofil ? 5 : e.analyse ? 3 : 1,
    grund: e.herstellerprofil ? "Unternehmen und Standort belegt" : e.analyse ? "Marktbezug belegt, Firmendaten offen" : "Keine Firmendaten",
  };

  const kriterien = [preis, stufen, vertrag, grenzenKriterium, quellenKriterium, hersteller];
  const gesamt = runde1(kriterien.reduce((summe, k) => summe + k.wert, 0) / kriterien.length);
  const einordnung = gesamt >= 4.5 ? "Sehr gut belegt" : gesamt >= 3.5 ? "Gut belegt" : gesamt >= 2.5 ? "Teilweise belegt" : "Lückenhaft belegt";
  return { gesamt, einordnung, kriterien };
}

export type Tarifstufe = { name: string; betrag: number; zusatz?: string };
export type Tarife = { einheit: string; stufen: Tarifstufe[] };

/** Deutsche Schreibweise eines Betrags: 7,90 oder 29 oder 1.390. */
export function betragText(betrag: number): string {
  const ganz = Number.isInteger(betrag);
  return betrag.toLocaleString("de-DE", { minimumFractionDigits: ganz ? 0 : 2, maximumFractionDigits: 2 });
}

export type PreisPunkt = { slug: string; name: string; betrag: number; baustein: string; href: string };
export type PreisGruppe = { schluessel: "pauschal" | "jeNutzer"; titel: string; einheit: string; punkte: PreisPunkt[] };

export function median(werte: number[]): number {
  const s = [...werte].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export type Preisposition = {
  gruppe: PreisGruppe;
  aktuell: PreisPunkt;
  median: number;
  /** Rang nach Preis, 1 ist der niedrigste Einstiegspreis. Keine Qualitätsaussage. */
  rang: number;
  anzahl: number;
  /** Abweichung vom Median in Prozent, gerundet. Negativ heißt günstiger. */
  abweichung: number;
};

/** Ordnet den Einstiegspreis eines Programms in seine Vergleichsgruppe ein. Gibt null zurück, wenn es keinen vergleichbaren Betrag gibt. */
export function preisposition(slug: string, gruppen: PreisGruppe[]): Preisposition | null {
  for (const gruppe of gruppen) {
    const aktuell = gruppe.punkte.find((p) => p.slug === slug);
    if (!aktuell) continue;
    const sortiert = [...gruppe.punkte].sort((a, b) => a.betrag - b.betrag || a.name.localeCompare(b.name, "de"));
    const m = median(gruppe.punkte.map((p) => p.betrag));
    return {
      gruppe,
      aktuell,
      median: m,
      rang: sortiert.findIndex((p) => p.slug === slug) + 1,
      anzahl: gruppe.punkte.length,
      abweichung: Math.round(((aktuell.betrag - m) / m) * 100),
    };
  }
  return null;
}

/** Position von 0 bis 1 auf einer logarithmischen Achse. Streut niedrige Preise auseinander, ohne hohe zu verstecken. */
export function logPosition(wert: number, min: number, max: number): number {
  if (max <= min) return 0.5;
  return (Math.log(wert) - Math.log(min)) / (Math.log(max) - Math.log(min));
}

export type Profilzahlen = { label: string; wert: number; maximum: number }[];

/** Wie viel das Profil belegt: Funktionen, Grenzen, Fragen für das Gespräch und Quellen. Es sind echte Zähler der Profildaten. */
export function profilzahlen(a: Pick<Anbieter, "funktionen" | "grenzen" | "fragen" | "quellen">): Profilzahlen {
  const wert = [
    { label: "Funktionen", wert: a.funktionen.length },
    { label: "Grenzen", wert: a.grenzen.length },
    { label: "Fragen für das Gespräch", wert: a.fragen.length },
    { label: "Quellen", wert: a.quellen.length },
  ];
  const maximum = Math.max(...wert.map((w) => w.wert), 1);
  return wert.map((w) => ({ ...w, maximum }));
}
