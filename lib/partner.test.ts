import { test } from "node:test";
import assert from "node:assert/strict";
import { bannerSatzFuer, istLive, linkFuer } from "./partner.ts";
import { partner as partnerDaten, anbieterNachSlug } from "./daten.ts";
import type { Partner } from "./typen.ts";

const sage = (aktiv: boolean, zielLink: string): Partner => ({
  schluessel: "sage",
  name: "Sage",
  produkte: ["sage-100"],
  netzwerk: "Impact",
  aktiv,
  zielLink,
  werbemittel: { programmId: 1, saetze: {}, einsatz: [] },
});

test("im ausgelieferten Datenstand sind genau die vier freigegebenen Partner live", () => {
  assert.ok(partnerDaten.length > 0);
  assert.deepEqual(partnerDaten.filter(istLive).map((p) => p.schluessel).sort(), ["odoo", "pipedrive", "sage", "weclapp"]);
});

test("Sage CTAs verwenden den genehmigten Impact-Kurzlink unverändert", () => {
  const sage = partnerDaten.find((p) => p.schluessel === "sage")!;
  assert.equal(sage.zielLink, "https://sagegmbh.sjv.io/DWr9Ld");
  assert.equal(sage.produkte.length, 8);
  for (const slug of sage.produkte) {
    const anbieter = anbieterNachSlug.get(slug)!;
    const link = linkFuer(anbieter, `profil-${slug}-kopf`, partnerDaten);
    assert.equal(link.href, "https://sagegmbh.sjv.io/DWr9Ld");
    assert.equal(link.werbung, true);
    assert.equal(link.partner, "sage");
  }
});

test("Freigegebene Direktlinks behalten sämtliche Betreiberparameter in jeder Platzierung", () => {
  for (const slug of ["pipedrive", "weclapp", "odoo"]) {
    const a = anbieterNachSlug.get(slug)!;
    const p = partnerDaten.find((x) => x.schluessel === slug)!;
    for (const platzierung of ["start-entdecken", "profil-kopf", "profil-leiste", "verzeichnis"]) {
      const l = linkFuer(a, platzierung, partnerDaten);
      assert.equal(l.href, p.zielLink);
      assert.equal(l.werbung, true);
      assert.equal(l.partner, slug);
    }
  }
});

test("live nur mit aktiv UND ausgefülltem Link", () => {
  assert.equal(istLive(sage(true, "{{SAGE_NETZWERKLINK_FUER_DIESE_DOMAIN}}")), false);
  assert.equal(istLive(sage(false, "https://sage.example/c/1")), false);
  assert.equal(istLive(sage(true, "")), false);
  assert.equal(istLive(sage(true, "https://sage.example/c/1")), true);
  assert.equal(istLive(null), false);
});

test("ohne live Partner geht jeder Link direkt zum Hersteller, ohne Werbung", () => {
  const a = anbieterNachSlug.get("sage-100")!;
  const l = linkFuer(a, "profil-sage-100-kopf", partnerDaten.filter((p) => p.schluessel !== "sage"));
  assert.equal(l.href, a.zielUrl);
  assert.equal(l.werbung, false);
  assert.equal(l.partner, null);
});

test("Impact Tiefenlink: Ziel im Parameter u, Platzierung als subId1", () => {
  const a = anbieterNachSlug.get("sage-100")!;
  const l = linkFuer(a, "profil-sage-100-kopf", [sage(true, "https://sage.example/c/1")]);
  assert.equal(
    l.href,
    `https://sage.example/c/1?u=${encodeURIComponent(a.zielUrl)}&subId1=profil-sage-100-kopf`,
  );
  assert.equal(l.werbung, true);
  const mitQuery = linkFuer(a, "x", [sage(true, "https://sage.example/c/1?a=b")]);
  assert.ok(mitQuery.href.startsWith("https://sage.example/c/1?a=b&u="));
});

test("Anbieter ohne Partner bleibt direkt, auch wenn andere Partner live sind", () => {
  const a = anbieterNachSlug.get("personio")!;
  assert.equal(a.partner, null);
  const l = linkFuer(a, "x", [sage(true, "https://sage.example/c/1")]);
  assert.equal(l.href, a.zielUrl);
  assert.equal(l.werbung, false);
});

test("Banner nur bei live Partner und erlaubter Platzierung", () => {
  const a = anbieterNachSlug.get("sage-100")!;
  assert.equal(bannerSatzFuer({ art: "anbieterakte", anbieter: a }, partnerDaten)?.satz, "erp");
  assert.equal(bannerSatzFuer({ art: "baustein", baustein: "betrieb" }, partnerDaten)?.satz, "operations");
  assert.equal(bannerSatzFuer({ art: "baustein", baustein: "finanzen" }, partnerDaten), null);
  const hr = anbieterNachSlug.get("sage-hr")!;
  assert.equal(bannerSatzFuer({ art: "anbieterakte", anbieter: hr }, partnerDaten)?.satz, "hr");
  const intacct = anbieterNachSlug.get("sage-intacct")!;
  assert.equal(bannerSatzFuer({ art: "anbieterakte", anbieter: intacct }, partnerDaten)?.satz, "intacct");
  const fremd = anbieterNachSlug.get("personio")!;
  assert.equal(bannerSatzFuer({ art: "anbieterakte", anbieter: fremd }, partnerDaten), null);
  assert.equal(bannerSatzFuer({ art: "anbieterakte", anbieter: hr }, [sage(false, "https://sage.example/c/1")]), null);
});
