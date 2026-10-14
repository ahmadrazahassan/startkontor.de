// Hilfen für lange deutsche Wörter. Wörter werden nie getrennt. Stattdessen sinkt die Schriftgröße einer Überschrift,
// bis das längste Wort in die Spalte passt (siehe base.css, Eigenschaft --wl).

import { inlineZuText } from "./inline.ts";

/** Anzahl der Zeichen des längsten Wortes in einem Text (Auszeichnung wird ignoriert). */
export function laengstesWort(text: string): number {
  return inlineZuText(text)
    .split(/[\s,.:;?!()„“‚‘/]+/u)
    .reduce((m, w) => Math.max(m, [...w].length), 1);
}

/** Style für eine Überschrift: setzt --wl, die CSS Variable für die Wortlänge. */
export function wortStil(text: string): Record<string, number> {
  return { "--wl": laengstesWort(text) };
}
