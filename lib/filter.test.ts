import { test } from "node:test";
import assert from "node:assert/strict";
import {
  anbieterFilterZuQuery,
  anfangsbuchstaben,
  filtereAnbieter,
  leseAnbieterFilter,
  sortiereAlphabetisch,
  STANDARD_ANBIETER_FILTER,
} from "./filter.ts";
import { filtereFristen, nachJahrGruppiert, zukuenftigeFristen } from "./fristen.ts";
import { anbieter, bausteine, fristen } from "./daten.ts";

const bausteinIds = bausteine.map((b) => b.slug);

test("Standard: alle 47 Anbieter, alphabetisch", () => {
  const liste = filtereAnbieter(anbieter, STANDARD_ANBIETER_FILTER);
  assert.equal(liste.length, 47);
  const namen = liste.map((a) => a.name);
  assert.deepEqual(namen, [...namen].sort((a, b) => a.localeCompare(b, "de", { sensitivity: "base" })));
});

test("Filter nach Baustein, Preis und Kündbarkeit", () => {
  const lohn = filtereAnbieter(anbieter, { ...STANDARD_ANBIETER_FILTER, baustein: "lohn" });
  assert.ok(lohn.length > 0 && lohn.every((a) => a.baustein === "lohn"));
  const pub = filtereAnbieter(anbieter, { ...STANDARD_ANBIETER_FILTER, preis: "veroeffentlicht" });
  assert.ok(pub.every((a) => a.preis.status === "veroeffentlicht"));
  const rest = filtereAnbieter(anbieter, { ...STANDARD_ANBIETER_FILTER, preis: "anfrage" });
  assert.ok(rest.every((a) => a.preis.status !== "veroeffentlicht"));
  assert.equal(pub.length + rest.length, 47);
  const monat = filtereAnbieter(anbieter, { ...STANDARD_ANBIETER_FILTER, monatlich: true });
  assert.ok(monat.length > 0 && monat.every((a) => a.monatlichKuendbar === true));
});

test("Sortierung Zuletzt geprüft: neuestes Datum zuerst, sonst alphabetisch", () => {
  const liste = filtereAnbieter(anbieter, { ...STANDARD_ANBIETER_FILTER, sort: "geprueft" });
  assert.equal(liste.length, 47);
  const tag = (g: string) => Number(g.split(".")[0]);
  for (let i = 1; i < liste.length; i += 1) {
    assert.ok(tag(liste[i - 1].geprueft) >= tag(liste[i].geprueft) || liste[i - 1].geprueft !== liste[i].geprueft);
  }
});

test("Query Parameter: lesen und schreiben, Standardwerte entfallen", () => {
  const f = leseAnbieterFilter({ baustein: "lohn", preis: "veroeffentlicht", monatlich: "1", sort: "geprueft" }, bausteinIds);
  assert.deepEqual(f, { baustein: "lohn", preis: "veroeffentlicht", monatlich: true, sort: "geprueft" });
  assert.equal(anbieterFilterZuQuery(f), "?baustein=lohn&preis=veroeffentlicht&monatlich=1&sort=geprueft");
  assert.equal(anbieterFilterZuQuery(STANDARD_ANBIETER_FILTER), "");
  assert.deepEqual(leseAnbieterFilter({ baustein: "unsinn", preis: "x", sort: "y" }, bausteinIds), STANDARD_ANBIETER_FILTER);
});

test("Anfangsbuchstaben nur, wenn vorhanden", () => {
  assert.deepEqual(anfangsbuchstaben(["Äpfel", "Billomat", "bob", "Zoho"]), ["Ä", "B", "Z"]);
  const echte = anfangsbuchstaben(anbieter.map((a) => a.name));
  assert.ok(echte.length > 5 && echte.length < 26);
});

test("sortiereAlphabetisch ist stabil und lässt das Original unverändert", () => {
  const roh = [{ name: "b" }, { name: "A" }, { name: "c" }];
  assert.deepEqual(sortiereAlphabetisch(roh).map((x) => x.name), ["A", "b", "c"]);
  assert.deepEqual(roh.map((x) => x.name), ["b", "A", "c"]);
});

test("Fristen: vergangene Termine verschwinden, wiederkehrende bleiben", () => {
  const heute = "2026-10-13";
  const liste = zukuenftigeFristen(fristen, heute);
  assert.ok(liste.every((f) => f.datum === null || f.datum >= heute));
  assert.ok(liste.some((f) => f.datum === null));
  assert.ok(!liste.some((f) => f.id === "e-rechnung-empfang"));
  const datiert = liste.filter((f) => f.datum);
  assert.deepEqual(datiert.map((f) => f.datum), [...datiert.map((f) => f.datum as string)].sort());
  // am Tag selbst noch sichtbar, am Folgetag nicht
  const am = zukuenftigeFristen(fristen, "2027-01-01").map((f) => f.id);
  assert.ok(am.includes("e-rechnung-ausstellung-2027"));
  const danach = zukuenftigeFristen(fristen, "2027-01-02").map((f) => f.id);
  assert.ok(!danach.includes("e-rechnung-ausstellung-2027"));
});

test("Fristen: Filter und Gruppierung nach Jahr", () => {
  assert.equal(filtereFristen(fristen, { station: "", baustein: "", status: "" }).length, 13);
  const kommt = filtereFristen(fristen, { station: "", baustein: "", status: "kommt" });
  assert.ok(kommt.length > 0 && kommt.every((f) => f.status === "kommt"));
  const gruppen = nachJahrGruppiert(fristen);
  assert.deepEqual(gruppen.map((g) => g.jahr), [...gruppen.map((g) => g.jahr)].sort());
  assert.equal(gruppen.reduce((s, g) => s + g.fristen.length, 0), fristen.filter((f) => f.datum).length);
});
