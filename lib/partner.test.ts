import { test } from "node:test";
import assert from "node:assert/strict";
import { bannerSatzFuer, bereinigePlatzierung, bereinigeSeite, istLive, linkFuer, mitImpactKennungen, partnerZielFuer, relFuer, weiterleitungsPfadBanner } from "./partner.ts";
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

test("Sage CTAs laufen über die eigene Weiterleitung und enden beim Impact-Produktlink des jeweiligen Produkts", () => {
  const sage = partnerDaten.find((p) => p.schluessel === "sage")!;
  assert.equal(sage.zielLink, "https://sagegmbh.sjv.io/DWr9Ld");
  assert.equal(sage.netzwerk, "Impact");
  assert.deepEqual(sage.impact, { programm: "Sage Germany", programmId: 27498, partnerId: 7969203, medienEigenschaft: 9006402, website: "startkontor.de" });
  assert.equal(sage.produkte.length, 8);
  assert.deepEqual(Object.keys(sage.produktLinks!).sort(), [...sage.produkte].sort());
  assert.equal(new Set(Object.values(sage.produktLinks!)).size, 8, "jedes Produkt hat einen eigenen Link");
  for (const slug of sage.produkte) {
    const anbieter = anbieterNachSlug.get(slug)!;
    const link = linkFuer(anbieter, `profil-${slug}-kopf`, partnerDaten);
    assert.equal(link.href, `/weiter/${slug}?p=profil-${slug}-kopf`);
    assert.equal(link.werbung, true);
    assert.equal(link.partner, "sage");
    const ziel = partnerZielFuer(anbieter, `profil-${slug}-kopf`, partnerDaten, `anbieter/${slug}`)!;
    assert.equal(ziel.url, `${sage.produktLinks![slug]}?sharedid=startkontor.de&subId1=profil-${slug}-kopf&subId2=${encodeURIComponent(`anbieter/${slug}`)}&subId3=textlink`);
    assert.equal(ziel.partner, "sage");
  }
});

test("Impact-Kennungen: Media Property nur bei langen Links ohne sie, Website, Platzierung, Seite und Linkart", () => {
  const p = { impact: { programm: "x", programmId: 1, partnerId: 2, medienEigenschaft: 9006402, website: "startkontor.de" } };
  assert.equal(
    mitImpactKennungen("https://sagegmbh.sjv.io/c/7969203/3723304/27498", p, { platzierung: "a", seite: "anbieter/sage-100", art: "banner" }),
    "https://sagegmbh.sjv.io/c/7969203/3723304/27498?partnerpropertyid=9006402&sharedid=startkontor.de&subId1=a&subId2=anbieter%2Fsage-100&subId3=banner",
  );
  assert.equal(
    mitImpactKennungen("https://sagegmbh.sjv.io/c/1/2/3?partnerpropertyid=5", p, { platzierung: null, seite: null, art: "textlink" }),
    "https://sagegmbh.sjv.io/c/1/2/3?partnerpropertyid=5&sharedid=startkontor.de&subId3=textlink",
  );
  assert.equal(mitImpactKennungen("https://sagegmbh.sjv.io/enMjaO", p, { platzierung: "b", seite: null, art: "textlink" }), "https://sagegmbh.sjv.io/enMjaO?sharedid=startkontor.de&subId1=b&subId3=textlink");
  assert.equal(mitImpactKennungen("https://sagegmbh.sjv.io/enMjaO", {}, { platzierung: null, seite: null, art: "textlink" }), "https://sagegmbh.sjv.io/enMjaO?subId3=textlink");
});

test("Seitenkennung wird bereinigt", () => {
  assert.equal(bereinigeSeite("/"), "startseite");
  assert.equal(bereinigeSeite("/anbieter/sage-100/"), "anbieter/sage-100");
  assert.equal(bereinigeSeite("//Ratgeber//Lohn ä?x=1"), "ratgeber/lohn-x-1");
  assert.equal(bereinigeSeite(`/${"ab/".repeat(60)}`)!.length <= 100, true);
  assert.ok(!bereinigeSeite(`/${"ab/".repeat(60)}`)!.endsWith("/"));
  assert.equal(bereinigeSeite(null), null);
});

test("Freigegebene Direktlinks behalten sämtliche Betreiberparameter in jeder Platzierung", () => {
  for (const slug of ["pipedrive", "weclapp", "odoo"]) {
    const a = anbieterNachSlug.get(slug)!;
    const p = partnerDaten.find((x) => x.schluessel === slug)!;
    for (const platzierung of ["start-entdecken", "profil-kopf", "profil-leiste", "verzeichnis"]) {
      const l = linkFuer(a, platzierung, partnerDaten);
      assert.equal(l.href, `/weiter/${slug}?p=${platzierung}`);
      assert.equal(l.werbung, true);
      assert.equal(l.partner, slug);
      assert.equal(partnerZielFuer(a, platzierung, partnerDaten)!.url, p.zielLink);
    }
  }
});

test("Werbelinks senden die Herkunftsdomain mit, normale externe Links nicht", () => {
  assert.equal(relFuer(true), "sponsored nofollow noopener");
  assert.equal(relFuer(false), "noopener noreferrer");
  assert.ok(!relFuer(true).includes("noreferrer"));
});

test("Platzierungskennung wird bereinigt", () => {
  assert.equal(bereinigePlatzierung("Profil Sage-100 / Kopf"), "profil-sage-100-kopf");
  assert.equal(bereinigePlatzierung("<script>x</script>"), "script-x-script");
  assert.equal(bereinigePlatzierung("a".repeat(200))?.length, 64);
  assert.equal(bereinigePlatzierung(""), null);
  assert.equal(bereinigePlatzierung(null), null);
  assert.equal(weiterleitungsPfadBanner(3723304, "startseite-sage-operations-tarife"), "/weiter/banner/3723304?p=startseite-sage-operations-tarife");
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
  assert.equal(partnerZielFuer(a, "profil-sage-100-kopf", partnerDaten.filter((p) => p.schluessel !== "sage")), null);
});

test("Impact ohne Produktlink: Tiefenlink im Parameter u, Platzierung als subId1", () => {
  const a = anbieterNachSlug.get("sage-100")!;
  const z = partnerZielFuer(a, "profil-sage-100-kopf", [sage(true, "https://sage.example/c/1")])!;
  assert.equal(z.url, `https://sage.example/c/1?u=${encodeURIComponent(a.zielUrl)}&subId1=profil-sage-100-kopf&subId3=textlink`);
  const mitQuery = partnerZielFuer(a, "x", [sage(true, "https://sage.example/c/1?a=b")])!;
  assert.ok(mitQuery.url.startsWith("https://sage.example/c/1?a=b&u="));
  const l = linkFuer(a, "profil-sage-100-kopf", [sage(true, "https://sage.example/c/1")]);
  assert.equal(l.href, "/weiter/sage-100?p=profil-sage-100-kopf");
  assert.equal(l.werbung, true);
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

test("jedes Sage-Profil erhält eine aktive thematische Bannerkampagne", () => {
  const sageProfile = [...anbieterNachSlug.values()].filter((anbieter) => anbieter.partner === "sage");
  assert.ok(sageProfile.length > 0);
  for (const anbieter of sageProfile) {
    assert.ok(bannerSatzFuer({ art: "anbieterakte", anbieter }, partnerDaten), `Kein Banner für ${anbieter.slug}`);
  }
});

test("Startseite kann freigegebene Kampagnen an passenden Stellen ausspielen", () => {
  for (const satz of ["hr", "erp", "intacct", "operations"] as const) {
    assert.equal(bannerSatzFuer({ art: "startseite", satz }, partnerDaten)?.satz, satz);
  }
});
