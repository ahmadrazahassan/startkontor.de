// Eigene Volltextsuche ohne Bibliothek. Deutsche Faltung, Präfix Treffer pro Wort.

export type SuchEintrag = {
  typ: string;
  titel: string;
  /** gewichtet (3), wird auch als Textauszug gezeigt */
  kurz?: string;
  /** nur Anzeige, nicht gewichtet */
  snippet?: string;
  text: string;
  url: string;
  gruppe: string;
};

export type Treffer = SuchEintrag & { score: number };

/** Kleinschreibung, ä ö ü werden zu a o u, ß zu ss, Satzzeichen zu Leerzeichen. */
export function falte(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function tokenisiere(text: string): string[] {
  const gefaltet = falte(text);
  return gefaltet === "" ? [] : gefaltet.split(" ");
}

type Vorbereitet = { titel: string[]; kurz: string[]; text: string[]; titelGanz: string };
const cache = new WeakMap<SuchEintrag, Vorbereitet>();

function vorbereite(e: SuchEintrag): Vorbereitet {
  let v = cache.get(e);
  if (!v) {
    v = {
      titel: tokenisiere(e.titel),
      kurz: tokenisiere(e.kurz ?? ""),
      text: tokenisiere(e.text),
      titelGanz: falte(e.titel),
    };
    cache.set(e, v);
  }
  return v;
}

const GEWICHT = { titel: 5, kurz: 3, text: 1 } as const;

function feldScore(woerter: string[], token: string, gewicht: number): number {
  let beste = 0;
  for (const w of woerter) {
    if (w === token) return gewicht * 1.5;
    if (w.startsWith(token)) beste = gewicht;
  }
  return beste;
}

export function bewerte(e: SuchEintrag, anfrageTokens: string[], anfrageGanz: string): number {
  if (anfrageTokens.length === 0) return 0;
  const v = vorbereite(e);
  let summe = 0;
  for (const token of anfrageTokens) {
    const s =
      feldScore(v.titel, token, GEWICHT.titel) +
      feldScore(v.kurz, token, GEWICHT.kurz) +
      feldScore(v.text, token, GEWICHT.text);
    if (s === 0) return 0; // jedes Token muss irgendwo als Wortanfang vorkommen
    summe += s;
  }
  if (v.titelGanz === anfrageGanz) summe += 20;
  else if (v.titelGanz.startsWith(anfrageGanz)) summe += 8;
  else if (v.titel[0]?.startsWith(anfrageTokens[0])) summe += 2;
  return summe;
}

export function sucheEintraege(index: SuchEintrag[], anfrage: string): Treffer[] {
  const tokens = tokenisiere(anfrage);
  if (tokens.length === 0) return [];
  const ganz = tokens.join(" ");
  const treffer: Treffer[] = [];
  for (const e of index) {
    const score = bewerte(e, tokens, ganz);
    if (score > 0) treffer.push({ ...e, score });
  }
  treffer.sort((a, b) => b.score - a.score || a.titel.localeCompare(b.titel, "de"));
  return treffer;
}

export type TrefferGruppe = { gruppe: string; treffer: Treffer[] };

export function gruppiere(
  treffer: Treffer[],
  gruppenReihenfolge: string[],
  maxProGruppe = 8,
): TrefferGruppe[] {
  return gruppenReihenfolge
    .map((gruppe) => ({
      gruppe,
      treffer: treffer.filter((t) => t.gruppe === gruppe).slice(0, maxProGruppe),
    }))
    .filter((g) => g.treffer.length > 0);
}
