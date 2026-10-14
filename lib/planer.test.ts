import { test } from "node:test";
import assert from "node:assert/strict";
import { berechnePlan, ermittleStation, eingabeZuHash, hashZuEingabe } from "./planer.ts";
import { planer, stationen } from "./daten.ts";
import type { PlanerEingabe } from "./typen.ts";

const optionen = (id: string) => planer.schritte.find((s) => s.id === id)!.optionen.map((o) => o.id);

test("die vier geprüften Beispiele ergeben exakt das erwartete Ergebnis", () => {
  for (const b of planer.beispiele) {
    const plan = berechnePlan(b.eingabe, stationen, planer);
    assert.equal(plan.station, b.erwartet.station, `Beispiel ${b.id}: Station`);
    assert.deepEqual(plan.ergebnis, b.erwartet.ergebnis, `Beispiel ${b.id}: Ergebnis`);
  }
});

test("Stationsermittlung bei 'unsicher' folgt den Regeln von oben nach unten", () => {
  const tabelle: [string, string, string][] = [
    ["nein", "keine", "gruendung"],
    ["nein", "ueber50", "gruendung"],
    ["ja", "keine", "erste-umsaetze"],
    ["ja", "gruendendeMitGehalt", "erste-umsaetze"],
    ["ja", "1bis5", "erstes-team"],
    ["ja", "6bis15", "wachstum"],
    ["ja", "16bis50", "wachstum"],
    ["ja", "ueber50", "ausbau"],
  ];
  for (const [rechnungen, team, erwartet] of tabelle) {
    assert.equal(ermittleStation({ station: "unsicher", team, rechnungen }, planer), erwartet, `${rechnungen}/${team}`);
  }
  assert.equal(ermittleStation({ station: "wachstum", team: "keine" }, planer), "wachstum");
  assert.throws(() => ermittleStation({ station: "unsicher", team: "keine" }, planer));
});

test("Brute Force: alle Kombinationen liefern fünf verschiedene Bausteine in korrekter Reihenfolge", () => {
  // höherer Rang = dringlicher (statusReihenfolge ist aufsteigend: nichtNoetig bis jetzt)
  const rang = (s: string) => planer.statusReihenfolge.indexOf(s as never);
  const reihenfolge = (b: string) => planer.bausteinReihenfolge.indexOf(b);
  const bausteinIds = optionen("vorhanden");
  let faelle = 0;
  for (const station of optionen("station")) {
    for (const team of optionen("team")) {
      for (const modell of optionen("modell")) {
        for (const rechnungen of ["ja", "nein"]) {
          // ohne und mit allen vorhandenen Bausteinen
          for (const vorhanden of [[], bausteinIds]) {
            const eingabe: PlanerEingabe = { station, team, modell, rechnungen, vorhanden };
            const plan = berechnePlan(eingabe, stationen, planer);
            faelle += 1;
            assert.equal(plan.ergebnis.length, 5);
            assert.equal(new Set(plan.ergebnis.map((z) => z.baustein)).size, 5);
            for (let i = 1; i < plan.ergebnis.length; i += 1) {
              const a = plan.ergebnis[i - 1];
              const b = plan.ergebnis[i];
              assert.ok(
                rang(a.status) > rang(b.status) ||
                  (rang(a.status) === rang(b.status) && reihenfolge(a.baustein) < reihenfolge(b.baustein)),
                `Ordnung verletzt bei ${JSON.stringify(eingabe)}`,
              );
            }
            // vorhanden ändert nie den Status
            const ohne = berechnePlan({ ...eingabe, vorhanden: [] }, stationen, planer);
            for (const z of plan.ergebnis) {
              const o = ohne.ergebnis.find((x) => x.baustein === z.baustein)!;
              assert.equal(z.status, o.status, "vorhanden darf den Status nicht verändern");
              if (o.status === "nichtNoetig") assert.equal(z.status, "nichtNoetig");
            }
          }
        }
      }
    }
  }
  assert.equal(faelle, 6 * 6 * 4 * 2 * 2);
});

test("Hash: Zustand wird verlustfrei in die URL geschrieben und zurückgelesen", () => {
  const e: PlanerEingabe = { station: "erstes-team", team: "1bis5", modell: "handel", vorhanden: ["finanzen", "lohn"] };
  assert.equal(eingabeZuHash(e), "s=erstes-team&t=1bis5&m=handel&v=finanzen,lohn");
  assert.deepEqual(hashZuEingabe("#" + eingabeZuHash(e), planer), { ...e, rechnungen: undefined });
  const u: PlanerEingabe = { station: "unsicher", team: "keine", modell: "software", vorhanden: [], rechnungen: "ja" };
  assert.deepEqual(hashZuEingabe(eingabeZuHash(u), planer), u);
});

test("Hash: ungültige Werte werden abgelehnt", () => {
  assert.equal(hashZuEingabe("s=mars&t=1bis5&m=handel", planer), null);
  assert.equal(hashZuEingabe("s=gruendung&t=viele&m=handel", planer), null);
  assert.equal(hashZuEingabe("s=unsicher&t=keine&m=handel", planer), null);
  assert.equal(hashZuEingabe("", planer), null);
});
