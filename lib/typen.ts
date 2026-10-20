// Typen für data/startkontor-daten.json. Nur erasable TypeScript (keine enums, keine Namespaces).

export type Link = { label: string; href: string };

export type StatusKey = "jetzt" | "alsNaechstes" | "spaeter" | "nichtNoetig";
export type FristStatus = "gilt" | "kommt" | "entwurf" | "wiederkehrend";
export type PreisStatus = "veroeffentlicht" | "anfrage" | "nichtVerifiziert";

export type Seo = { titel: string; beschreibung: string; robots?: string };

export type Quelle = { titel: string; url: string };

export type NavKind = Link & { beschreibung: string };
export type NavPunkt = Link & { beschreibung: string; kinder?: NavKind[] };

export type Navigation = {
  kopfzeile: NavPunkt[];
  kopfzeileAktion: Link;
  suche: Link & { kuerzel: string };
  mobil: { reihenfolge: string[] };
  fusszeile: {
    spalten: { titel: string; links: Link[] }[];
    rechtlich: Link[];
    werbehinweis: string;
    copyright: string;
  };
  brotkrumen: { start: string; muster: string[] };
};

export type Marke = {
  name: string;
  claim: string;
  kurzbeschreibung: string;
  metaStandardBeschreibung: string;
  land: string;
  stand: { fakten: string; recht: string; statusleiste: string };
  logo: { zeichenSvg: string };
};

export type Station = {
  id: string;
  nummer: number;
  slug: string;
  name: string;
  untertitel: string;
  bild: string;
  seo: Seo;
  teaser: string;
  kennzeichen: string[];
  einleitung: string[];
  prioritaeten: { titel: string; baustein: string; text: string }[];
  fehler: { titel: string; text: string }[];
  fragen: string[];
  bausteine: Record<string, { status: StatusKey; grund: string }>;
  fristen: string[];
  leitfaeden: string[];
  checklisten: string[];
  naechste: string | null;
  vorherige: string | null;
};

export type Preismuster = { name: string; beispiel: string; beschreibung: string; vorsicht: string };

export type Baustein = {
  id: string;
  nummer: number;
  slug: string;
  name: string;
  kurzname: string;
  bild: string;
  seo: Seo;
  teaser: string;
  definition: string;
  wann: { text: string; stationen: string[] };
  kriterien: { titel: string; warum: string; frage: string }[];
  preislogik: { intro: string; muster: Preismuster[] };
  fehler: { titel: string; text: string }[];
  faq: { frage: string; antwort: string }[];
  anbieter: string[];
  leitfaeden: string[];
  checklisten: string[];
  stationen: string[];
};

export type Preis = {
  status: PreisStatus;
  anker?: string;
  zeilen?: string[];
  hinweis?: string;
};

export type Anbieter = {
  slug: string;
  name: string;
  baustein: string;
  stationen: string[];
  partner: string | null;
  logo: string;
  geprueft: string;
  monatlichKuendbar: boolean | null;
  kurz: string;
  fuerWen: string[];
  wenigerPassend: string[];
  preis: Preis;
  funktionen: string[];
  grenzen: string[];
  vertrag: string | null;
  fragen: string[];
  einordnung: string;
  quellen: Quelle[];
  zielUrl: string;
  url: string;
};

export type SoftwareReview = {
  methodik: string;
  deutschland: { text: string; quelle: string };
  abschnitte: { id: string; titel: string; absaetze: string[]; quellen: number[] }[];
};

export type Block =
  | { typ: "zwischentitel"; text: string }
  | { typ: "absatz"; text: string }
  | { typ: "tabelle"; titel: string; spalten: string[]; zeilen: string[][]; hinweis?: string }
  | { typ: "liste"; eintraege: string[] }
  | { typ: "nummeriert"; eintraege: string[]; start?: number }
  | { typ: "hinweis"; titel: string; text: string }
  | { typ: "achtung"; titel: string; text: string }
  | { typ: "merksatz"; text: string }
  | { typ: "checkliste"; id: string };

export type Leitfaden = {
  id: string;
  slug: string;
  titel: string;
  untertitel: string;
  baustein: string;
  stationen: string[];
  rechtsstand: string;
  lesezeit: number;
  veroeffentlicht: string | null;
  seo: Seo;
  rechtshinweis: string;
  kernaussagen: string[];
  bloecke: Block[];
  quellen: Quelle[];
  verwandt: { anbieter: string[]; leitfaeden: string[]; fristen: string[] };
  woerter: number;
};

export type Checkpunkt = { text: string; hinweis?: string };
export type Checkliste = {
  id: string;
  slug: string;
  stationen: string[];
  titel: string;
  einleitung: string;
  seo: Seo;
  gruppen: { titel: string; punkte: Checkpunkt[] }[];
};

export type Frist = {
  id: string;
  titel: string;
  datum: string | null;
  anzeige: string;
  art: string;
  status: FristStatus;
  stationen: string[];
  baustein: string;
  text: string;
  quelle: Quelle;
  stand: string;
  leitfaden: string;
};

export type Glossarbegriff = {
  id: string;
  slug: string;
  begriff: string;
  kurz: string;
  erklaerung: string;
  siehe: { leitfaeden?: string[]; bausteine?: string[]; glossar?: string[]; fristen?: string[] };
};

export type FaqEintrag = { id: string; frage: string; antwort: string; thema: string; verweis?: string };

export type PlanerOption = { id: string; label: string; text?: string };
export type PlanerSchritt = {
  id: string;
  frage: string;
  hilfe: string;
  mehrfach?: boolean;
  optionen: PlanerOption[];
};
export type PlanerRegel = {
  id: string;
  wenn: Partial<Record<"team" | "modell" | "station", string[]>>;
  baustein: string;
  setze?: StatusKey;
  mindestens?: StatusKey;
  grund: string;
};
export type PlanerEingabe = {
  station: string;
  rechnungen?: string;
  team: string;
  modell: string;
  vorhanden: string[];
};
export type PlanerErgebnisZeile = { baustein: string; status: StatusKey; regel: string; vorhanden: boolean };
export type Planer = {
  statusReihenfolge: StatusKey[];
  bausteinReihenfolge: string[];
  statusAnzeige: Record<StatusKey, { label: string; kurz: string }>;
  vorhandenHinweis: string;
  schritte: PlanerSchritt[];
  stationErmitteln: {
    zusatzfrage: { id: string; frage: string; optionen: PlanerOption[] };
    regeln: { wenn: { rechnungen: string; team?: string[] }; station: string }[];
  };
  teamRegeln: PlanerRegel[];
  modellRegeln: PlanerRegel[];
  beispiele: {
    id: string;
    titel: string;
    eingabe: PlanerEingabe;
    erwartet: { station: string; ergebnis: PlanerErgebnisZeile[] };
  }[];
};

export type PartnerWerbemittel = {
  programmId: number;
  saetze: Record<string, { landing: string; alt: string; anzeigen: Record<string, number> }>;
  einsatz: { seite: string; satz: string }[];
};
export type SageWerbeanzeige = {
  adId: number;
  status: string;
  name: string;
  labels: string;
  width: number;
  height: number;
  language: string;
  alt: string;
  landingPage: string;
  trackingLink: string;
  imageUrl: string;
  hostedBy: string;
};
export type Partner = {
  schluessel: string;
  name: string;
  produkte: string[];
  netzwerk: "direkt" | "Impact";
  aktiv: boolean;
  zielLink: string;
  werbemittel?: PartnerWerbemittel;
  /** Nur Impact: Programm, eigenes Partnerkonto und die Website (Media Property), der jeder Klick zugeordnet wird */
  impact?: { programm: string; programmId: number; partnerId: number; medienEigenschaft: number; website: string };
  /** Nur Impact: im Impact-Konto erzeugte Trackinglinks je Produkt, die Zielseite ist im Link hinterlegt */
  produktLinks?: Record<string, string>;
};

export type BildPlatz = { id: string; datei: string; format: string; einsatz: string; alt: string };

// Die UI Texte sind frei strukturiert; wir greifen über `ui` mit festen Schlüsseln zu.
export type Ui = {
  knoepfe: Record<string, string>;
  labels: Record<string, string>;
  suche: {
    platzhalter: string;
    ueberschrift: string;
    gruppen: string[];
    keineTreffer: string;
    tastaturHinweis: string;
  };
  anbieterFilter: {
    baustein: string;
    preis: string;
    preisOptionen: string[];
    vertrag: string;
    sortierung: string;
    sortierOptionen: string[];
    zuruecksetzen: string;
    trefferEinzahl: string;
    trefferMehrzahl: string;
    hinweis: string;
  };
  newsletter: Record<string, string>;
  kontakt: Record<string, string>;
  checkliste: Record<string, string>;
  planer: Record<string, string>;
  fehler: Record<string, string>;
  barrierefreiheit: Record<string, string>;
  abschnitte: {
    station: Record<string, string>;
    baustein: Record<string, string>;
    anbieter: Record<string, string>;
    leitfaden: Record<string, string>;
    fristen: Record<string, string>;
    glossar: Record<string, string>;
    planer: Record<string, string | string[]>;
    allgemein: Record<string, string>;
  };
  mails: {
    absenderName: string;
    bestaetigung: {
      betreff: string;
      anrede: string;
      absaetze: string[];
      knopf: string;
      gueltigkeit: string;
      gruss: string;
      absender: string;
    };
    monatsbrief: { abmeldeSatz: string; abmeldeLink: string };
    kontakt: { betreffMuster: string; feldNamen: Record<string, string> };
  };
};

export type RechtAbschnitt = {
  id: string;
  titel: string;
  absaetze?: string[];
  liste?: string[];
  tabelle?: { spalten: string[]; zeilen: string[][] };
  hinweis?: string;
};

type Kopf = { seo: Seo; eyebrow: string; h1: string };
type Titeltext = { titel: string; text: string };
type Abschnittskopf = { eyebrow: string; titel: string; text: string };

export type Seiten = {
  start: {
    seo: Seo;
    hero: {
      eyebrow: string;
      h1: string;
      einleitung: string;
      primaer: Link;
      sekundaer: Link;
      bild: string;
      fakten: { zaehlt: string; label: string }[];
    };
    stationsleiste: Titeltext;
    standort: Abschnittskopf;
    fristen: Abschnittskopf & { ids: string[]; cta: Link };
    bausteine: Abschnittskopf & { cta: Link };
    planer: Abschnittskopf & { schritte: string[]; cta: Link };
    leitfaeden: Abschnittskopf & { hervorgehoben: string; weitere: string[]; cta: Link };
    prinzipien: { eyebrow: string; titel: string; punkte: Titeltext[]; cta: Link };
    checklisten: Abschnittskopf & { cta: Link };
    faq: { eyebrow: string; titel: string; ids: string[]; cta: Link };
    newsletter: Abschnittskopf;
  };
  fahrplan: Kopf & {
    einleitung: string[];
    lesen: { titel: string; punkte: Titeltext[] };
    hinweis: string;
    tafel: { titel: string; text: string; hinweisTabelle: string };
    abschluss: Titeltext & { cta: Link };
  };
  bausteine: Kopf & { einleitung: string[]; hinweis: string };
  anbieter: Kopf & { einleitung: string[]; auswahl: Titeltext };
  wissen: Kopf & { einleitung: string; bereiche: (Titeltext & { href: string })[] };
  leitfaeden: Kopf & { einleitung: string };
  checklisten: Kopf & { einleitung: string };
  fristen: Kopf & {
    einleitung: string[];
    legende: { status: FristStatus; text: string }[];
    hinweis: string;
  };
  glossar: Kopf & { einleitung: string };
  planer: Kopf & { einleitung: string; datenschutz: string; transparenz: Titeltext };
  brief: Kopf & {
    einleitung: string;
    inhalt: Titeltext[];
    verfahren: string;
  };
  redaktion: Kopf & {
    auftrag: { titel: string; absaetze: string[] };
    haltung: { titel: string; punkte: string[] };
    wer: Titeltext;
    korrektur: Titeltext & { cta: Link };
    verweise: Link[];
    bild: string;
  };
  arbeitsweise: Kopf & {
    einleitung: string;
    abschnitte: { nummer: string; titel: string; absaetze: string[] }[];
    grenzen: { titel: string; punkte: string[] };
  };
  werbung: Kopf & {
    einleitung: string;
    regeln: Titeltext[];
    partnerstatus: { titel: string; textKeine: string; textAktiv: string };
  };
  faq: Kopf & { einleitung: string };
  kontakt: Kopf & { einleitung: string; hinweisFehler: string; direkt: string };
  suche: { seo: Seo; h1: string };
  notfound: { seo: Seo; h1: string; text: string; links: Link[] };
  impressum: { seo: Seo; h1: string; entwurfHinweis?: string; abschnitte: RechtAbschnitt[] };
  datenschutz: { seo: Seo; h1: string; stand: string; entwurfHinweis?: string; abschnitte: RechtAbschnitt[] };
};

export type Daten = {
  marke: Marke;
  navigation: Navigation;
  ui: Ui;
  partner: { anbieter: Partner[] };
  bilder: { plaetze: BildPlatz[]; anbieterLogos: { slugs: string[] } };
  seo: { titelMuster: string; startTitel: string; sprache: string; locale: string; robots: string };
  seiten: Seiten;
  stationen: Station[];
  bausteine: Baustein[];
  anbieter: Anbieter[];
  leitfaeden: Leitfaden[];
  checklisten: Checkliste[];
  fristen: Frist[];
  glossar: Glossarbegriff[];
  faq: FaqEintrag[];
  planer: Planer;
  kennzahlen: Record<string, number>;
  routen: string[];
};

export type ReviewTexte = {
  label: string;
  fazit: string;
  weitere: string;
  weitereText: string;
  bewertung: string;
  von: string;
  kriterien: string;
  inhalt: string;
  methodik: string;
  stand: string;
  sprung: string;
  tabs: Record<"ueberblick" | "funktionen" | "preise" | "eignung" | "grenzen" | "vertrag" | "daten" | "hersteller" | "fragen" | "bewertung" | "alternativen" | "faq" | "quellen", string>;
  kopf: { herstellerseite: string; fragenSpringen: string; faktenPruefen: string; preis: string; kuendbar: string; kategorie: string; geprueft: string };
  ueberblickTitel: string;
  funktionenTitel: string;
  funktionenText: string;
  preiseTitel: string;
  preiseText: string;
  eignungTitel: string;
  geeignet: string;
  wenigerGeeignet: string;
  grenzenTitel: string;
  grenzenText: string;
  vertragTitel: string;
  datenTitel: string;
  datenText: string;
  daten: Record<"kategorie" | "phasen" | "preisangabe" | "einstieg" | "kuendbar" | "vertrag" | "funktionen" | "grenzen" | "quellen" | "geprueft" | "unternehmen" | "standort" | "website" | "ja" | "nein" | "offen", string>;
  herstellerTitel: string;
  herstellerText: string;
  herstellerQuelle: string;
  herstellerLeer: string;
  claim: { titel: string; text: string; cta: string };
  fragenTitel: string;
  fragenText: string;
  bewertungTitel: string;
  bewertungLeerTitel: string;
  bewertungLeerText: string;
  bewertungLeerCta: string;
  bewertungLeerCta2: string;
  alternativenTitel: string;
  alternativenText: string;
  alternativenAlle: string;
  faqTitel: string;
  faq: Record<
    "kosten" | "kostenStand" | "eignung" | "wenigerEignung" | "grenzen" | "funktionen" | "kuendigung" | "kuendigungOffen" | "test" | "testNein" | "testQuellen" | "alternativen" | "alternativenAntwort",
    string
  >;
  weiterTitel: string;
  mobilCta: string;
};

/** Angaben zum Hersteller eines Programms, mit Quelle und Abrufdatum. */
export type Herstellerprofil = {
  unternehmen: string;
  ort: string;
  land: string;
  quelle: { titel: string; url: string };
  geprueft: string;
};

export type Startseite = {
  hero: {
    eyebrow: string;
    h1: string;
    text: string;
    suchePlatzhalter: string;
    sucheLabel: string;
    sucheKnopf: string;
    haeufig: string;
    suchbegriffe: string[];
    alleReviews: string;
    zusicherungen: string[];
  };
  logoleiste: { titel: string; slugs: string[] };
  pfade: {
    eyebrow: string;
    titel: string;
    text: string;
    karten: { icon: string; titel: string; text: string; cta: string; href: string }[];
  };
  kategorien: {
    eyebrow: string;
    titel: string;
    text: string;
    reviews: string;
    review: string;
    alle: string;
    alleKategorie: string;
    kriterien: string;
  };
  zuletzt: { reviewLesen: string; geprueftAm: string };
  aufbau: { eyebrow: string; titel: string; text: string; beispiel: string; punkte: { titel: string; text: string }[] };
  verzeichnis: { eyebrow: string; titel: string; text: string; alle: string };
  anbieter: { eyebrow: string; titel: string; text: string; kriterien: string; schreiben: string };
  review: ReviewTexte;
};

/** Redaktionelle Bewertung. Wird nur angezeigt, wenn die Redaktion sie in data/bewertungen.json einträgt. */
export type Bewertung = {
  gesamt: number;
  stand: string;
  kriterien: { label: string; wert: number }[];
};
