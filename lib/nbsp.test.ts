import { test } from "node:test";
import assert from "node:assert/strict";
import { nbsp } from "./nbsp.ts";

const N = " ";

test("Zahl und Einheit werden verbunden", () => {
  assert.equal(nbsp("ab 29 Euro im Monat"), `ab 29${N}Euro im Monat`);
  assert.equal(nbsp("5 Prozent und 14 Tage"), `5${N}Prozent und 14${N}Tage`);
  assert.equal(nbsp("zwölf 12 Monate, 3 Jahren"), `zwölf 12${N}Monate, 3${N}Jahren`);
  assert.equal(nbsp("bis 5 Beschäftigte und 3 Nutzer"), `bis 5${N}Beschäftigte und 3${N}Nutzer`);
  assert.equal(nbsp("nach 30 Minuten"), `nach 30${N}Minuten`);
});

test("Paragrafen und Absätze", () => {
  assert.equal(nbsp("§ 14 Absatz 4 UStG"), `§${N}14 Absatz${N}4 UStG`);
  assert.equal(nbsp("Artikel 77 DSGVO"), `Artikel${N}77 DSGVO`);
  assert.equal(nbsp("Nummer 3 Satz 2"), `Nummer${N}3 Satz${N}2`);
  assert.equal(nbsp("§§ 14, 15"), `§§${N}14, 15`);
});

test("Datum: Tag und Monat", () => {
  assert.equal(nbsp("am 13. Oktober 2026"), `am 13.${N}Oktober 2026`);
  assert.equal(nbsp("1. Januar 2027 und 25. September"), `1.${N}Januar 2027 und 25.${N}September`);
});

test("keine Treffer ohne Zahl, kein Doppeln", () => {
  assert.equal(nbsp("Euro Prozent Absatz"), "Euro Prozent Absatz");
  assert.equal(nbsp(nbsp("29 Euro")), `29${N}Euro`);
  assert.equal(nbsp("29 Eurozone"), "29 Eurozone");
});
