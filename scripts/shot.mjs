// Entwicklungswerkzeug: Screenshot einer Seite bei exakter Breite.
// Aufruf: node scripts/shot.mjs /pfad 1440 [ausgabeordner] [hoehe] [voll=1] [yStart] [yHoehe]
// Mit yStart und yHoehe wird nur ein Ausschnitt der Vollseite gespeichert.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const [pfad = "/", breite = "1440", ordner = "test-results", hoehe = "900", voll = "1", yStart, yHoehe] = process.argv.slice(2);
const basis = process.env.SITE_BASIS ?? "http://localhost:3000";
mkdirSync(ordner, { recursive: true });

const browser = await chromium.launch();
const kontext = await browser.newContext({
  viewport: { width: Number(breite), height: Number(hoehe) },
  deviceScaleFactor: 1,
  reducedMotion: "reduce",
});
const seite = await kontext.newPage();
const fehler = [];
seite.on("console", (m) => m.type() === "error" && fehler.push(m.text()));
seite.on("pageerror", (e) => fehler.push(String(e)));
await seite.goto(basis + pfad, { waitUntil: "networkidle" });
await seite.evaluate(() => document.fonts.ready);
const name = `${pfad.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "") || "start"}_${breite}${yStart ? `_y${yStart}` : ""}.png`;
const ziel = join(ordner, name);
await seite.screenshot({
  path: ziel,
  fullPage: voll === "1",
  ...(yStart ? { clip: { x: 0, y: Number(yStart), width: Number(breite), height: Number(yHoehe ?? hoehe) } } : {}),
});
const breiteScroll = await seite.evaluate(() => ({
  scroll: document.documentElement.scrollWidth,
  fenster: window.innerWidth,
  hoehe: document.documentElement.scrollHeight,
}));
console.log(JSON.stringify({ ziel, ...breiteScroll, fehler }));
await browser.close();
