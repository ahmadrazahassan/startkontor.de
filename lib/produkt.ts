// Reine Hilfen für die Review Seite eines Programms: Texte füllen, Beträge hervorheben, Datenzeilen und FAQ aufbauen.
// Kein Datenzugriff, damit alles ohne Build testbar ist. Alle Aussagen stammen aus den Daten des Anbieters.

import type { Anbieter, Herstellerprofil, ReviewTexte } from "./typen.ts";

/** Ersetzt {name}, {datum} und ähnliche Platzhalter. Unbekannte Platzhalter bleiben stehen. */
export function fuelle(vorlage: string, werte: Record<string, string>): string {
  return vorlage.replace(/\{(\w+)\}/g, (treffer, schluessel: string) => werte[schluessel] ?? treffer);
}

/** "A", "A und B", "A, B und C" */
export function listeMitUnd(teile: string[]): string {
  if (teile.length <= 1) return teile.join("");
  return `${teile.slice(0, -1).join(", ")} und ${teile[teile.length - 1]}`;
}

export type Textsegment = { text: string; fett: boolean };

const BETRAG = /(\d{1,3}(?:\.\d{3})*(?:,\d+)?\s(?:Euro|Prozent))/g;

/** Zerlegt einen Preistext so, dass Beträge ("29 Euro", "1.390 Euro", "50 Prozent") fett gesetzt werden können. */
export function hebeBetraegeHervor(text: string): Textsegment[] {
  return text
    .split(BETRAG)
    .map((teil, i) => ({ text: teil, fett: i % 2 === 1 }))
    .filter((s) => s.text !== "");
}

/** Eine Preiszeile mit Betrag ("Business 39 Euro oder 29 Euro") wird zur Preiskarte, alles andere bleibt Hinweis. */
export function istPreiszeile(text: string): boolean {
  return new RegExp(BETRAG.source).test(text);
}

function satz(text: string): string {
  const t = text.trim();
  return /[.!?]$/.test(t) ? t : `${t}.`;
}

export type Datenzeile = { schluessel: string; label: string; wert: string; link?: string };

export type DatenEingabe = {
  kategorie: string;
  stationen: { nummer: number; name: string }[];
  stationLabel: string;
  preisStatusText: string;
  hersteller?: Herstellerprofil;
  t: ReviewTexte["daten"];
};

function host(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Die Tabelle "auf einen Blick". Jede Zeile ist aus den Daten des Anbieters abgeleitet, nichts wird geschätzt. */
export function datenzeilen(a: Anbieter, e: DatenEingabe): Datenzeile[] {
  const { t } = e;
  const zeilen: Datenzeile[] = [
    { schluessel: "kategorie", label: t.kategorie, wert: e.kategorie },
    {
      schluessel: "phasen",
      label: t.phasen,
      wert: listeMitUnd(e.stationen.map((s) => `${e.stationLabel} ${s.nummer} (${s.name})`)),
    },
    { schluessel: "preisangabe", label: t.preisangabe, wert: e.preisStatusText },
  ];
  if (a.preis.status === "veroeffentlicht" && a.preis.anker) {
    zeilen.push({ schluessel: "einstieg", label: t.einstieg, wert: a.preis.anker });
  }
  zeilen.push(
    {
      schluessel: "kuendbar",
      label: t.kuendbar,
      wert: a.monatlichKuendbar === true ? t.ja : a.monatlichKuendbar === false ? t.nein : t.offen,
    },
    { schluessel: "vertrag", label: t.vertrag, wert: a.vertrag ?? t.offen },
    { schluessel: "funktionen", label: t.funktionen, wert: String(a.funktionen.length) },
    { schluessel: "grenzen", label: t.grenzen, wert: String(a.grenzen.length) },
    { schluessel: "quellen", label: t.quellen, wert: String(a.quellen.length) },
    { schluessel: "geprueft", label: t.geprueft, wert: a.geprueft },
  );
  if (e.hersteller) {
    zeilen.push(
      { schluessel: "unternehmen", label: t.unternehmen, wert: e.hersteller.unternehmen },
      { schluessel: "standort", label: t.standort, wert: `${e.hersteller.ort}, ${e.hersteller.land}` },
    );
  }
  zeilen.push({ schluessel: "website", label: t.website, wert: host(a.zielUrl), link: a.zielUrl });
  return zeilen;
}

export type FaqPunkt = { schluessel: string; frage: string; antwort: string[]; art: "absaetze" | "liste" };

export type FaqEingabe = {
  kategorie: string;
  /** Namen der anderen Programme derselben Kategorie, alphabetisch */
  alternativen: string[];
  nettoHinweis: string;
  keinEigenerTest: string;
  t: ReviewTexte["faq"];
};

/** Häufige Fragen, aufgebaut aus den belegten Angaben. Die Antworten sind die Sätze der Review Seite, nichts Neues. */
export function erzeugeFaq(a: Anbieter, e: FaqEingabe): FaqPunkt[] {
  const werte = { name: a.name, datum: a.geprueft, kategorie: e.kategorie };
  const f = (vorlage: string, extra: Record<string, string> = {}) => fuelle(vorlage, { ...werte, ...extra });

  const kosten: string[] = [a.preis.anker ? satz(a.preis.anker) : ""].filter(Boolean);
  if (a.preis.hinweis) kosten.push(satz(a.preis.hinweis));
  kosten.push(f(e.t.kostenStand));
  if (a.preis.status === "veroeffentlicht") kosten.push(satz(e.nettoHinweis));

  const kuendigung: string[] = [];
  if (a.monatlichKuendbar === true) kuendigung.push(satz(a.vertrag ?? `Ja, ${a.name} ist laut Hersteller monatlich kündbar`));
  else if (a.monatlichKuendbar === false) kuendigung.push(satz(a.vertrag ?? `Nein, ${a.name} ist laut Hersteller nicht monatlich kündbar`));
  else {
    kuendigung.push(f(e.t.kuendigungOffen));
    if (a.vertrag) kuendigung.unshift(satz(a.vertrag));
  }

  const punkte: FaqPunkt[] = [
    { schluessel: "kosten", frage: f(e.t.kosten), antwort: kosten, art: "absaetze" },
    { schluessel: "eignung", frage: f(e.t.eignung), antwort: a.fuerWen, art: "liste" },
    { schluessel: "wenigerEignung", frage: f(e.t.wenigerEignung), antwort: a.wenigerPassend, art: "liste" },
    { schluessel: "funktionen", frage: f(e.t.funktionen), antwort: a.funktionen, art: "liste" },
    { schluessel: "grenzen", frage: f(e.t.grenzen), antwort: a.grenzen, art: "liste" },
    { schluessel: "kuendigung", frage: f(e.t.kuendigung), antwort: kuendigung, art: "absaetze" },
    {
      schluessel: "test",
      frage: f(e.t.test),
      antwort: [`${e.t.testNein} ${e.keinEigenerTest}`, f(e.t.testQuellen)],
      art: "absaetze",
    },
  ];
  if (e.alternativen.length > 0) {
    punkte.push({
      schluessel: "alternativen",
      frage: f(e.t.alternativen),
      antwort: [f(e.t.alternativenAntwort, { liste: listeMitUnd(e.alternativen) })],
      art: "absaetze",
    });
  }
  return punkte.filter((p) => p.antwort.length > 0);
}
