// Vergleicht die gebauten Routen exakt mit dem zusammengeführten redaktionellen Datenbestand.
// Aufruf: node scripts/check-routen.mjs   (nach npm run build)
import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { daten } from "../lib/daten.ts";

const WURZEL = ".next/server/app";
const soll = new Set(daten.routen);

function html(ordner) {
  const liste = [];
  for (const name of readdirSync(ordner)) {
    const voll = join(ordner, name);
    if (statSync(voll).isDirectory()) liste.push(...html(voll));
    else if (name.endsWith(".html")) liste.push(voll);
  }
  return liste;
}

const ist = new Set();
for (const datei of html(WURZEL)) {
  let rel = "/" + relative(WURZEL, datei).replace(/\\/g, "/").replace(/\.html$/, "");
  if (rel === "/index") rel = "/";
  if (rel.endsWith("/index")) rel = rel.slice(0, -6);
  if (rel.startsWith("/_") || rel === "/404" || rel === "/500") continue;
  ist.add(rel);
}

const fehlen = [...soll].filter((r) => !ist.has(r));
const zuviel = [...ist].filter((r) => !soll.has(r));
if (fehlen.length || zuviel.length) {
  console.error(`Routen weichen ab.\nFehlen (${fehlen.length}): ${fehlen.join(", ")}\nZusätzlich (${zuviel.length}): ${zuviel.join(", ")}`);
  process.exit(1);
}
console.log(`Routen stimmen überein: ${ist.size} gebaut, ${soll.size} laut Daten.`);
