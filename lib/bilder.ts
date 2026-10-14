// Serverseitige Hilfen für Bilder und Logos. Prüft zum Build, ob Dateien vorhanden sind.
// Es werden nie Bilder erzeugt oder aus dem Netz geladen.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { anbieterNachSlug, bilderPlaetze } from "./daten.ts";
import motive from "../data/bildmotive.json" with { type: "json" };

const PUBLIC = join(process.cwd(), "public");

export function dateiVorhanden(webPfad: string): boolean {
  return existsSync(join(PUBLIC, webPfad.replace(/^\//, "")));
}

export type Bildplatz = {
  id: string;
  datei: string;
  alt: string;
  verhaeltnis: [number, number];
  breite: number;
  hoehe: number;
  vorhanden: boolean;
  transparent?: boolean;
};

const ERSATZMOTIVE: Record<string, keyof typeof motive> = {
  "station-1": "gruendung",
  "station-2": "erste-umsaetze",
  "station-3": "erstes-team",
  "station-4": "wachstum",
  "station-5": "ausbau",
  "baustein-finanzen": "finanzen",
  "baustein-lohn": "lohn",
  "baustein-personal": "personal",
  "baustein-vertrieb": "vertrieb",
  "baustein-betrieb": "betrieb",
};

/** "3 zu 2, mindestens 1800 Pixel breit" wird zu [3, 2] */
export function verhaeltnisAus(format: string): [number, number] {
  const m = /(\d+)\s+zu\s+(\d+)/.exec(format);
  if (!m) return [3, 2];
  return [Number(m[1]), Number(m[2])];
}

export function holeBildplatz(id: string): Bildplatz {
  const platz = bilderPlaetze.find((b) => b.id === id);
  if (!platz) throw new Error(`Unbekannter Bildplatz: ${id}`);
  const ersatzId = ERSATZMOTIVE[id];
  const ersatz = ersatzId ? motive[ersatzId] : null;
  if (!dateiVorhanden(platz.datei) && ersatz && dateiVorhanden(ersatz.datei)) {
    return {
      id,
      datei: ersatz.datei,
      alt: ersatz.alt,
      verhaeltnis: [ersatz.breite, ersatz.hoehe],
      breite: ersatz.breite,
      hoehe: ersatz.hoehe,
      vorhanden: true,
      transparent: ersatz.transparent,
    };
  }
  const verhaeltnis = verhaeltnisAus(platz.format);
  const breite = verhaeltnis[0] === 4 ? 1200 : 1800;
  return {
    id,
    datei: platz.datei,
    alt: platz.alt,
    verhaeltnis,
    breite,
    hoehe: Math.round((breite * verhaeltnis[1]) / verhaeltnis[0]),
    vorhanden: dateiVorhanden(platz.datei),
  };
}

export type LogoDatei = { src: string; breite: number; hoehe: number };

function pngMasse(pfad: string): { breite: number; hoehe: number } | null {
  const puffer = readFileSync(pfad);
  if (puffer.length < 24 || puffer.readUInt32BE(0) !== 0x89504e47) return null;
  return { breite: puffer.readUInt32BE(16), hoehe: puffer.readUInt32BE(20) };
}

function webpMasse(pfad: string): { breite: number; hoehe: number } | null {
  const p = readFileSync(pfad);
  if (p.length < 30 || p.toString("ascii", 0, 4) !== "RIFF" || p.toString("ascii", 8, 12) !== "WEBP") return null;
  const format = p.toString("ascii", 12, 16);
  if (format === "VP8X") return { breite: 1 + p.readUIntLE(24, 3), hoehe: 1 + p.readUIntLE(27, 3) };
  if (format === "VP8 ") return { breite: p.readUInt16LE(26) & 0x3fff, hoehe: p.readUInt16LE(28) & 0x3fff };
  if (format === "VP8L" && p[20] === 0x2f) {
    const bits = p.readUInt32LE(21);
    return { breite: (bits & 0x3fff) + 1, hoehe: ((bits >>> 14) & 0x3fff) + 1 };
  }
  return null;
}

function icoMasse(pfad: string): { breite: number; hoehe: number } | null {
  const p = readFileSync(pfad);
  if (p.length < 22 || p.readUInt16LE(0) !== 0 || p.readUInt16LE(2) !== 1 || p.readUInt16LE(4) < 1) return null;
  return { breite: p[6] || 256, hoehe: p[7] || 256 };
}

function svgMasse(pfad: string): { breite: number; hoehe: number } | null {
  const text = readFileSync(pfad, "utf8").slice(0, 2000);
  const vb = /viewBox\s*=\s*"([\d.\s-]+)"/.exec(text);
  if (vb) {
    const [, , b, h] = vb[1].trim().split(/\s+/).map(Number);
    if (b > 0 && h > 0) return { breite: b, hoehe: h };
  }
  const b = /\swidth\s*=\s*"([\d.]+)/.exec(text);
  const h = /\sheight\s*=\s*"([\d.]+)/.exec(text);
  if (b && h) return { breite: Number(b[1]), hoehe: Number(h[1]) };
  return null;
}

/**
 * Logo eines Anbieters: nur anzeigen, wenn die unveränderte Originaldatei da ist.
 * Fehlt sie, zeigt die Seite nur den Namen als Text.
 */
export function holeLogo(slug: string): LogoDatei | null {
  if (!anbieterNachSlug.has(slug)) return null;
  for (const endung of ["svg", "png", "webp", "ico"]) {
    const web = `/logos/${slug}.${endung}`;
    const voll = join(PUBLIC, "logos", `${slug}.${endung}`);
    if (!existsSync(voll)) continue;
    const masse = endung === "png" ? pngMasse(voll) : endung === "webp" ? webpMasse(voll) : endung === "ico" ? icoMasse(voll) : svgMasse(voll);
    if (masse) return { src: web, breite: masse.breite, hoehe: masse.hoehe };
    return { src: web, breite: 160, hoehe: 48 };
  }
  return null;
}
