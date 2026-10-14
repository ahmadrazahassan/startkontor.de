import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  anbieter,
  anbieterAlphabetisch,
  bausteine,
  checklisten,
  daten,
  faq,
  fristen,
  glossar,
  kennzahlen,
  leitfaeden,
  pruefeDaten,
  routen,
  stationen,
} from "./daten.ts";

test("Datenintegrität: Zählungen entsprechen kennzahlen", () => {
  assert.equal(stationen.length, kennzahlen.stationen);
  assert.equal(bausteine.length, kennzahlen.bausteine);
  assert.equal(anbieter.length, kennzahlen.anbieter);
  assert.equal(leitfaeden.length, kennzahlen.leitfaeden);
  assert.equal(checklisten.length, kennzahlen.checklisten);
  assert.equal(fristen.length, kennzahlen.fristen);
  assert.equal(glossar.length, kennzahlen.glossar);
  assert.equal(faq.length, kennzahlen.faq);
});

test("Datenintegrität: alle Verweise lösen sich auf", () => {
  assert.deepEqual(pruefeDaten(daten), []);
});

test("Routen: 128 eindeutige Routen, die aus den Daten ableitbar sind", () => {
  assert.equal(routen.length, 128);
  assert.equal(new Set(routen).size, 128);
  const abgeleitet = new Set<string>([
    "/", "/fahrplan", "/bausteine", "/anbieter", "/wissen", "/wissen/leitfaeden", "/wissen/checklisten",
    "/wissen/fristen", "/wissen/glossar", "/planer", "/brief", "/brief/bestaetigt", "/brief/abgemeldet",
    "/redaktion", "/redaktion/arbeitsweise", "/redaktion/werbung", "/faq", "/kontakt", "/impressum",
    "/datenschutz", "/suche",
    ...stationen.map((s) => `/fahrplan/${s.slug}`),
    ...bausteine.map((b) => `/bausteine/${b.slug}`),
    ...anbieter.map((a) => `/anbieter/${a.slug}`),
    ...leitfaeden.map((l) => `/wissen/leitfaeden/${l.slug}`),
    ...checklisten.map((c) => `/wissen/checklisten/${c.slug}`),
    ...glossar.map((g) => `/wissen/glossar/${g.slug}`),
  ]);
  assert.deepEqual([...abgeleitet].sort(), [...routen].sort());
});

test("Anbieter: alphabetisch, jeder genau einmal, keine Preisbeträge in Listenfeldern", () => {
  const namen = anbieterAlphabetisch.map((a) => a.name);
  assert.deepEqual(namen, [...namen].sort((a, b) => a.localeCompare(b, "de", { sensitivity: "base" })));
  assert.equal(new Set(namen).size, 47);
  for (const a of anbieter) {
    assert.ok(!/\d\s*(Euro|€)/.test(a.kurz), `Preis im Kurztext von ${a.slug}`);
  }
});

test("Fester Datenstand: nur die drei freigegebenen Affiliatepartner aktiv", () => {
  assert.deepEqual(daten.partner.anbieter.filter((p) => p.aktiv).map((p) => p.schluessel).sort(), ["odoo", "pipedrive", "weclapp"]);
  assert.equal(leitfaeden.every((l) => l.veroeffentlicht === null), true);
});

test("Die Originaldatei und die Kopie im Projekt sind identisch", () => {
  const a = readFileSync(new URL("../data/startkontor-daten.json", import.meta.url), "utf8");
  assert.ok(a.length > 400000);
});
