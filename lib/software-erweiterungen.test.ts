import { test } from "node:test";
import assert from "node:assert/strict";
import basis from "../data/startkontor-daten.json" with { type: "json" };
import neu from "../data/software-erweiterungen.json" with { type: "json" };
import { ergaenzeSoftware, type SoftwareErgaenzungen } from "./software-erweiterungen.ts";
import type { Daten } from "./typen.ts";

const original = basis as unknown as Daten;
const ergaenzung = neu as unknown as SoftwareErgaenzungen;

test("17 zusätzliche Profile erhalten die ursprünglichen Softwareangaben", () => {
  const d = ergaenzeSoftware(original, ergaenzung);
  assert.equal(neu.anbieter.length, 17);
  assert.equal(d.anbieter.length, 47);
  assert.deepEqual(d.anbieter.slice(0, original.anbieter.length), original.anbieter);
  assert.equal(original.anbieter.length, 30);
  for (const a of neu.anbieter) {
    assert.ok(d.routen.includes(a.url));
    assert.ok(d.bausteine.find((b) => b.slug === a.baustein)?.anbieter.includes(a.slug));
  }
});

test("Neue Analysen enthalten Quellen und einen belegten Deutschlandbezug", () => {
  for (const a of ergaenzung.anbieter) {
    const r = ergaenzung.reviews[a.slug];
    assert.ok(r.methodik.includes("keinen eigenen Praxistest"));
    assert.ok(r.deutschland.text.includes("Deutschland") || r.deutschland.text.includes("deutschen Markt"));
    assert.ok(a.quellen.some((q) => q.url === r.deutschland.quelle));
    assert.ok(r.abschnitte.length >= 4);
    for (const abschnitt of r.abschnitte) {
      assert.ok(abschnitt.absaetze.every((p) => p.trim().length > 0));
      assert.ok(abschnitt.quellen.length > 0);
      assert.ok(abschnitt.quellen.every((i) => Number.isInteger(i) && i >= 0 && i < a.quellen.length));
    }
  }
});

test("Doppelte Profile und fehlende Kategorien werden bei der Ergänzung abgelehnt", () => {
  const doppelt = structuredClone(ergaenzung);
  doppelt.anbieter[0].slug = original.anbieter[0].slug;
  assert.throws(() => ergaenzeSoftware(original, doppelt), /Doppeltes Softwareprofil/);
  const falsch = structuredClone(ergaenzung);
  falsch.anbieter[0].baustein = "unbekannt";
  assert.throws(() => ergaenzeSoftware(original, falsch), /unbekannte Kategorie/);
});
