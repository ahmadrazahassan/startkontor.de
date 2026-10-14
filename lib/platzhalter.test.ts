import { test } from "node:test";
import assert from "node:assert/strict";
import { fehlendePflichtangaben, fuelleRekursiv, fuelleString, hatPlatzhalter, platzhalterIn } from "./platzhalter.ts";

const voll = { BETREIBER_NAME: "Muster GmbH", ORT: "Berlin", TELEFON: "", KONTAKT_EMAIL: "redaktion@example.de" };

test("Platzhalter werden eingesetzt", () => {
  assert.equal(fuelleString("{{BETREIBER_NAME}} in {{ORT}}", voll), "Muster GmbH in Berlin");
});

test("leere Pflichtangaben bleiben sichtbar", () => {
  assert.equal(fuelleString("{{POSTLEITZAHL}}", voll), "{{POSTLEITZAHL}}");
  assert.equal(hatPlatzhalter("a {{X}} b"), true);
  assert.equal(hatPlatzhalter("kein Platzhalter"), false);
  assert.deepEqual(platzhalterIn("{{A}} und {{B_C}}"), ["A", "B_C"]);
});

test("leere optionale Angaben entfernen den ganzen Absatz", () => {
  const eingabe = {
    absaetze: ["E-Mail: {{KONTAKT_EMAIL}}", "Telefon: {{TELEFON}}"],
    register: ["Handelsregister: {{HANDELSREGISTER_UND_NUMMER_FALLS_VORHANDEN}}"],
  };
  const aus = fuelleRekursiv(eingabe, { ...voll, HANDELSREGISTER_UND_NUMMER_FALLS_VORHANDEN: "" });
  assert.deepEqual(aus.absaetze, ["E-Mail: redaktion@example.de"]);
  assert.deepEqual(aus.register, []);
});

test("befüllte optionale Angaben bleiben", () => {
  const aus = fuelleRekursiv({ a: ["Telefon: {{TELEFON}}"] }, { TELEFON: "030 123" });
  assert.deepEqual(aus.a, ["Telefon: 030 123"]);
});

test("rekursiv durch Objekte, Tabellen und Zahlen", () => {
  const aus = fuelleRekursiv(
    { t: { zeilen: [["{{ORT}}", 1, null]] }, n: 3 },
    voll,
  ) as { t: { zeilen: unknown[][] }; n: number };
  assert.deepEqual(aus.t.zeilen, [["Berlin", 1, null]]);
  assert.equal(aus.n, 3);
});

test("fehlende Pflichtangaben werden gemeldet, optionale nicht", () => {
  assert.deepEqual(
    fehlendePflichtangaben({ BETREIBER_NAME: "x", TELEFON: "", ORT: "" }, ["BETREIBER_NAME", "TELEFON", "ORT"]),
    ["ORT"],
  );
});
