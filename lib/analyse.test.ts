import assert from "node:assert/strict";
import test from "node:test";
import tarifeRoh from "../data/tarife.json" with { type: "json" };
import zahlenRoh from "../data/zahlen.json" with { type: "json" };
import { anbieter } from "./daten.ts";
import { betragText, logPosition, median, preisposition, profilzahlen, transparenzwert, type PreisGruppe, type Tarife } from "./analyse.ts";

const basis = {
  preis: { status: "veroeffentlicht" as const, anker: "10 Euro", zeilen: ["Basic 10 Euro", "Plus 20 Euro", "Pro 30 Euro"] },
  monatlichKuendbar: true as boolean | null,
  vertrag: "Monatlich kündbar.",
  grenzen: ["a", "b", "c"],
  quellen: [{ titel: "x", url: "https://example.org" }, { titel: "y", url: "https://example.org/2" }, { titel: "z", url: "https://example.org/3" }],
  herstellerprofil: true,
  analyse: false,
};

test("Transparenzwert: voll belegtes Profil erreicht 5,0", () => {
  const t = transparenzwert(basis);
  assert.equal(t.gesamt, 5);
  assert.equal(t.einordnung, "Sehr gut belegt");
  assert.equal(t.kriterien.length, 6);
});

test("Transparenzwert: Preis auf Anfrage und unbelegte Kündigung senken den Wert", () => {
  const t = transparenzwert({ ...basis, preis: { status: "anfrage", zeilen: ["Individuelles Angebot"] }, monatlichKuendbar: null, herstellerprofil: false, analyse: true });
  const nach = Object.fromEntries(t.kriterien.map((k) => [k.schluessel, k.wert]));
  assert.equal(nach.preis, 2);
  assert.equal(nach.stufen, 1);
  assert.equal(nach.vertrag, 3);
  assert.equal(nach.hersteller, 3);
  assert.ok(t.gesamt < 4);
});

test("Transparenzwert: alle Werte liegen zwischen 1 und 5 und die Zahl ist auf eine Stelle gerundet", () => {
  for (const a of anbieter) {
    const t = transparenzwert({ ...a, herstellerprofil: false, analyse: false });
    assert.ok(t.gesamt >= 1 && t.gesamt <= 5, a.slug);
    assert.equal(t.gesamt, Math.round(t.gesamt * 10) / 10, a.slug);
    for (const k of t.kriterien) assert.ok(k.wert >= 1 && k.wert <= 5 && k.grund.length > 0, `${a.slug} ${k.schluessel}`);
  }
});

test("Tarifstufen: jeder Betrag steht wörtlich im Preistext des Profils", () => {
  const profile = tarifeRoh.profile as Record<string, Tarife>;
  for (const [slug, t] of Object.entries(profile)) {
    const a = anbieter.find((x) => x.slug === slug);
    assert.ok(a, `Unbekanntes Profil ${slug}`);
    const text = [a.preis.anker ?? "", ...(a.preis.zeilen ?? [])].join(" | ");
    assert.ok(t.stufen.length >= 2, `${slug}: mindestens zwei Stufen`);
    for (const s of t.stufen) {
      const gefunden = s.betrag === 0 ? /kostenlos|0 Euro/.test(text) : new RegExp(`(^|[^\\d.,])${betragText(s.betrag).replace(/[.,]/g, (z) => `\\${z}`)} Euro`).test(text);
      assert.ok(gefunden, `${slug}: ${s.name} ${betragText(s.betrag)} Euro steht nicht im Preistext`);
      assert.ok(text.includes(s.name.split(" ")[0]), `${slug}: Stufenname ${s.name} fehlt im Preistext`);
    }
  }
});

test("Preisposition: Rang, Median und Abweichung", () => {
  const gruppe: PreisGruppe = {
    schluessel: "pauschal",
    titel: "t",
    einheit: "im Monat",
    punkte: [10, 20, 30, 40, 100].map((betrag, i) => ({ slug: `p${i}`, name: `P${i}`, betrag, baustein: "finanzen", href: `/anbieter/p${i}` })),
  };
  const p = preisposition("p1", [gruppe]);
  assert.ok(p);
  assert.equal(p.median, 30);
  assert.equal(p.rang, 2);
  assert.equal(p.anzahl, 5);
  assert.equal(p.abweichung, -33);
  assert.equal(preisposition("unbekannt", [gruppe]), null);
});

test("Preisposition: alle Programme der Preislisten sind bekannte Anbieter", () => {
  for (const liste of [zahlenRoh.preise.pauschal, zahlenRoh.preise.jeNutzer]) {
    for (const z of liste) assert.ok(anbieter.some((a) => a.slug === z.slug), z.slug);
  }
});

test("Hilfen: Median, logarithmische Position, Betragsschreibweise, Profilzahlen", () => {
  assert.equal(median([3, 1, 2]), 2);
  assert.equal(median([1, 2, 3, 4]), 2.5);
  assert.equal(logPosition(1, 1, 100), 0);
  assert.equal(logPosition(100, 1, 100), 1);
  assert.ok(Math.abs(logPosition(10, 1, 100) - 0.5) < 1e-9);
  assert.equal(logPosition(5, 5, 5), 0.5);
  assert.equal(betragText(7.9), "7,90");
  assert.equal(betragText(1390), "1.390");
  const z = profilzahlen({ funktionen: ["a", "b"], grenzen: ["a"], fragen: ["a", "b", "c"], quellen: [] });
  assert.deepEqual(z.map((x) => x.wert), [2, 1, 3, 0]);
  assert.equal(z[0].maximum, 3);
});
