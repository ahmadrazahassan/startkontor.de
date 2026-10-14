// Deutsche Datumsangaben. Keine Abhängigkeiten.

export const MONATSNAMEN = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
] as const;

/** "25. September 2026" wird zu "2026-09-25". Alles andere ergibt null. */
export function parseDeutschesDatum(text: string): string | null {
  const m = /^(\d{1,2})\.\s*([A-Za-zÄÖÜäöü]+)\s+(\d{4})$/u.exec(text.replace(/ /g, " ").trim());
  if (!m) return null;
  const monat = MONATSNAMEN.indexOf(m[2] as (typeof MONATSNAMEN)[number]);
  if (monat === -1) return null;
  const tag = Number(m[1]);
  if (tag < 1 || tag > 31) return null;
  return `${m[3]}-${String(monat + 1).padStart(2, "0")}-${String(tag).padStart(2, "0")}`;
}

/** "2026-09-25" wird zu "25. September 2026". */
export function formatiereIso(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) throw new Error(`Kein ISO Datum: ${iso}`);
  const monat = Number(m[2]);
  if (monat < 1 || monat > 12) throw new Error(`Ungültiger Monat: ${iso}`);
  return `${Number(m[3])}. ${MONATSNAMEN[monat - 1]} ${m[1]}`;
}

/** Heutiges Datum als ISO String in der Zeitzone Berlin. */
export function heuteIso(jetzt: Date = new Date(), zeitzone = "Europe/Berlin"): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: zeitzone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(jetzt);
}

export function vergleicheIso(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
