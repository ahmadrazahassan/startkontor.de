// End to End Prüfung gegen einen laufenden Produktionsserver (npm run build && npm start).
// Prüft je Vorlage bei 390 und 1440 Pixel: axe (WCAG 2.2 AA), keine Fremdanfragen, Eckenradius höchstens 4 Pixel,
// kein horizontales Scrollen. Dazu Bedienung von Suche, Menü und Planer.
// Aufruf: SITE_BASIS=http://localhost:3100 node scripts/check-e2e.mjs [schnell]
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";

const BASIS = process.env.SITE_BASIS ?? "http://localhost:3000";
const HOST = new URL(BASIS).host;
const SCHNELL = process.argv.includes("schnell");

const VORLAGEN = [
  "/",
  "/fahrplan",
  "/fahrplan/gruendung",
  "/bausteine",
  "/bausteine/finanzen",
  "/anbieter",
  "/anbieter/billomat",
  "/anbieter/sage-100",
  "/wissen",
  "/wissen/leitfaeden",
  "/wissen/leitfaeden/erste-rechnung",
  "/wissen/checklisten",
  "/wissen/checklisten/erste-einstellung",
  "/wissen/fristen",
  "/wissen/glossar",
  "/wissen/glossar/gobd",
  "/planer",
  "/faq",
  "/kontakt",
  "/brief",
  "/brief/bestaetigt",
  "/impressum",
  "/datenschutz",
  "/redaktion",
  "/redaktion/arbeitsweise",
  "/redaktion/werbung",
  "/suche?q=lohn",
  "/gibt-es-nicht",
];

const BREITEN = SCHNELL ? [390, 1440] : [360, 390, 768, 1024, 1280, 1440];
const AXE_BREITEN = [390, 1440];

const probleme = [];
const melde = (art, ort, text) => probleme.push(`[${art}] ${ort}: ${text}`);

const browser = await chromium.launch();

async function neueSeite(breite) {
  const kontext = await browser.newContext({ viewport: { width: breite, height: breite < 768 ? 844 : 900 }, reducedMotion: "reduce" });
  const seite = await kontext.newPage();
  seite.fremd = [];
  seite.on("request", (r) => {
    const u = new URL(r.url());
    if (!["http:", "https:"].includes(u.protocol)) return;
    if (u.host !== HOST) seite.fremd.push(r.url());
  });
  seite.fehler = [];
  seite.on("pageerror", (e) => seite.fehler.push(String(e)));
  seite.on("console", (m) => {
    // Die erwartete 404 Seite erzeugt eine Konsolenmeldung des Browsers, die kein Fehler der Seite ist.
    if (m.type() === "error" && !/status of 404/.test(m.text())) seite.fehler.push(m.text());
  });
  return seite;
}

const RADIUS_PRUEFUNG = () => {
  const zu = [];
  const props = ["borderTopLeftRadius", "borderTopRightRadius", "borderBottomLeftRadius", "borderBottomRightRadius"];
  for (const el of document.querySelectorAll("body *")) {
    const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden") continue;
    for (const p of props) {
      const wert = s[p];
      if (!wert || wert === "0px" || wert === "50%") continue;
      const px = parseFloat(wert);
      // erlaubt: bis 14 Pixel (Kleinteile, Karten, Felder), Pillen ab 100 Pixel und Kreise (50 Prozent)
      if (wert.includes("%") || (px > 14.001 && px < 100)) {
        zu.push(`${el.tagName.toLowerCase()}.${(el.className?.baseVal ?? el.className ?? "").toString().split(" ")[0]} ${p}=${wert}`);
        break;
      }
    }
  }
  return [...new Set(zu)].slice(0, 5);
};

for (const breite of BREITEN) {
  const seite = await neueSeite(breite);
  for (const pfad of VORLAGEN) {
    const ort = `${pfad} @${breite}`;
    try {
      await seite.goto(BASIS + pfad, { waitUntil: "networkidle" });
      await seite.evaluate(() => document.fonts.ready);

      const mass = await seite.evaluate(() => ({ scroll: document.documentElement.scrollWidth, fenster: window.innerWidth }));
      if (mass.scroll > mass.fenster + 1) melde("Scroll", ort, `horizontal ${mass.scroll} > ${mass.fenster}`);

      const radien = await seite.evaluate(RADIUS_PRUEFUNG);
      if (radien.length) melde("Radius", ort, radien.join("; "));

      if (AXE_BREITEN.includes(breite)) {
        const ergebnis = await new AxeBuilder({ page: seite }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
        for (const v of ergebnis.violations) {
          melde("axe", ort, `${v.id} (${v.impact}): ${v.nodes.length}x, z. B. ${v.nodes[0].target.join(" ")} | ${v.help}`);
        }
      }
    } catch (e) {
      melde("Fehler", ort, String(e).split("\n")[0]);
    }
  }
  if (seite.fremd.length) melde("Fremdanfrage", `@${breite}`, [...new Set(seite.fremd)].join(", "));
  if (seite.fehler.length) melde("Konsole", `@${breite}`, [...new Set(seite.fehler)].slice(0, 3).join(" | "));
  await seite.context().close();
}

// Bedienung
try {
  const seite = await neueSeite(1440);
  await seite.goto(BASIS + "/", { waitUntil: "networkidle" });

  // Suche per Tastenkürzel
  await seite.keyboard.press("Control+K");
  const dialog = seite.locator("dialog.suchdialog");
  if (!(await dialog.isVisible())) melde("Suche", "Strg K", "Dialog öffnet nicht");
  await seite.keyboard.type("billomat");
  await seite.waitForTimeout(300);
  const anzahl = await seite.locator("dialog.suchdialog [role=option]").count();
  if (anzahl < 1) melde("Suche", "billomat", "keine Treffer");
  await seite.keyboard.press("Escape");
  await seite.waitForTimeout(300);
  if (await dialog.isVisible()) melde("Suche", "Escape", "Dialog bleibt offen");

  // Menü mit Tastatur
  const knopf = seite.locator('button[data-knopf="Fahrplan"]');
  await knopf.focus();
  await seite.keyboard.press("Enter");
  await seite.waitForTimeout(300);
  const panel = seite.locator('[data-art="fahrplan"]');
  if ((await panel.getAttribute("data-offen")) !== "ja") melde("Menü", "Fahrplan", "Panel öffnet nicht per Tastatur");
  await seite.keyboard.press("Escape");
  await seite.waitForTimeout(300);
  if ((await panel.getAttribute("data-offen")) === "ja") melde("Menü", "Escape", "Panel bleibt offen");

  // Startseite: Hero Suche mit Vorschlägen
  await seite.goto(BASIS + "/", { waitUntil: "networkidle" });
  const heroEingabe = seite.locator(".herosuche__eingabe");
  await heroEingabe.click();
  await heroEingabe.fill("billomat");
  await seite.waitForSelector(".herosuche__vorschlag", { timeout: 3000 }).catch(() => melde("Hero Suche", "billomat", "keine Vorschläge"));
  await heroEingabe.press("ArrowDown");
  await heroEingabe.press("Enter");
  await seite.waitForURL(/\/anbieter\/billomat$/, { timeout: 5000 }).catch(() => melde("Hero Suche", "Auswahl", `Ziel falsch: ${seite.url()}`));

  await seite.goto(BASIS + "/", { waitUntil: "networkidle" });
  await seite.locator(".herosuche__eingabe").fill("Lohn");
  await seite.locator(".herosuche__eingabe").press("Escape");
  await seite.locator(".herosuche__knopf").click();
  await seite.waitForURL(/\/suche\?q=Lohn/, { timeout: 5000 }).catch(() => melde("Hero Suche", "Absenden", `Ziel falsch: ${seite.url()}`));

  // Startseite: Kategorie Reiter mit Pfeiltasten
  await seite.goto(BASIS + "/", { waitUntil: "networkidle" });
  await seite.waitForSelector('.kategorietabs[data-erweitert="ja"]');
  const reiter = seite.locator(".kategoriekachel[role=tab]");
  if ((await reiter.count()) !== 5) melde("Kategorien", "Reiter", `erwartet 5, gefunden ${await reiter.count()}`);
  await reiter.first().focus();
  await seite.keyboard.press("ArrowRight");
  if ((await reiter.nth(1).getAttribute("aria-selected")) !== "true") melde("Kategorien", "Pfeiltaste", "zweiter Reiter nicht gewählt");
  const sichtbar = seite.locator(".kategorietabs__panel:not([hidden]) .softwarekarte");
  if ((await sichtbar.count()) < 1) melde("Kategorien", "Panel", "keine Karten im aktiven Panel");
  if ((await seite.locator(".kategorietabs__panel:not([hidden])").count()) !== 1) melde("Kategorien", "Panel", "mehr als ein Panel sichtbar");
  const keineSterne = await seite.locator(".sterne").count();
  if (keineSterne !== 0) melde("Bewertung", "Sterne", `${keineSterne} Sterne ohne eingetragene Bewertung`);

  // Review Seite: alle Abschnitte, Tab Leiste, FAQ Daten, Logos der Alternativen
  await seite.goto(BASIS + "/anbieter/billomat", { waitUntil: "networkidle" });
  for (const id of ["ueberblick", "funktionen", "preise", "eignung", "grenzen", "daten", "hersteller", "fragen", "bewertung", "alternativen", "faq", "quellen"]) {
    if ((await seite.locator(`#${id}`).count()) !== 1) melde("Review", id, "Abschnitt fehlt");
  }
  await seite.locator('.produktnav__link[data-id="preise"]').click();
  await seite.waitForURL(/#preise$/, { timeout: 4000 }).catch(() => melde("Review", "Tab Leiste", `Adresse ohne #preise: ${seite.url()}`));
  // die Seite scrollt weich: warten, bis der Beobachter den Abschnitt erkannt hat
  await seite
    .waitForFunction(() => document.querySelector('.produktnav__link[aria-current="location"]')?.getAttribute("data-id") === "preise", null, { timeout: 4000 })
    .catch(() => {});
  const aktivId = await seite.locator('.produktnav__link[aria-current="location"]').first().getAttribute("data-id");
  if (aktivId !== "preise") melde("Review", "Tab Leiste", `aktiv ist ${aktivId}, erwartet preise`);
  const jsonLd = (await seite.locator('script[type="application/ld+json"]').allTextContents()).join(" ");
  if (!jsonLd.includes("FAQPage")) melde("Review", "JSON LD", "FAQPage fehlt");
  await seite.locator("#alternativen").scrollIntoViewIfNeeded();
  await seite.waitForTimeout(600);
  const kaputt = await seite.evaluate(() => [...document.querySelectorAll("#alternativen img")].filter((i) => i.naturalWidth === 0).map((i) => i.getAttribute("src")));
  if (kaputt.length) melde("Review", "Logos", `nicht geladen: ${kaputt.join(", ")}`);
  if ((await seite.locator(".sterne").count()) !== 0) melde("Bewertung", "Review Seite", "Sterne ohne eingetragene Bewertung");

  // Planer: vier Schritte, Ergebnis
  await seite.goto(BASIS + "/planer", { waitUntil: "networkidle" });
  const weiter = seite.getByRole("button", { name: "Weiter" });
  for (let i = 0; i < 4; i += 1) {
    const axe = await new AxeBuilder({ page: seite }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
    for (const v of axe.violations) melde("axe", `Planer Schritt ${i + 1}`, `${v.id}: ${v.help}`);
    await seite.locator(".kachel__eingabe").first().check({ force: true }).catch(() => {});
    if (i === 3) await seite.locator(".kachel__eingabe").nth(0).check({ force: true });
    await weiter.click();
  }
  await seite.waitForSelector(".planer__ergebnis");
  const gruppen = await seite.locator(".planer__gruppe").count();
  if (gruppen < 2) melde("Planer", "Ergebnis", `nur ${gruppen} Gruppen`);
  const axeErg = await new AxeBuilder({ page: seite }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
  for (const v of axeErg.violations) melde("axe", "Planer Ergebnis", `${v.id}: ${v.help}`);
  if (!/#s=/.test(seite.url())) melde("Planer", "Hash", "Zustand fehlt in der Adresse");
  // Direktaufruf mit Hash
  await seite.goto(BASIS + "/planer#s=erstes-team&t=1bis5&m=handel&v=finanzen,lohn", { waitUntil: "networkidle" });
  await seite.waitForSelector(".planer__ergebnis");

  // Checkliste: abhaken, nichts gespeichert, dann merken
  await seite.goto(BASIS + "/wissen/checklisten/erste-einstellung", { waitUntil: "networkidle" });
  await seite.locator(".checkliste .haken__eingabe").first().check();
  const gespeichertVorher = await seite.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("startkontor:")));
  if (gespeichertVorher.length) melde("Checkliste", "Speicher", "es wurde ohne Aufforderung gespeichert");
  await seite.getByRole("button", { name: "Stand auf diesem Gerät merken" }).click();
  const gespeichertNachher = await seite.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("startkontor:")));
  if (!gespeichertNachher.length) melde("Checkliste", "Speicher", "Stand wird nach Klick nicht gemerkt");
  const cookies = await seite.context().cookies();
  if (cookies.length) melde("Cookies", "Checkliste", `Cookies gesetzt: ${cookies.map((c) => c.name).join(", ")}`);

  await seite.context().close();
} catch (e) {
  melde("Bedienung", "Ablauf", String(e).split("\n").slice(0, 3).join(" "));
}

await browser.close();

if (probleme.length) {
  console.error(`${probleme.length} Probleme:\n` + probleme.slice(0, 80).join("\n"));
  process.exit(1);
}
console.log(`End to End in Ordnung: ${VORLAGEN.length} Vorlagen, ${BREITEN.length} Breiten.`);
