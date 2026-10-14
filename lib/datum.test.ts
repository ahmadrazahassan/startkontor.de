import { test } from "node:test";
import assert from "node:assert/strict";
import { formatiereIso, heuteIso, parseDeutschesDatum } from "./datum.ts";

test("deutsche Daten werden zu ISO", () => {
  assert.equal(parseDeutschesDatum("25. September 2026"), "2026-09-25");
  assert.equal(parseDeutschesDatum("1. Januar 2025"), "2025-01-01");
  assert.equal(parseDeutschesDatum("13. Oktober 2026"), "2026-10-13");
  assert.equal(parseDeutschesDatum("3. März 2027"), "2027-03-03");
  assert.equal(parseDeutschesDatum("1. Januar 2025"), "2025-01-01");
});

test("Unlesbares ergibt null", () => {
  assert.equal(parseDeutschesDatum("25. und 27. September 2026"), null);
  assert.equal(parseDeutschesDatum("Mitte Oktober"), null);
  assert.equal(parseDeutschesDatum("32. Januar 2026"), null);
  assert.equal(parseDeutschesDatum("5. Foo 2026"), null);
});

test("ISO wird zu langem deutschen Datum", () => {
  assert.equal(formatiereIso("2026-09-25"), "25. September 2026");
  assert.equal(formatiereIso("2027-01-01"), "1. Januar 2027");
  assert.throws(() => formatiereIso("morgen"));
});

test("heuteIso nutzt die Zeitzone Berlin", () => {
  // 23:30 UTC am 31. Dezember ist in Berlin bereits der 1. Januar
  assert.equal(heuteIso(new Date("2026-12-31T23:30:00Z")), "2027-01-01");
  assert.equal(heuteIso(new Date("2026-10-13T10:00:00Z")), "2026-10-13");
});
