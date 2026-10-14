import { test } from "node:test";
import assert from "node:assert/strict";
import { bannerSatzFuer, istLive, linkFuer } from "./partner.ts";
import { partner as partnerDaten, anbieterNachSlug } from "./daten.ts";
import type { Partner } from "./typen.ts";

const sage = (aktiv: boolean, zielLink: string, tiefenlinks = false): Partner => ({
  schluessel: "sage",
  name: "Sage",
  produkte: ["sage-100"],
  netzwerk: "Impact",
  aktiv,
  zielLink,
  tiefenlinks,
  werbemittel: { programmId: 1, saetze: {}, einsatz: [] },
});

test("im ausgelieferten Datenstand sind genau die vier freigegebenen Partner live", () => {
  assert.ok(partnerDaten.length > 0);
  assert.deepEqual(partnerDaten.filter(istLive).map((p) => p.schluessel).sort(), ["odoo", "pipedrive", "sage", "weclapp"]);
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
  const l = linkFuer(a, "profil-sage-100-kopf", [sage(false, "{{SAGE_NETZWERKLINK_FUER_DIESE_DOMAIN}}")]);
  assert.equal(l.href, a.zielUrl);
  assert.equal(l.werbung, false);
  assert.equal(l.partner, null);
  const ohnePartner = anbieterNachSlug.get("personio")!;
  const direkt = linkFuer(ohnePartner, "start", partnerDaten);
  assert.equal(direkt.href, ohnePartner.zielUrl);
  assert.equal(direkt.werbung, false);
});

test("Impact Tiefenlink nur auf ausdrückliche Freigabe: Ziel im Parameter u, Platzierung als subId1", () => {
  const a = anbieterNachSlug.get("sage-100")!;
  const l = linkFuer(a, "profil-sage-100-kopf", [sage(true, "https://sage.example/c/1", true)]);
  assert.equal(
    l.href,
    `https://sage.example/c/1?u=${encodeURIComponent(a.zielUrl)}&subId1=profil-sage-100-kopf`,
  );
  assert.equal(l.werbung, true);
  const mitQuery = linkFuer(a, "x", [sage(true, "https://sage.example/c/1?a=b", true)]);
  assert.ok(mitQuery.href.startsWith("https://sage.example/c/1?a=b&u="));
});

test("Sage Impact Link bleibt in jeder Platzierung unverändert und trägt die Werbekennzeichnung", () => {
  const sageLive = partnerDaten.find((p) => p.schluessel === "sage")!;
  assert.equal(sageLive.zielLink, "https://sagegmbh.sjv.io/X4qb2G");
  assert.notEqual(sageLive.tiefenlinks, true);
  for (const slug of sageLive.produkte) {
    const a = anbieterNachSlug.get(slug)!;
    for (const platzierung of ["start-entdecken", "profil-kopf", "profil-leiste", "start-tarife-" + slug, "verzeichnis"]) {
      const l = linkFuer(a, platzierung, partnerDaten);
      assert.equal(l.href, "https://sagegmbh.sjv.io/X4qb2G", `${slug} ${platzierung}`);
      assert.equal(l.werbung, true);
      assert.equal(l.partner, "sage");
    }
  }
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
  // Im ausgelieferten Datenstand ist Sage live, hat aber keine Werbemittel: Banner bleiben aus.
  assert.equal(bannerSatzFuer({ art: "anbieterakte", anbieter: a }, partnerDaten), null);
  const live = [sage(true, "https://sage.example/c/1")];
  assert.equal(bannerSatzFuer({ art: "anbieterakte", anbieter: a }, live)?.satz, "erp");
  assert.equal(bannerSatzFuer({ art: "baustein", baustein: "betrieb" }, live)?.satz, "operations");
  assert.equal(bannerSatzFuer({ art: "baustein", baustein: "finanzen" }, live), null);
  const hr = anbieterNachSlug.get("sage-hr")!;
  assert.equal(bannerSatzFuer({ art: "anbieterakte", anbieter: hr }, live)?.satz, "hr");
  const fremd = anbieterNachSlug.get("personio")!;
  assert.equal(bannerSatzFuer({ art: "anbieterakte", anbieter: fremd }, live), null);
});
