import { test } from "node:test";
import assert from "node:assert/strict";
import { pfadSchritte, wendeBegriffeAn } from "./begriffe.ts";

test("Pfade mit Punkten und Indizes werden zerlegt", () => {
  assert.deepEqual(pfadSchritte("navigation.kopfzeile[2].label"), ["navigation", "kopfzeile", 2, "label"]);
  assert.deepEqual(pfadSchritte("a.b[0][1]"), ["a", "b", 0, 1]);
});

test("Ersetzt Text im Pfad und lässt das Original unverändert", () => {
  const roh = { nav: [{ label: "Anbieter" }, { label: "Wissen" }], text: "Jede Anbieterakte nennt das Datum." };
  const neu = wendeBegriffeAn(roh, [
    { pfad: "nav[0].label", alt: "Anbieter", neu: "Software Reviews" },
    { pfad: "text", alt: "Jede Anbieterakte nennt", neu: "Jedes Review nennt" },
  ]);
  assert.equal(neu.nav[0].label, "Software Reviews");
  assert.equal(neu.text, "Jedes Review nennt das Datum.");
  assert.equal(roh.nav[0].label, "Anbieter");
});

test("Fehlender alter Text, falscher Pfad und Nicht Text führen zu Fehlern", () => {
  const roh = { a: { b: "x" }, n: 3 };
  assert.throws(() => wendeBegriffeAn(roh, [{ pfad: "a.b", alt: "y", neu: "z" }]), /enthält/);
  assert.throws(() => wendeBegriffeAn(roh, [{ pfad: "a.c.d", alt: "y", neu: "z" }]), /existiert nicht/);
  assert.throws(() => wendeBegriffeAn(roh, [{ pfad: "n", alt: "3", neu: "4" }]), /kein Text/);
});
