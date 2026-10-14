import { test } from "node:test";
import assert from "node:assert/strict";
import { datenzeilen, erzeugeFaq, fuelle, hebeBetraegeHervor, istPreiszeile, listeMitUnd } from "./produkt.ts";
import type { Anbieter, ReviewTexte } from "./typen.ts";

const daten = {
  kategorie: "Kategorie",
  phasen: "Passt zu",
  preisangabe: "Preisangabe",
  einstieg: "Preis laut Hersteller",
  kuendbar: "Monatlich kündbar",
  vertrag: "Vertrag und Laufzeit",
  funktionen: "Belegte Funktionen",
  grenzen: "Bekannte Grenzen",
  quellen: "Quellen",
  geprueft: "Zuletzt geprüft",
  unternehmen: "Unternehmen",
  standort: "Standort",
  website: "Herstellerseite",
  ja: "Ja, laut Hersteller",
  nein: "Nein, laut Hersteller",
  offen: "Keine geprüfte Angabe",
} satisfies ReviewTexte["daten"];

const faqTexte = {
  kosten: "Was kostet {name}?",
  kostenStand: "Stand der Preisangabe: {datum}.",
  eignung: "Für wen ist {name} geeignet?",
  wenigerEignung: "Für wen ist {name} weniger geeignet?",
  grenzen: "Welche Grenzen hat {name}?",
  funktionen: "Welche Funktionen bietet {name}?",
  kuendigung: "Ist {name} monatlich kündbar?",
  kuendigungOffen: "Dazu liegt keine geprüfte Herstellerangabe vor.",
  test: "Ist das Review ein Test von {name}?",
  testNein: "Nein.",
  testQuellen: "Grundlage sind die verlinkten Quellen, geprüft am {datum}.",
  alternativen: "Welche Alternativen zu {name} gibt es?",
  alternativenAntwort: "In der Kategorie {kategorie} stehen {liste} im Review.",
} satisfies ReviewTexte["faq"];

function anbieter(teil: Partial<Anbieter> = {}): Anbieter {
  return {
    slug: "beispiel",
    name: "Beispiel",
    baustein: "finanzen",
    stationen: ["erste-rechnung"],
    partner: null,
    logo: "",
    geprueft: "13. Oktober 2026",
    monatlichKuendbar: null,
    kurz: "Kurz.",
    fuerWen: ["Kleine Teams."],
    wenigerPassend: ["Große Konzerne."],
    preis: { status: "veroeffentlicht", anker: "Start ab 10 Euro im Monat netto", zeilen: ["Start 10 Euro"], hinweis: "Preise ändern sich." },
    funktionen: ["Rechnungen"],
    grenzen: ["Ein Nutzer."],
    vertrag: null,
    fragen: ["Frage?"],
    einordnung: "Einordnung.",
    quellen: [{ titel: "Preise", url: "https://www.beispiel.de/preise" }],
    zielUrl: "https://www.beispiel.de/preise",
    url: "/anbieter/beispiel",
    ...teil,
  };
}

test("fuelle ersetzt bekannte Platzhalter und lässt unbekannte stehen", () => {
  assert.equal(fuelle("Was kostet {name} am {datum}? {rest}", { name: "A", datum: "heute" }), "Was kostet A am heute? {rest}");
});

test("listeMitUnd verbindet deutsch", () => {
  assert.equal(listeMitUnd([]), "");
  assert.equal(listeMitUnd(["A"]), "A");
  assert.equal(listeMitUnd(["A", "B"]), "A und B");
  assert.equal(listeMitUnd(["A", "B", "C"]), "A, B und C");
});

test("Beträge werden als eigene Segmente erkannt", () => {
  assert.deepEqual(hebeBetraegeHervor("Business 39 Euro oder 29 Euro"), [
    { text: "Business ", fett: false },
    { text: "39 Euro", fett: true },
    { text: " oder ", fett: false },
    { text: "29 Euro", fett: true },
  ]);
  const gross = hebeBetraegeHervor("Standard ab 1.390 Euro im Monat, 50 Prozent Rabatt");
  assert.deepEqual(gross.filter((s) => s.fett).map((s) => s.text), ["1.390 Euro", "50 Prozent"]);
  assert.deepEqual(hebeBetraegeHervor("Individuelles Angebot"), [{ text: "Individuelles Angebot", fett: false }]);
});

test("Datenzeilen: kündbar, Vertrag und Hersteller kommen nur aus den Daten", () => {
  const z = datenzeilen(anbieter(), {
    kategorie: "Finanzen",
    stationen: [{ nummer: 2, name: "Erste Rechnung" }],
    stationLabel: "Station",
    preisStatusText: "Preis in Euro veröffentlicht",
    t: daten,
  });
  const nach = Object.fromEntries(z.map((x) => [x.schluessel, x.wert]));
  assert.equal(nach.kuendbar, "Keine geprüfte Angabe");
  assert.equal(nach.vertrag, "Keine geprüfte Angabe");
  assert.equal(nach.phasen, "Station 2 (Erste Rechnung)");
  assert.equal(nach.einstieg, "Start ab 10 Euro im Monat netto");
  assert.equal(nach.website, "beispiel.de");
  assert.ok(!("unternehmen" in nach));

  const mit = datenzeilen(anbieter({ monatlichKuendbar: true, vertrag: "Monatlich kündbar laut Hersteller." }), {
    kategorie: "Finanzen",
    stationen: [],
    stationLabel: "Station",
    preisStatusText: "x",
    hersteller: { unternehmen: "Beispiel GmbH", ort: "Köln", land: "Deutschland", quelle: { titel: "Impressum", url: "https://a.de" }, geprueft: "2026-10-13" },
    t: daten,
  });
  const n2 = Object.fromEntries(mit.map((x) => [x.schluessel, x.wert]));
  assert.equal(n2.kuendbar, "Ja, laut Hersteller");
  assert.equal(n2.standort, "Köln, Deutschland");
  assert.equal(n2.unternehmen, "Beispiel GmbH");
});

test("Der Einstiegspreis fehlt, wenn kein Preis in Euro veröffentlicht ist", () => {
  const z = datenzeilen(anbieter({ preis: { status: "anfrage", anker: "Preis auf Anfrage" } }), {
    kategorie: "K",
    stationen: [],
    stationLabel: "Station",
    preisStatusText: "Preis auf Anfrage",
    t: daten,
  });
  assert.ok(!z.some((x) => x.schluessel === "einstieg"));
});

test("FAQ: Kosten, Kündigung und Alternativen folgen den Daten", () => {
  const faq = erzeugeFaq(anbieter(), {
    kategorie: "Finanzen",
    alternativen: ["Alpha", "Beta"],
    nettoHinweis: "Alle Preise ohne Umsatzsteuer, sofern nicht anders angegeben.",
    keinEigenerTest: "Dies ist kein eigener Produkttest.",
    t: faqTexte,
  });
  const kosten = faq.find((p) => p.schluessel === "kosten");
  assert.equal(kosten?.frage, "Was kostet Beispiel?");
  assert.deepEqual(kosten?.antwort, [
    "Start ab 10 Euro im Monat netto.",
    "Preise ändern sich.",
    "Stand der Preisangabe: 13. Oktober 2026.",
    "Alle Preise ohne Umsatzsteuer, sofern nicht anders angegeben.",
  ]);
  const kuend = faq.find((p) => p.schluessel === "kuendigung");
  assert.deepEqual(kuend?.antwort, ["Dazu liegt keine geprüfte Herstellerangabe vor."]);
  const alt = faq.find((p) => p.schluessel === "alternativen");
  assert.equal(alt?.antwort[0], "In der Kategorie Finanzen stehen Alpha und Beta im Review.");
  assert.equal(faq.find((p) => p.schluessel === "eignung")?.art, "liste");
});

test("FAQ: ohne Alternativen entfällt die Frage, bei monatlicher Kündigung steht die Herstellerangabe", () => {
  const faq = erzeugeFaq(anbieter({ monatlichKuendbar: true, vertrag: "Monatlich kündbar laut Hersteller." }), {
    kategorie: "Finanzen",
    alternativen: [],
    nettoHinweis: "Netto.",
    keinEigenerTest: "Kein Test.",
    t: faqTexte,
  });
  assert.ok(!faq.some((p) => p.schluessel === "alternativen"));
  assert.deepEqual(faq.find((p) => p.schluessel === "kuendigung")?.antwort, ["Monatlich kündbar laut Hersteller."]);
});

test("Preiszeilen mit Betrag werden von Hinweisen unterschieden", () => {
  assert.equal(istPreiszeile("Business 39 Euro oder 29 Euro"), true);
  assert.equal(istPreiszeile("Standard ab 1.390 Euro im Monat"), true);
  assert.equal(istPreiszeile("Alle Angaben netto"), false);
  assert.equal(istPreiszeile("Individuelles Angebot"), false);
});
