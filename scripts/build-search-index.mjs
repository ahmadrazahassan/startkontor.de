// Läuft vor dem Entwicklungsserver und vor dem Build.
// 1) schreibt public/suche-index.json (eine Zeile je durchsuchbarer Einheit)
// 2) schreibt lib/client-texte.json mit den wenigen Texten, die Client Komponenten ohne Datendatei brauchen
import { mkdirSync, writeFileSync } from "node:fs";
import { daten } from "../lib/daten.ts";
import { inlineZuText } from "../lib/inline.ts";

const gruppen = daten.ui.suche.gruppen;
const [G_ANBIETER, G_LEITFAEDEN, G_CHECKLISTEN, G_FRISTEN, G_GLOSSAR, G_STATBAU] = gruppen;
const t = (s) => inlineZuText(s);
const bausteinName = new Map(daten.bausteine.map((b) => [b.slug, b.name]));

const index = [];

for (const a of daten.anbieter) {
  index.push({
    typ: "anbieter",
    titel: a.name,
    kurz: t(a.kurz),
    text: [...a.funktionen.map(t), bausteinName.get(a.baustein) ?? ""].join(" "),
    url: a.url,
    gruppe: G_ANBIETER,
  });
}

for (const l of daten.leitfaeden) {
  index.push({
    typ: "leitfaden",
    titel: t(l.titel),
    snippet: t(l.untertitel),
    text: [t(l.untertitel), ...l.kernaussagen.map(t), ...l.bloecke.filter((b) => b.typ === "zwischentitel").map((b) => t(b.text))].join(" "),
    url: `/wissen/leitfaeden/${l.slug}`,
    gruppe: G_LEITFAEDEN,
  });
}

for (const c of daten.checklisten) {
  index.push({
    typ: "checkliste",
    titel: t(c.titel),
    snippet: t(c.einleitung),
    text: [t(c.einleitung), ...c.gruppen.flatMap((g) => g.punkte.map((p) => t(p.text)))].join(" "),
    url: `/wissen/checklisten/${c.slug}`,
    gruppe: G_CHECKLISTEN,
  });
}

for (const f of daten.fristen) {
  index.push({
    typ: "frist",
    titel: t(f.titel),
    snippet: f.anzeige,
    text: t(f.text),
    url: `/wissen/fristen#${f.id}`,
    gruppe: G_FRISTEN,
  });
}

for (const g of daten.glossar) {
  index.push({
    typ: "glossar",
    titel: g.begriff,
    kurz: t(g.kurz),
    text: t(g.erklaerung),
    url: `/wissen/glossar/${g.slug}`,
    gruppe: G_GLOSSAR,
  });
}

for (const s of daten.stationen) {
  index.push({
    typ: "station",
    titel: `${daten.ui.labels.station} ${s.nummer}: ${s.name}`,
    snippet: s.untertitel,
    text: t(s.teaser),
    url: `/fahrplan/${s.slug}`,
    gruppe: G_STATBAU,
  });
}
for (const b of daten.bausteine) {
  index.push({
    typ: "baustein",
    titel: b.name,
    snippet: t(b.teaser),
    text: t(b.teaser),
    url: `/bausteine/${b.slug}`,
    gruppe: G_STATBAU,
  });
}

mkdirSync("public", { recursive: true });
writeFileSync("public/suche-index.json", JSON.stringify(index));

writeFileSync(
  "lib/client-texte.json",
  JSON.stringify(
    {
      fehlerAllgemein: daten.ui.fehler.allgemein,
      neuLaden: daten.ui.knoepfe.neuLaden,
    },
    null,
    2,
  ) + "\n",
);

console.log(`Suchindex: ${index.length} Einträge`);
