// Filter und Sortierung der Anbieterliste. Standard: alphabetisch, ohne Wertung.

import { parseDeutschesDatum } from "./datum.ts";
import type { Anbieter } from "./typen.ts";

export type PreisFilter = "alle" | "veroeffentlicht" | "anfrage";
export type Sortierung = "alphabetisch" | "geprueft";

export type AnbieterFilter = {
  baustein: string; // "" oder Baustein id
  preis: PreisFilter;
  monatlich: boolean;
  sort: Sortierung;
};

export const STANDARD_ANBIETER_FILTER: AnbieterFilter = {
  baustein: "",
  preis: "alle",
  monatlich: false,
  sort: "alphabetisch",
};

export function sortiereAlphabetisch<T extends { name: string }>(liste: T[]): T[] {
  return [...liste].sort((a, b) => a.name.localeCompare(b.name, "de", { sensitivity: "base" }));
}

export function leseAnbieterFilter(
  p: Record<string, string | undefined>,
  gueltigeBausteine: string[],
): AnbieterFilter {
  const baustein = p.baustein && gueltigeBausteine.includes(p.baustein) ? p.baustein : "";
  const preis: PreisFilter = p.preis === "veroeffentlicht" || p.preis === "anfrage" ? p.preis : "alle";
  const sort: Sortierung = p.sort === "geprueft" ? "geprueft" : "alphabetisch";
  return { baustein, preis, monatlich: p.monatlich === "1", sort };
}

export function anbieterFilterZuQuery(f: AnbieterFilter): string {
  const p = new URLSearchParams();
  if (f.baustein) p.set("baustein", f.baustein);
  if (f.preis !== "alle") p.set("preis", f.preis);
  if (f.monatlich) p.set("monatlich", "1");
  if (f.sort !== "alphabetisch") p.set("sort", f.sort);
  const s = p.toString();
  return s ? `?${s}` : "";
}

export function filtereAnbieter(liste: Anbieter[], f: AnbieterFilter): Anbieter[] {
  let ergebnis = liste.filter((a) => {
    if (f.baustein && a.baustein !== f.baustein) return false;
    if (f.preis === "veroeffentlicht" && a.preis.status !== "veroeffentlicht") return false;
    if (f.preis === "anfrage" && a.preis.status === "veroeffentlicht") return false;
    if (f.monatlich && a.monatlichKuendbar !== true) return false;
    return true;
  });
  ergebnis = sortiereAlphabetisch(ergebnis);
  if (f.sort === "geprueft") {
    const iso = (a: Anbieter) => parseDeutschesDatum(a.geprueft) ?? "";
    // Stabil: bei gleichem Datum bleibt die alphabetische Ordnung.
    ergebnis = ergebnis
      .map((a, i) => ({ a, i }))
      .sort((x, y) => iso(y.a).localeCompare(iso(x.a)) || x.i - y.i)
      .map((x) => x.a);
  }
  return ergebnis;
}

/** Anfangsbuchstaben, die in der Liste wirklich vorkommen (für die Buchstabenleiste). */
export function anfangsbuchstaben(namen: string[]): string[] {
  const set = new Set(namen.map((n) => n.charAt(0).toLocaleUpperCase("de")));
  return [...set].sort((a, b) => a.localeCompare(b, "de"));
}
