import { test } from "node:test";
import assert from "node:assert/strict";
import { istMaschinell, weiterleitungFuerAnbieter, weiterleitungFuerBanner } from "./weiterleitung.ts";
import { partner as partnerDaten, anbieterNachSlug } from "./daten.ts";
import { sageAnzeigenNachId } from "./sage-werbemittel.ts";
import { antwortFuer } from "./weiterleitung-http.ts";

const BROWSER = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
const anfrage = (platzierung: string | null = "profil-sage-hr-payroll-kopf", userAgent: string | null = BROWSER, zaehlen = true) => ({ platzierung, userAgent, zaehlen });

test("Sage Klick: 302 auf den Impact Kurzlink mit Tiefenlink auf die Produktseite und Platzierung als subId1", () => {
  const a = anbieterNachSlug.get("sage-hr-payroll")!;
  const r = weiterleitungFuerAnbieter("sage-hr-payroll", anfrage());
  assert.equal(r.status, 302);
  if (r.status !== 302) return;
  const url = new URL(r.ort);
  assert.equal(url.origin, "https://sagegmbh.sjv.io");
  assert.equal(url.pathname, "/DWr9Ld");
  assert.equal(url.searchParams.get("u"), a.zielUrl);
  assert.equal(url.searchParams.get("subId1"), "profil-sage-hr-payroll-kopf");
  assert.deepEqual(r.protokoll, { ereignis: "partnerklick", partner: "sage", ziel: "sage-hr-payroll", platzierung: "profil-sage-hr-payroll-kopf" });
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

test("kein offener Redirect: manipulierte Platzierung verändert nur subId1, nie das Ziel", () => {
  const r = weiterleitungFuerAnbieter("sage-100", anfrage("https://evil.example/&u=x"));
  assert.equal(r.status, 302);
  if (r.status !== 302) return;
  const url = new URL(r.ort);
  assert.equal(url.origin, "https://sagegmbh.sjv.io");
  assert.equal(url.searchParams.getAll("u").length, 1);
  assert.equal(url.searchParams.get("u"), anbieterNachSlug.get("sage-100")!.zielUrl);
  assert.match(url.searchParams.get("subId1")!, /^[a-z0-9_-]+$/);
});

test("Banner Klick: 302 auf den unveränderten Trackinglink der Anzeige plus subId1", () => {
  const anzeige = sageAnzeigenNachId.get(3723304)!;
  const r = weiterleitungFuerBanner("3723304", anfrage("startseite-sage-operations-tarife"));
  assert.equal(r.status, 302);
  if (r.status !== 302) return;
  assert.equal(r.ort, `${anzeige.trackingLink}?subId1=startseite-sage-operations-tarife`);
  assert.deepEqual(r.protokoll, { ereignis: "partnerklick", partner: "sage", ziel: "banner:3723304", platzierung: "startseite-sage-operations-tarife" });
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
    assert.match(zaehlend.headers.get("location")!, /^https:\/\/sagegmbh\.sjv\.io\/DWr9Ld\?u=/);
    assert.equal(zeilen.length, 1);
    const eintrag = JSON.parse(zeilen[0]);
    assert.deepEqual(Object.keys(eintrag).sort(), ["ereignis", "partner", "platzierung", "zeit", "ziel"]);
    assert.equal(eintrag.partner, "sage");

    const fehlt = antwortFuer({ status: 404 });
    assert.equal(fehlt.status, 404);
    assert.equal(fehlt.headers.get("cache-control"), "no-store");
  } finally {
    console.info = original;
  }
});
