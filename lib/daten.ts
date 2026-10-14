// Zentraler, typisierter Zugriff auf data/startkontor-daten.json.
// Lädt die Daten einmal, setzt Platzhalter aus config/betreiber.json ein und prüft alle
// Verweise. Ein gebrochener Verweis lässt den Build fehlschlagen.

import { existsSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import rohdaten from "../data/startkontor-daten.json" with { type: "json" };
import standardBetreiber from "../config/betreiber.json" with { type: "json" };
import ergaenzungen from "../data/ui-ergaenzungen.json" with { type: "json" };
import startseiteRoh from "../data/startseite.json" with { type: "json" };
import bewertungenRoh from "../data/bewertungen.json" with { type: "json" };
import begriffe from "../data/begriffe.json" with { type: "json" };
import herstellerRoh from "../data/hersteller.json" with { type: "json" };
import softwareNeu from "../data/software-erweiterungen.json" with { type: "json" };
import { ergaenzeSoftware, type SoftwareErgaenzungen } from "./software-erweiterungen.ts";
import { MARKENZEICHEN } from "./markenzeichen.ts";
import { aktiviereAffiliatePartner } from "./affiliate-partner.ts";
import { wendeBegriffeAn, type Aenderung } from "./begriffe.ts";
import { enthaeltInlineMarkup, parseInline, sammleLinks } from "./inline.ts";
import { fuelleRekursiv, type Betreiber } from "./platzhalter.ts";
import { sortiereAlphabetisch } from "./filter.ts";
import type {
  Anbieter,
  Baustein,
  Bewertung,
  Checkliste,
  Daten,
  FaqEintrag,
  Frist,
  Glossarbegriff,
  Herstellerprofil,
  Leitfaden,
  Startseite,
  SoftwareReview,
  Station,
} from "./typen.ts";

function ladeBetreiber(): Betreiber {
  const datei = process.env.BETREIBER_DATEI;
  if (datei) {
    // Nur Dateien aus config/ erlauben. Der feste Ordner hält das Build Tracing klein.
    const voll = join(process.cwd(), "config", basename(datei));
    if (!existsSync(voll)) throw new Error(`BETREIBER_DATEI nicht gefunden: ${voll}`);
    return JSON.parse(readFileSync(voll, "utf8")) as Betreiber;
  }
  return standardBetreiber as Betreiber;
}

/** Fügt data/ui-ergaenzungen.json unter ui ein. Ein vorhandener Schlüssel wird nie überschrieben, sondern gemeldet. */
function ergaenzeUi(roh: Daten): Daten {
  const kopie = structuredClone(roh) as Daten;
  const ziel = kopie.ui as unknown as Record<string, Record<string, unknown>>;
  const quelle = ergaenzungen.ui as Record<string, Record<string, unknown>>;
  for (const [gruppe, eintraege] of Object.entries(quelle)) {
    ziel[gruppe] = ziel[gruppe] ?? {};
    for (const [schluessel, wert] of Object.entries(eintraege)) {
      if (schluessel in ziel[gruppe]) {
        throw new Error(`ui-ergaenzungen.json: ui.${gruppe}.${schluessel} existiert bereits in den Daten`);
      }
      ziel[gruppe][schluessel] = wert;
    }
  }
  return kopie;
}

export const betreiber: Betreiber = ladeBetreiber();
// Reihenfolge: Ergänzungen, Begriffe (data/begriffe.json), dann Platzhalter des Betreibers
export const daten: Daten = ergaenzeSoftware(fuelleRekursiv(
  wendeBegriffeAn(ergaenzeUi(rohdaten as unknown as Daten), begriffe.aenderungen as Aenderung[]),
  betreiber,
), softwareNeu as unknown as SoftwareErgaenzungen);
aktiviereAffiliatePartner(daten);
daten.marke.logo.zeichenSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><path d="${MARKENZEICHEN.haupt}" fill="#095fbb"/><path d="${MARKENZEICHEN.neben}" fill="#7aacdc"/></svg>`;
const medienFaq = daten.faq.find((f) => f.id === "herstellermaterial");
if (medienFaq) {
  medienFaq.frage = "Woher stammen die Softwarebilder und Produktvideos?";
  medienFaq.antwort = "Die Bilder und Videos stammen aus offiziellen Herstellerseiten, Hilfezentren und Herstellerkanälen. Die Bildquelle steht direkt bei der Abbildung. Ältere Vorführungen und englische Originaloberflächen sind gekennzeichnet. Die Medien ergänzen unsere Recherche und sind kein eigener Praxistest.";
}
for (const abschnitt of daten.seiten.impressum.abschnitte) {
  if (abschnitt.absaetze) abschnitt.absaetze = abschnitt.absaetze.map((p) => p.replace("Abbildungen, Videos und Unterlagen von Herstellern veröffentlichen wir nur mit schriftlicher Freigabe.", "Softwarebilder und Produktvideos sind mit ihrer offiziellen Quelle gekennzeichnet. Sie dienen der Einordnung der Programme und begründen keine Partnerschaft mit dem Hersteller."));
}
const datenschutzMedien = daten.seiten.datenschutz.abschnitte;
datenschutzMedien.splice(datenschutzMedien.findIndex((a) => a.id === "empfaenger"), 0, {
  id: "produktvideos", titel: "Softwarebilder und Produktvideos",
  absaetze: [
    "Die Softwarebilder und Vorschaubilder werden von unserem eigenen Server geladen. Dabei entsteht keine Verbindung zum jeweiligen Hersteller oder Videodienst.",
    "Ein Produktvideo wird erst geladen, wenn Sie Video laden auswählen. Danach verbindet sich Ihr Browser mit YouTube, Vimeo oder dem beim Video genannten Hersteller und dessen Videohost. Dabei werden unter anderem Ihre IP Adresse und technische Angaben Ihres Browsers an diesen Dienst übermittelt. Der Dienst kann Cookies oder ähnliche Kennungen verwenden. YouTube Videos verwenden wir im erweiterten Datenschutzmodus. Für die weitere Verarbeitung gelten die Datenschutzhinweise des jeweiligen Anbieters. Alternativ können Sie das Video über Extern ansehen aufrufen.",
  ],
});
const empfaenger = datenschutzMedien.find((a) => a.id === "empfaenger");
if (empfaenger?.absaetze) empfaenger.absaetze = empfaenger.absaetze.map((p) => p === "Eine Übermittlung Ihrer Daten an weitere Dritte findet nur statt, wenn wir dazu gesetzlich verpflichtet sind." ? "Bei ausdrücklich aufgerufenen externen Angeboten und Produktvideos erhält auch der jeweilige Dienst technische Verbindungsdaten. Weitere Übermittlungen können erfolgen, wenn wir dazu gesetzlich verpflichtet sind." : p);
export const softwareReviews = new Map<string, SoftwareReview>(Object.entries(softwareNeu.reviews as Record<string, SoftwareReview>));

export const {
  marke,
  navigation,
  ui,
  seiten,
  seo,
  planer,
  kennzahlen,
  routen,
  stationen,
  bausteine,
  anbieter,
  leitfaeden,
  checklisten,
  fristen,
  glossar,
  faq,
} = daten;
export const partner = daten.partner.anbieter;

/** Texte der Review Portal Startseite (data/startseite.json). */
export const startseite = startseiteRoh as unknown as Startseite;

/** Redaktionelle Bewertungen je Anbieter Slug. Leer, solange die Redaktion nichts einträgt. */
export const bewertungen: Map<string, Bewertung> = new Map(
  Object.entries((bewertungenRoh as { bewertungen: Record<string, Bewertung> }).bewertungen),
);
/** Unternehmen und Ort je Anbieter Slug (data/hersteller.json), jeweils mit Quelle und Prüfdatum. */
export const hersteller: Map<string, Herstellerprofil> = new Map(
  Object.entries((herstellerRoh as { profile: Record<string, Herstellerprofil> }).profile),
);
export const bilderPlaetze = daten.bilder.plaetze;

// Nachschlagetabellen

function karte<T>(liste: T[], schluessel: (x: T) => string, name: string): Map<string, T> {
  const m = new Map<string, T>();
  for (const x of liste) {
    const k = schluessel(x);
    if (m.has(k)) throw new Error(`Doppelter Schlüssel in ${name}: ${k}`);
    m.set(k, x);
  }
  return m;
}

export const stationNachSlug = karte(stationen, (s) => s.slug, "stationen");
export const bausteinNachSlug = karte(bausteine, (b) => b.slug, "bausteine");
export const anbieterNachSlug = karte(anbieter, (a) => a.slug, "anbieter");
export const leitfadenNachSlug = karte(leitfaeden, (l) => l.slug, "leitfaeden");
export const checklisteNachSlug = karte(checklisten, (c) => c.slug, "checklisten");
export const glossarNachSlug = karte(glossar, (g) => g.slug, "glossar");
export const fristNachId = karte(fristen, (f) => f.id, "fristen");
export const faqNachId = karte(faq, (f) => f.id, "faq");
export const routenMenge = new Set(routen);

function hole<T>(m: Map<string, T>, schluessel: string, was: string): T {
  const wert = m.get(schluessel);
  if (!wert) throw new Error(`Unbekannt: ${was} "${schluessel}"`);
  return wert;
}

export const getStation = (slug: string): Station => hole(stationNachSlug, slug, "Station");
export const getBaustein = (slug: string): Baustein => hole(bausteinNachSlug, slug, "Baustein");
export const getAnbieter = (slug: string): Anbieter => hole(anbieterNachSlug, slug, "Anbieter");
export const getLeitfaden = (slug: string): Leitfaden => hole(leitfadenNachSlug, slug, "Leitfaden");
export const getCheckliste = (slug: string): Checkliste => hole(checklisteNachSlug, slug, "Checkliste");
export const getGlossar = (slug: string): Glossarbegriff => hole(glossarNachSlug, slug, "Glossarbegriff");
export const getFrist = (id: string): Frist => hole(fristNachId, id, "Frist");
export const getFaq = (id: string): FaqEintrag => hole(faqNachId, id, "FAQ");

// Abgeleitete Listen. Anbieter werden überall alphabetisch geführt, nie nach Preis oder Partner.

export const anbieterAlphabetisch: Anbieter[] = sortiereAlphabetisch(anbieter);

export function anbieterFuerBaustein(bausteinId: string): Anbieter[] {
  return anbieterAlphabetisch.filter((a) => a.baustein === bausteinId);
}

export function anbieterFuerStation(stationSlug: string): Anbieter[] {
  return anbieterAlphabetisch.filter((a) => a.stationen.includes(stationSlug));
}

export function stationenFuerBaustein(bausteinId: string): Station[] {
  return getBaustein(bausteinId).stationen.map(getStation);
}

export function leitfaedenFuerAnbieter(anbieterSlug: string): Leitfaden[] {
  return leitfaeden.filter((l) => l.verwandt.anbieter.includes(anbieterSlug));
}

export function leitfaedenMitCheckliste(checklisteId: string): Leitfaden[] {
  return leitfaeden.filter((l) => l.bloecke.some((b) => b.typ === "checkliste" && b.id === checklisteId));
}

// Prüfung (Build bricht bei Fehlern ab)

const BLOCKTYPEN = new Set([
  "zwischentitel",
  "absatz",
  "tabelle",
  "liste",
  "nummeriert",
  "hinweis",
  "achtung",
  "merksatz",
  "checkliste",
]);

function pfadOhneAnker(href: string): string {
  return href.split("#")[0].split("?")[0] || "/";
}

export function pruefeDaten(d: Daten): string[] {
  const fehler: string[] = [];
  const fehlt = (was: string) => fehler.push(was);

  // Zahlen
  const soll = d.kennzahlen;
  const ist: Record<string, number> = {
    stationen: d.stationen.length,
    bausteine: d.bausteine.length,
    anbieter: d.anbieter.length,
    leitfaeden: d.leitfaeden.length,
    checklisten: d.checklisten.length,
    fristen: d.fristen.length,
    glossar: d.glossar.length,
    faq: d.faq.length,
  };
  for (const [k, v] of Object.entries(ist)) {
    if (soll[k] !== v) fehlt(`Kennzahl ${k}: Daten ${v}, kennzahlen ${soll[k]}`);
  }

  const slugsStation = new Set(d.stationen.map((s) => s.slug));
  const slugsBaustein = new Set(d.bausteine.map((b) => b.slug));
  const slugsAnbieter = new Set(d.anbieter.map((a) => a.slug));
  const slugsLeitfaden = new Set(d.leitfaeden.map((l) => l.slug));
  const slugsCheckliste = new Set(d.checklisten.map((c) => c.slug));
  const idsFrist = new Set(d.fristen.map((f) => f.id));
  const slugsGlossar = new Set(d.glossar.map((g) => g.slug));
  const partnerSchluessel = new Set(d.partner.anbieter.map((p) => p.schluessel));
  const routen = new Set(d.routen);

  const pruefeAlle = (liste: string[], menge: Set<string>, kontext: string, art: string) => {
    for (const x of liste) if (!menge.has(x)) fehlt(`${kontext}: unbekannte ${art} "${x}"`);
  };

  for (const s of d.stationen) {
    const k = `Station ${s.slug}`;
    if (s.naechste) pruefeAlle([s.naechste], slugsStation, k, "Station (naechste)");
    if (s.vorherige) pruefeAlle([s.vorherige], slugsStation, k, "Station (vorherige)");
    pruefeAlle(s.fristen, idsFrist, k, "Frist");
    pruefeAlle(s.leitfaeden, slugsLeitfaden, k, "Leitfaden");
    pruefeAlle(s.checklisten, slugsCheckliste, k, "Checkliste");
    pruefeAlle(Object.keys(s.bausteine), slugsBaustein, k, "Baustein (Status)");
    pruefeAlle(s.prioritaeten.map((p) => p.baustein), slugsBaustein, k, "Baustein (Priorität)");
    if (Object.keys(s.bausteine).length !== d.bausteine.length) fehlt(`${k}: Status nicht für alle Bausteine`);
  }

  for (const b of d.bausteine) {
    const k = `Baustein ${b.slug}`;
    pruefeAlle(b.anbieter, slugsAnbieter, k, "Anbieter");
    for (const a of b.anbieter) {
      const eintrag = d.anbieter.find((x) => x.slug === a);
      if (eintrag && eintrag.baustein !== b.slug) fehlt(`${k}: Anbieter ${a} gehört zu ${eintrag.baustein}`);
    }
    pruefeAlle(b.leitfaeden, slugsLeitfaden, k, "Leitfaden");
    pruefeAlle(b.checklisten, slugsCheckliste, k, "Checkliste");
    pruefeAlle(b.stationen, slugsStation, k, "Station");
    pruefeAlle(b.wann.stationen, slugsStation, k, "Station (wann)");
  }

  for (const a of d.anbieter) {
    const k = `Anbieter ${a.slug}`;
    pruefeAlle([a.baustein], slugsBaustein, k, "Baustein");
    pruefeAlle(a.stationen, slugsStation, k, "Station");
    if (a.partner && !partnerSchluessel.has(a.partner)) fehlt(`${k}: unbekannter Partner "${a.partner}"`);
    if (!/^https:\/\//.test(a.zielUrl)) fehlt(`${k}: zielUrl ist keine https Adresse`);
    if (a.url !== `/anbieter/${a.slug}`) fehlt(`${k}: url weicht von der Route ab`);
  }
  for (const slug of d.bilder.anbieterLogos.slugs) {
    if (!slugsAnbieter.has(slug)) fehlt(`bilder.anbieterLogos: unbekannter Anbieter "${slug}"`);
  }
  for (const p of d.partner.anbieter) {
    for (const prod of p.produkte) {
      if (!slugsAnbieter.has(prod)) fehlt(`Partner ${p.schluessel}: unbekanntes Produkt "${prod}"`);
    }
  }

  for (const l of d.leitfaeden) {
    const k = `Leitfaden ${l.slug}`;
    pruefeAlle([l.baustein], slugsBaustein, k, "Baustein");
    pruefeAlle(l.stationen, slugsStation, k, "Station");
    pruefeAlle(l.verwandt.anbieter, slugsAnbieter, k, "Anbieter (verwandt)");
    pruefeAlle(l.verwandt.leitfaeden, slugsLeitfaden, k, "Leitfaden (verwandt)");
    pruefeAlle(l.verwandt.fristen, idsFrist, k, "Frist (verwandt)");
    for (const b of l.bloecke) {
      if (!BLOCKTYPEN.has(b.typ)) fehlt(`${k}: unbekannter Blocktyp "${b.typ}"`);
      if (b.typ === "checkliste" && !slugsCheckliste.has(b.id)) fehlt(`${k}: unbekannte Checkliste "${b.id}"`);
    }
  }

  for (const c of d.checklisten) pruefeAlle(c.stationen, slugsStation, `Checkliste ${c.slug}`, "Station");

  for (const f of d.fristen) {
    const k = `Frist ${f.id}`;
    pruefeAlle(f.stationen, slugsStation, k, "Station");
    pruefeAlle([f.baustein], slugsBaustein, k, "Baustein");
    pruefeAlle([f.leitfaden], slugsLeitfaden, k, "Leitfaden");
    if (f.datum !== null && !/^\d{4}-\d{2}-\d{2}$/.test(f.datum)) fehlt(`${k}: Datum ist kein ISO Datum`);
  }

  for (const g of d.glossar) {
    const k = `Glossar ${g.slug}`;
    pruefeAlle(g.siehe.leitfaeden ?? [], slugsLeitfaden, k, "Leitfaden");
    pruefeAlle(g.siehe.bausteine ?? [], slugsBaustein, k, "Baustein");
    pruefeAlle(g.siehe.glossar ?? [], slugsGlossar, k, "Glossarbegriff");
    pruefeAlle(g.siehe.fristen ?? [], idsFrist, k, "Frist");
  }

  for (const f of d.faq) {
    if (f.verweis && !routen.has(pfadOhneAnker(f.verweis))) fehlt(`FAQ ${f.id}: Verweis ${f.verweis} ist keine Route`);
  }

  // Planer
  const bausteinIds = d.planer.bausteinReihenfolge;
  pruefeAlle(bausteinIds, slugsBaustein, "Planer bausteinReihenfolge", "Baustein");
  for (const r of [...d.planer.teamRegeln, ...d.planer.modellRegeln]) {
    pruefeAlle([r.baustein], slugsBaustein, `Planerregel ${r.id}`, "Baustein");
    if (!r.setze && !r.mindestens) fehlt(`Planerregel ${r.id}: weder setze noch mindestens`);
  }
  for (const r of d.planer.stationErmitteln.regeln) pruefeAlle([r.station], slugsStation, "stationErmitteln", "Station");

  // Startseite und Navigation
  const start = d.seiten.start;
  pruefeAlle(start.fristen.ids, idsFrist, "Startseite Fristen", "Frist");
  pruefeAlle([start.leitfaeden.hervorgehoben, ...start.leitfaeden.weitere], slugsLeitfaden, "Startseite Leitfäden", "Leitfaden");
  pruefeAlle(start.faq.ids, new Set(d.faq.map((f) => f.id)), "Startseite FAQ", "FAQ");

  const hrefs: string[] = [];
  const sammle = (x: unknown) => {
    if (Array.isArray(x)) x.forEach(sammle);
    else if (x && typeof x === "object") {
      for (const [k, v] of Object.entries(x)) {
        if ((k === "href" || k === "verweis") && typeof v === "string") hrefs.push(v);
        else sammle(v);
      }
    }
  };
  sammle(d.navigation);
  sammle(d.seiten);
  for (const h of hrefs) {
    if (!routen.has(pfadOhneAnker(h))) fehlt(`Link ${h} ist keine Route aus "routen"`);
  }

  // Inline Links in allen Texten
  const durchsuche = (x: unknown, pfad: string) => {
    if (typeof x === "string") {
      if (enthaeltInlineMarkup(x)) {
        try {
          for (const h of sammleLinks(parseInline(x))) {
            if (!routen.has(pfadOhneAnker(h))) fehlt(`${pfad}: Inline Link ${h} ist keine Route`);
          }
        } catch (e) {
          fehlt(`${pfad}: ${(e as Error).message}`);
        }
      }
    } else if (Array.isArray(x)) x.forEach((v, i) => durchsuche(v, `${pfad}[${i}]`));
    else if (x && typeof x === "object") {
      for (const [k, v] of Object.entries(x)) {
        if (["zeichenSvg", "routen", "_meta", "redaktionsregeln"].includes(k)) continue;
        durchsuche(v, `${pfad}.${k}`);
      }
    }
  };
  durchsuche(d, "daten");

  return fehler;
}

function pruefeHersteller(): string[] {
  const probleme: string[] = [];
  const bekannt = new Set(daten.anbieter.map((a) => a.slug));
  for (const [slug, h] of hersteller) {
    if (!bekannt.has(slug)) probleme.push(`hersteller.json: unbekannter Anbieter "${slug}"`);
    for (const feld of ["unternehmen", "ort", "land"] as const) {
      if (!h[feld]?.trim()) probleme.push(`hersteller.json ${slug}: ${feld} fehlt`);
    }
    if (!/^https:\/\//.test(h.quelle?.url ?? "")) probleme.push(`hersteller.json ${slug}: Quelle braucht eine https Adresse`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(h.geprueft ?? "")) probleme.push(`hersteller.json ${slug}: geprueft ist kein ISO Datum`);
  }
  return probleme;
}

function pruefeBewertungen(): string[] {
  const probleme: string[] = [];
  const bekannt = new Set(daten.anbieter.map((a) => a.slug));
  const im = (x: number) => Number.isFinite(x) && x >= 0 && x <= 5;
  for (const [slug, b] of bewertungen) {
    if (!bekannt.has(slug)) probleme.push(`bewertungen.json: unbekannter Anbieter "${slug}"`);
    if (!im(b.gesamt)) probleme.push(`bewertungen.json ${slug}: gesamt muss zwischen 0 und 5 liegen`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(b.stand)) probleme.push(`bewertungen.json ${slug}: stand ist kein ISO Datum`);
    for (const k of b.kriterien ?? []) if (!im(k.wert)) probleme.push(`bewertungen.json ${slug}: Kriterium "${k.label}" außerhalb 0 bis 5`);
  }
  for (const s of startseite.hero.suchbegriffe) if (!s.trim()) probleme.push("startseite.json: leerer Suchbegriff");
  return probleme;
}

const fehler = [...pruefeDaten(daten), ...pruefeBewertungen(), ...pruefeHersteller()];
if (fehler.length > 0) {
  throw new Error(`Datenprüfung fehlgeschlagen (${fehler.length}):\n- ${fehler.join("\n- ")}`);
}
