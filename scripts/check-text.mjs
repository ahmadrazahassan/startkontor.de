// Typografieprüfung der gebauten Seiten (.next/server/app/**/*.html).
// Regeln: keine Gedankenstriche, keine Bindestrichketten (außer E-Rechnung und Co), keine weichen Trennzeichen,
// keine doppelten Leerzeichen, keine Ausrufezeichen, keine Emojis, keine Verbotswörter, keine Du Anrede.
// Aufruf: node scripts/check-text.mjs   (nach npm run build)
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const WURZEL = ".next/server/app";

const ERLAUBT = [
  "E-Rechnung",
  "E-Rechnungen",
  "E-Mail",
  "E-Mails",
  "E-Bilanz",
  "HR-Software",
  "ERP-Software",
  "Cloud-ERP-Software",
  "Finanzmanagement-Software",
  // Eigennamen aus den Herstellerangaben (Firmenname, Ortsname)
  "Haufe-Lexware",
  "Grand-Rosière",
  "JTL-Wawi",
  "Gustav-Stresemann-Ring",
];

const VERBOTEN = ["nahtlos", "ganzheitlich", "maßgeschneidert", "revolutionär", "Game Changer", "Synergien", "eintauchen", "entfesseln", "Hier erfahren Sie", "Klicken Sie hier"];

function htmlDateien(ordner) {
  const liste = [];
  for (const name of readdirSync(ordner)) {
    const voll = join(ordner, name);
    if (statSync(voll).isDirectory()) liste.push(...htmlDateien(voll));
    else if (name.endsWith(".html")) liste.push(voll);
  }
  return liste;
}

const ENTITAETEN = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#x27;": "'", "&#39;": "'", "&nbsp;": " ", "&shy;": "­" };
function entschluessele(s) {
  return s
    .replace(/&(amp|lt|gt|quot|nbsp|shy);|&#x27;|&#39;/g, (m) => ENTITAETEN[m] ?? m)
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)));
}

/** Liefert die sichtbaren Textknoten ohne script, style, code, svg und Kommentare. */
function textknoten(html) {
  const ohne = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|code|svg|noscript|template)\b[\s\S]*?<\/\1>/gi, " ");
  const teile = ohne.split(/<[^>]+>/g);
  return teile.map((t) => entschluessele(t)).filter((t) => t.trim() !== "");
}

function bereinige(text) {
  let t = text
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\b[\w.+]+@[\w.]+\.\w+\b/g, " ")
    // Domainnamen als Anzeigetext, z. B. agenda-software.de
    .replace(/\b[\w-]+(?:\.[\w-]+)*\.(?:de|com|io|org|net|eu)\b/g, " ");
  for (const w of ERLAUBT) t = t.split(w).join(" ");
  return t;
}

const funde = [];
function melde(datei, regel, text, treffer) {
  const i = Math.max(0, text.indexOf(treffer));
  funde.push(`${datei}  [${regel}]  …${text.slice(Math.max(0, i - 30), i + treffer.length + 30).replace(/\s+/g, " ")}…`);
}

let seiten = 0;
for (const datei of htmlDateien(WURZEL)) {
  const rel = relative(WURZEL, datei).replace(/\\/g, "/");
  if (rel.startsWith("_not-found") === false && /^(_|api\/)/.test(rel)) continue;
  seiten += 1;
  const html = readFileSync(datei, "utf8");
  for (const roh of textknoten(html)) {
    const t = bereinige(roh);
    let m;
    if ((m = /[–—−‒―]/.exec(t))) melde(rel, "Gedankenstrich", roh, m[0]);
    if ((m = /­/.exec(t))) melde(rel, "weiches Trennzeichen", roh, m[0]);
    if ((m = /\p{L}-\p{L}/u.exec(t))) melde(rel, "Bindestrich im Wort", roh, m[0]);
    if ((m = /\s-\s|^-\s|\s-$/.exec(t))) melde(rel, "Bindestrich mit Leerzeichen", roh, m[0]);
    if ((m = /\s…\s/.exec(t))) melde(rel, "Auslassung als Strich", roh, m[0]);
    if ((m = / {2,}/.exec(roh))) melde(rel, "doppeltes Leerzeichen", roh, m[0]);
    if ((m = /!/.exec(t))) melde(rel, "Ausrufezeichen", roh, m[0]);
    if ((m = /(?![©®™])\p{Extended_Pictographic}/u.exec(t))) melde(rel, "Emoji", roh, m[0]);
    for (const w of VERBOTEN) if (t.includes(w)) melde(rel, "Verbotswort", roh, w);
    if ((m = /\b(Du|Dein|Deine|Deinen|Deinem|Deiner|Dich|Dir)\b/.exec(t))) melde(rel, "Du Anrede", roh, m[0]);
    if ((m = /\{\{[A-Z0-9_]+\}\}/.exec(roh))) melde(rel, "offener Platzhalter", roh, m[0]);
  }
}

if (funde.length > 0) {
  console.error(`Typografie: ${funde.length} Treffer in ${seiten} Seiten\n` + funde.slice(0, 60).join("\n"));
  process.exit(1);
}
console.log(`Typografie in Ordnung: ${seiten} Seiten geprüft.`);
