import { test } from "node:test";
import assert from "node:assert/strict";
import { istMaschinell, seiteAusReferer, weiterleitungFuerAnbieter, weiterleitungFuerBanner } from "./weiterleitung.ts";
import { partner as partnerDaten, anbieterNachSlug } from "./daten.ts";
import { sageAnzeigenNachId } from "./sage-werbemittel.ts";
import { antwortFuer } from "./weiterleitung-http.ts";

const BROWSER = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
const anfrage = (platzierung: string | null = "profil-sage-hr-payroll-kopf", userAgent: string | null = BROWSER, zaehlen = true, seite: string | null = null) => ({ platzierung, userAgent, zaehlen, seite });

test("Sage Klick: 302 auf den Impact-Produktlink mit Website, Platzierung, Seite und Linkart als Kennungen", () => {
  const r = weiterleitungFuerAnbieter("sage-hr-payroll", anfrage("profil-sage-hr-payroll-kopf", BROWSER, true, "anbieter/sage-hr-payroll"));
  assert.equal(r.status, 302);
  if (r.status !== 302) return;
  const url = new URL(r.ort);
  assert.equal(url.origin, "https://sagegmbh.sjv.io");
  assert.equal(url.pathname, "/oN3JGO");
  assert.equal(url.searchParams.has("u"), false, "Zielseite steckt im Produktlink");
  assert.equal(url.searchParams.get("sharedid"), "startkontor.de");
  assert.equal(url.searchParams.get("subId1"), "profil-sage-hr-payroll-kopf");
  assert.equal(url.searchParams.get("subId2"), "anbieter/sage-hr-payroll");
  assert.equal(url.searchParams.get("subId3"), "textlink");
  assert.deepEqual(r.protokoll, { ereignis: "partnerklick", partner: "sage", ziel: "sage-hr-payroll", platzierung: "profil-sage-hr-payroll-kopf", seite: "anbieter/sage-hr-payroll" });
});

test("Herkunftsseite nur aus dem Referer der eigenen Website, ohne Parameter", () => {
  assert.equal(seiteAusReferer("https://www.startkontor.de/anbieter/sage-100/?utm_source=x#preise", "www.startkontor.de"), "anbieter/sage-100");
  assert.equal(seiteAusReferer("https://www.startkontor.de/", "www.startkontor.de"), "startseite");
  assert.equal(seiteAusReferer("https://WWW.startkontor.de/Kategorien/Lohn", "www.startkontor.de"), "kategorien/lohn");
  assert.equal(seiteAusReferer("https://evil.example/anbieter/sage-100/", "www.startkontor.de"), null);
  assert.equal(seiteAusReferer("https://startkontor.de.evil.example/", "startkontor.de"), null);
  assert.equal(seiteAusReferer("kein url", "www.startkontor.de"), null);
  assert.equal(seiteAusReferer(null, "www.startkontor.de"), null);
  assert.equal(seiteAusReferer("https://www.startkontor.de/x", null), null);
  assert.match(seiteAusReferer(`https://www.startkontor.de/${"a/".repeat(200)}<script>`, "www.startkontor.de")!, /^[a-z0-9/_-]{1,100}$/);
});

test("Alle Sage-Produkte haben einen eigenen Impact-Produktlink", () => {
  const sage = partnerDaten.find((p) => p.schluessel === "sage")!;
  for (const slug of sage.produkte) {
    const r = weiterleitungFuerAnbieter(slug, anfrage(`profil-${slug}-kopf`));
    assert.equal(r.status, 302, slug);
    if (r.status !== 302) continue;
    assert.ok(r.ort.startsWith(`${sage.produktLinks![slug]}?`), slug);
  }
});

test("Direktpartner: Zieladresse unverändert, ohne zusätzliche Parameter", () => {
  for (const slug of ["pipedrive", "weclapp", "odoo"]) {
    const r = weiterleitungFuerAnbieter(slug, anfrage("profil-kopf"));
    assert.equal(r.status, 302);
    if (r.status !== 302) continue;
    assert.equal(r.ort, partnerDaten.find((p) => p.schluessel === slug)!.zielLink);
  }
});

test("Unbekannter Anbieter, Anbieter ohne Partner und nicht aktiver Partner: 404, nie ein Redirect", () => {
  assert.equal(weiterleitungFuerAnbieter("gibt-es-nicht", anfrage()).status, 404);
  assert.equal(weiterleitungFuerAnbieter("personio", anfrage()).status, 404);
  assert.equal(weiterleitungFuerAnbieter("banner", anfrage()).status, 404);
  const ohneSage = partnerDaten.map((p) => (p.schluessel === "sage" ? { ...p, aktiv: false } : p));
  assert.equal(weiterleitungFuerAnbieter("sage-100", anfrage(), ohneSage).status, 404);
  assert.equal(weiterleitungFuerBanner("3723304", anfrage(), ohneSage).status, 404);
});

test("kein offener Redirect: manipulierte Platzierung und Seite verändern nur die Kennungen, nie das Ziel", () => {
  const r = weiterleitungFuerAnbieter("sage-100", anfrage("https://evil.example/&u=x", BROWSER, true, "https://evil.example/?u=x&subId1=y"));
  assert.equal(r.status, 302);
  if (r.status !== 302) return;
  const url = new URL(r.ort);
  assert.equal(url.origin, "https://sagegmbh.sjv.io");
  assert.equal(url.pathname, "/bkzQvv");
  assert.equal(url.searchParams.has("u"), false);
  assert.equal(url.searchParams.getAll("subId1").length, 1);
  assert.match(url.searchParams.get("subId1")!, /^[a-z0-9_-]+$/);
  assert.match(url.searchParams.get("subId2")!, /^[a-z0-9/_-]+$/);
});

test("Banner Klick: Trackinglink der Anzeige plus Media Property, Website und Kennungen", () => {
  const anzeige = sageAnzeigenNachId.get(3723304)!;
  const r = weiterleitungFuerBanner("3723304", anfrage("startseite-sage-operations-tarife", BROWSER, true, "startseite"));
  assert.equal(r.status, 302);
  if (r.status !== 302) return;
  assert.equal(
    r.ort,
    `${anzeige.trackingLink}?partnerpropertyid=9006402&sharedid=startkontor.de&subId1=startseite-sage-operations-tarife&subId2=startseite&subId3=banner`,
  );
  assert.deepEqual(r.protokoll, { ereignis: "partnerklick", partner: "sage", ziel: "banner:3723304", platzierung: "startseite-sage-operations-tarife", seite: "startseite" });
  const ohneSeite = weiterleitungFuerBanner("3723304", anfrage("x"));
  assert.equal(ohneSeite.status === 302 && new URL(ohneSeite.ort).searchParams.has("subId2"), false);
});

test("Banner: nur bekannte, aktive Anzeigen-IDs, nur Ziffern", () => {
  for (const id of ["abc", "-1", "3723304x", "0", "99999999", "", "3723304/../x", "1e3"]) {
    assert.equal(weiterleitungFuerBanner(id, anfrage()).status, 404, id);
  }
  for (const id of sageAnzeigenNachId.keys()) assert.equal(weiterleitungFuerBanner(String(id), anfrage()).status, 302, String(id));
});

test("Crawler, Linkvorschauen und Skripte lösen beim Partner keinen Klick aus", () => {
  for (const ua of ["Googlebot/2.1 (+http://www.google.com/bot.html)", "bingbot/2.0", "Slackbot-LinkExpanding 1.0", "WhatsApp/2.23", "curl/8.5.0", "python-requests/2.31", "Mozilla/5.0 HeadlessChrome/130", "facebookexternalhit/1.1", "", null]) {
    assert.equal(istMaschinell(ua), true, String(ua));
    const a = weiterleitungFuerAnbieter("sage-100", anfrage("x", ua));
    assert.equal(a.status, 302);
    if (a.status === 302) {
      assert.equal(a.ort, anbieterNachSlug.get("sage-100")!.zielUrl);
      assert.equal(a.protokoll, null);
    }
    const b = weiterleitungFuerBanner("3723304", anfrage("x", ua));
    assert.equal(b.status, 302);
    if (b.status === 302) {
      assert.equal(b.ort, sageAnzeigenNachId.get(3723304)!.landingPage);
      assert.equal(b.protokoll, null);
    }
  }
  assert.equal(istMaschinell(BROWSER), false);
  assert.equal(istMaschinell("Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1"), false);
  assert.equal(istMaschinell("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7; rv:128.0) Gecko/20100101 Firefox/128.0"), false);
});

test("HEAD zählt nicht und gibt den Partnerlink nicht preis", () => {
  const r = weiterleitungFuerAnbieter("sage-100", anfrage("x", BROWSER, false));
  assert.equal(r.status, 302);
  if (r.status === 302) {
    assert.equal(r.ort, anbieterNachSlug.get("sage-100")!.zielUrl);
    assert.equal(r.protokoll, null);
  }
});

test("HTTP Antwort: 302, nie zwischenspeichern, nicht indexieren", () => {
  const original = console.info;
  const zeilen: string[] = [];
  console.info = (z: string) => void zeilen.push(z);
  try {
    const ohneZaehlung = antwortFuer(weiterleitungFuerAnbieter("sage-100", anfrage("x", BROWSER, false)));
    assert.equal(ohneZaehlung.status, 302);
    assert.equal(ohneZaehlung.headers.get("cache-control"), "no-store");
    assert.match(ohneZaehlung.headers.get("x-robots-tag")!, /noindex/);
    assert.equal(zeilen.length, 0, "ohne Zählung kein Protokoll");

    const zaehlend = antwortFuer(weiterleitungFuerAnbieter("sage-100", anfrage("profil-sage-100-kopf")));
    assert.equal(zaehlend.status, 302);
    assert.match(zaehlend.headers.get("location")!, /^https:\/\/sagegmbh\.sjv\.io\/bkzQvv\?sharedid=startkontor\.de&subId1=/);
    assert.equal(zeilen.length, 1);
    const eintrag = JSON.parse(zeilen[0]);
    assert.deepEqual(Object.keys(eintrag).sort(), ["ereignis", "partner", "platzierung", "seite", "zeit", "ziel"]);
    assert.equal(eintrag.partner, "sage");

    const fehlt = antwortFuer({ status: 404 });
    assert.equal(fehlt.status, 404);
    assert.equal(fehlt.headers.get("cache-control"), "no-store");
  } finally {
    console.info = original;
  }
});
