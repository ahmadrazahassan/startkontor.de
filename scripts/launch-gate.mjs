// Launch Gate: Vor dem Produktionsbuild muss alles gefüllt sein, was nicht erfunden werden darf.
//
//   node scripts/launch-gate.mjs            Entwicklung: nur Hinweise, Ausgang immer 0
//   node scripts/launch-gate.mjs --strict   Produktion, vor dem Build: Konfiguration, Umgebung, Daten
//   node scripts/launch-gate.mjs --html     Produktion, nach dem Build: gebaute Seiten auf Platzhalter und Builder Felder prüfen
//
// npm run build:prod ruft alles in der richtigen Reihenfolge auf.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import nextEnv from "@next/env";
import { parseDeutschesDatum } from "../lib/datum.ts";
import { OPTIONALE_SCHLUESSEL, fehlendePflichtangaben, hatPlatzhalter, platzhalterIn } from "../lib/platzhalter.ts";

const strikt = process.argv.includes("--strict");
const nurHtml = process.argv.includes("--html");

// Dieselben .env Dateien wie Next.js laden, bevor Betreiber und Daten ausgewertet werden.
nextEnv.loadEnvConfig(process.cwd(), false);
const { daten, betreiber } = await import("../lib/daten.ts");

const fehler = [];
const warnungen = [];

const roh = JSON.parse(readFileSync("data/startkontor-daten.json", "utf8"));
const konfigSchluessel = Object.keys(JSON.parse(readFileSync("config/betreiber.json", "utf8")));

// Schlüssel, die erst mit einem freigegebenen Partnerprogramm gefüllt werden
const partnerSchluessel = konfigSchluessel.filter((k) => /PARTNERLINK|NETZWERKLINK/.test(k));
const benoetigt = konfigSchluessel.filter((k) => !partnerSchluessel.includes(k));

// Texte, die nie sichtbar sein dürfen (Builder Felder)
function builderTexte() {
  const liste = [
    roh.marke.stand.hinweis,
    roh.marke.logo.hinweis,
    roh.betreiber.hinweis,
    roh.navigation.mobil.hinweis,
    roh.seiten.start.fristen.regel,
    roh.seiten.werbung.partnerstatus.regel,
    roh.seiten.redaktion.wer.hinweis,
    roh.seiten.brief.hinweisPlanung,
    roh.seiten.impressum.entwurfHinweis,
    roh.seiten.datenschutz.entwurfHinweis,
    roh.planer.beschreibung,
    ...roh.planer.algorithmus,
    ...roh.seiten.datenschutz.abschnitte.map((a) => a.hinweis).filter(Boolean),
    ...roh.seo.strukturierteDaten,
    ...roh.seo.verbote,
  ];
  return liste.filter((t) => typeof t === "string" && t.length > 30);
}

if (!nurHtml) {
  // 1. Pflichtangaben
  const leer = fehlendePflichtangaben(betreiber, benoetigt);
  if (leer.length) fehler.push(`config/betreiber.json: leere Pflichtangaben (${leer.length}): ${leer.join(", ")}`);
  const optionalLeer = OPTIONALE_SCHLUESSEL.filter((k) => !(betreiber[k] ?? "").trim());
  if (optionalLeer.length) warnungen.push(`optionale Angaben leer, die Absätze entfallen: ${optionalLeer.join(", ")}`);

  // 2. Umgebung
  const umgebung = ["SITE_URL", "RESEND_API_KEY", "MAIL_FROM", "MAIL_TO", "NEWSLETTER_SECRET", "NEWSLETTER_AUDIENCE_ID"];
  const fehlend = umgebung.filter((n) => !(process.env[n] ?? "").trim());
  if (fehlend.length) fehler.push(`Umgebungsvariablen fehlen: ${fehlend.join(", ")}`);
  if ((process.env.NEWSLETTER_SECRET ?? "").length > 0 && (process.env.NEWSLETTER_SECRET ?? "").length < 32) {
    fehler.push("NEWSLETTER_SECRET ist kürzer als 32 Zeichen");
  }
  if (process.env.SITE_URL && !/^https:\/\//.test(process.env.SITE_URL)) {
    warnungen.push("SITE_URL beginnt nicht mit https://");
  }

  // 3. Platzhalter in den sichtbaren Daten (Partner und Konfiguration ausgenommen)
  const sichtbar = { ...daten, partner: undefined, betreiber: undefined, _meta: undefined };
  const offene = new Set();
  (function suche(x) {
    if (typeof x === "string") platzhalterIn(x).forEach((p) => offene.add(p));
    else if (Array.isArray(x)) x.forEach(suche);
    else if (x && typeof x === "object") Object.values(x).forEach(suche);
  })(sichtbar);
  // Builder Felder dürfen Platzhalter enthalten (werden nie gerendert)
  const nurBuilder = new Set();
  for (const t of builderTexte()) platzhalterIn(t).forEach((p) => nurBuilder.add(p));
  const echteOffene = [...offene].filter((p) => !(nurBuilder.has(p) && !benoetigt.includes(p)));
  if (echteOffene.length) fehler.push(`Platzhalter in sichtbaren Texten: ${echteOffene.join(", ")}`);

  // 4. Entwurfshinweise: sie erscheinen nur in der Entwicklung, aber Impressum und Datenschutz brauchen eine juristische Prüfung
  warnungen.push("Impressum und Datenschutzerklärung sind Vorlagen: vor dem Start juristisch prüfen lassen.");

  // 5. Aktualität der Stand Daten
  const recht = parseDeutschesDatum(daten.marke.stand.recht);
  if (recht) {
    const tage = Math.floor((Date.now() - new Date(`${recht}T00:00:00Z`).getTime()) / 86400000);
    if (tage > 30) warnungen.push(`Rechtsstand (${daten.marke.stand.recht}) ist ${tage} Tage alt. Preise und Rechtsangaben vor dem Start erneut prüfen.`);
  }

  // 6. Partner: kein Partner darf ohne ausgefüllten Link aktiv sein
  for (const p of daten.partner.anbieter) {
    if (p.aktiv && hatPlatzhalter(p.zielLink)) fehler.push(`Partner ${p.schluessel} ist aktiv, aber der Netzwerklink fehlt.`);
  }
}

if (nurHtml) {
  const wurzel = ".next/server/app";
  if (!existsSync(wurzel)) {
    fehler.push("Gebaute Seiten fehlen. Erst npm run build ausführen.");
  } else {
    const dateien = [];
    (function lauf(o) {
      for (const n of readdirSync(o)) {
        const v = join(o, n);
        if (statSync(v).isDirectory()) lauf(v);
        else if (n.endsWith(".html")) dateien.push(v);
      }
    })(wurzel);
    const texte = builderTexte();
    let platzhalter = 0;
    const leck = new Set();
    for (const d of dateien) {
      const html = readFileSync(d, "utf8");
      if (/\{\{[A-Z0-9_]+\}\}/.test(html)) platzhalter += 1;
      for (const t of texte) {
        const schnipsel = t.slice(0, 60).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
        if (html.includes(t.slice(0, 60)) || html.includes(schnipsel)) leck.add(t.slice(0, 50));
      }
    }
    if (platzhalter) fehler.push(`${platzhalter} gebaute Seiten enthalten noch {{PLATZHALTER}}.`);
    if (leck.size) fehler.push(`Builder Felder im Ergebnis gefunden: ${[...leck].join(" | ")}`);
    if (!platzhalter && !leck.size) console.log(`Launch Gate (HTML): ${dateien.length} Seiten ohne Platzhalter und ohne Builder Felder.`);
  }
}

for (const w of warnungen) console.warn(`Hinweis: ${w}`);
if (fehler.length) {
  console.error(`Launch Gate: ${fehler.length} Problem${fehler.length === 1 ? "" : "e"}\n- ${fehler.join("\n- ")}`);
  if (strikt || nurHtml) process.exit(1);
  console.warn("(Entwicklungsmodus: kein Abbruch)");
} else if (!nurHtml) {
  console.log("Launch Gate: Konfiguration, Umgebung und Daten in Ordnung.");
}
