import { test } from "node:test";
import assert from "node:assert/strict";
import { falte, gruppiere, sucheEintraege, tokenisiere } from "./suche.ts";
import type { SuchEintrag } from "./suche.ts";

const e = (titel: string, extra: Partial<SuchEintrag> = {}): SuchEintrag => ({
  typ: "anbieter",
  titel,
  text: "",
  url: `/x/${titel}`,
  gruppe: "Anbieter",
  ...extra,
});

test("deutsche Faltung", () => {
  assert.equal(falte("Größe, Prüfung & Äpfel!"), "grosse prufung apfel");
  assert.equal(falte("E-Rechnung"), "e rechnung");
  assert.equal(falte("ÖL"), "ol");
  assert.deepEqual(tokenisiere("  Lohn und   Gehalt "), ["lohn", "und", "gehalt"]);
  assert.deepEqual(tokenisiere("...?"), []);
});

test("Präfix Treffer am Wortanfang, nicht mittendrin", () => {
  const index = [e("Personio"), e("Pipedrive"), e("Sage Personal")];
  assert.deepEqual(sucheEintraege(index, "per").map((t) => t.titel), ["Personio", "Sage Personal"]);
  assert.deepEqual(sucheEintraege(index, "sonio"), []);
});

test("Umlaute finden ihre gefalteten Entsprechungen", () => {
  const index = [e("Prüfung der Rechnung", { typ: "leitfaden", gruppe: "Leitfäden" })];
  assert.equal(sucheEintraege(index, "prufung").length, 1);
  assert.equal(sucheEintraege(index, "PRÜF").length, 1);
});

test("alle Token müssen vorkommen", () => {
  const index = [e("Lohn und Gehalt"), e("Gehalt")];
  assert.deepEqual(sucheEintraege(index, "lohn gehalt").map((t) => t.titel), ["Lohn und Gehalt"]);
});

test("Gewichtung: Titel vor Kurztext vor Text, exakter Titel zuerst", () => {
  const nurText = e("Andere", { text: "billomat erwähnt" });
  const kurz = e("Weitere", { kurz: "billomat Rechnungen" });
  const titel = e("Billomat");
  const praefix = e("Billomat Pro");
  const ergebnis = sucheEintraege([nurText, kurz, praefix, titel], "billomat").map((t) => t.titel);
  assert.deepEqual(ergebnis, ["Billomat", "Billomat Pro", "Weitere", "Andere"]);
});

test("Gleichstand wird alphabetisch aufgelöst", () => {
  const index = [e("Zeta Lohn"), e("Alpha Lohn")];
  assert.deepEqual(sucheEintraege(index, "lohn").map((t) => t.titel), ["Alpha Lohn", "Zeta Lohn"]);
});

test("Gruppierung begrenzt auf acht je Gruppe und folgt der Gruppenreihenfolge", () => {
  const viele = Array.from({ length: 12 }, (_, i) => e(`Treffer ${i}`));
  const frist = e("Treffer Frist", { gruppe: "Fristen", typ: "frist" });
  const gruppen = gruppiere(sucheEintraege([frist, ...viele], "treffer"), ["Anbieter", "Fristen", "Glossar"]);
  assert.deepEqual(gruppen.map((g) => g.gruppe), ["Anbieter", "Fristen"]);
  assert.equal(gruppen[0].treffer.length, 8);
});

test("leere Anfrage liefert nichts", () => {
  assert.deepEqual(sucheEintraege([e("A")], "   "), []);
});
