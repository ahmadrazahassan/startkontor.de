// Platzhalter {{SCHLUESSEL}} aus config/betreiber.json einsetzen.
// Leere optionale Angaben entfernen den ganzen Absatz, in dem sie stehen.
// Leere Pflichtangaben bleiben als {{SCHLUESSEL}} sichtbar (Entwicklung) und lassen das Launch Gate scheitern.

export const OPTIONALE_SCHLUESSEL = [
  "TELEFON",
  "HANDELSREGISTER_UND_NUMMER_FALLS_VORHANDEN",
  "UMSATZSTEUER_ID_FALLS_VORHANDEN",
  "ANGABEN_ZUR_DRITTLANDUEBERMITTLUNG_FALLS_ZUTREFFEND",
] as const;

export type Betreiber = Record<string, string>;

const MUSTER = /\{\{([A-Z0-9_]+)\}\}/g;

export function hatPlatzhalter(text: string): boolean {
  return /\{\{[A-Z0-9_]+\}\}/.test(text);
}

export function platzhalterIn(text: string): string[] {
  return [...text.matchAll(MUSTER)].map((m) => m[1]);
}

export function fuelleString(text: string, betreiber: Betreiber): string {
  return text.replace(MUSTER, (treffer, schluessel: string) => {
    const wert = betreiber[schluessel];
    return typeof wert === "string" && wert.trim() !== "" ? wert.trim() : treffer;
  });
}

function absatzWirdEntfernt(text: string, betreiber: Betreiber): boolean {
  return platzhalterIn(text).some(
    (s) => (OPTIONALE_SCHLUESSEL as readonly string[]).includes(s) && !(betreiber[s] ?? "").trim(),
  );
}

/** Läuft rekursiv durch beliebige JSON Werte und gibt eine gefüllte Kopie zurück. */
export function fuelleRekursiv<T>(wert: T, betreiber: Betreiber): T {
  if (typeof wert === "string") return fuelleString(wert, betreiber) as T;
  if (Array.isArray(wert)) {
    const nurText = wert.length > 0 && wert.every((w) => typeof w === "string");
    const behalten = nurText
      ? (wert as string[]).filter((absatz) => !absatzWirdEntfernt(absatz, betreiber))
      : wert;
    return behalten.map((w) => fuelleRekursiv(w, betreiber)) as T;
  }
  if (wert && typeof wert === "object") {
    return Object.fromEntries(
      Object.entries(wert as Record<string, unknown>).map(([k, v]) => [k, fuelleRekursiv(v, betreiber)]),
    ) as T;
  }
  return wert;
}

/** Fehlende Pflichtangaben (leer und nicht optional), für das Launch Gate. */
export function fehlendePflichtangaben(betreiber: Betreiber, benoetigt: string[]): string[] {
  return benoetigt.filter(
    (s) => !(OPTIONALE_SCHLUESSEL as readonly string[]).includes(s) && !(betreiber[s] ?? "").trim(),
  );
}
