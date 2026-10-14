// Fristen: Zukunftsfilter für die Startseite und Gruppierung für das Register.

import type { Frist, FristStatus } from "./typen.ts";

/**
 * Datierte Fristen nur, wenn sie heute oder später liegen. Wiederkehrende (ohne Datum) bleiben immer.
 * Reihenfolge: datierte aufsteigend, danach die wiederkehrenden in Datenreihenfolge.
 */
export function zukuenftigeFristen(fristen: Frist[], heute: string): Frist[] {
  const datiert = fristen
    .filter((f) => f.datum !== null && f.datum >= heute)
    .sort((a, b) => (a.datum as string).localeCompare(b.datum as string));
  const wiederkehrend = fristen.filter((f) => f.datum === null);
  return [...datiert, ...wiederkehrend];
}

export type FristFilter = { station: string; baustein: string; status: FristStatus | "" };

export const LEERER_FRIST_FILTER: FristFilter = { station: "", baustein: "", status: "" };

type Filterbar = { stationen: string[]; baustein: string; status: FristStatus };

export function filtereFristen<T extends Filterbar>(fristen: T[], f: FristFilter): T[] {
  return fristen.filter(
    (x) =>
      (f.station === "" || x.stationen.includes(f.station)) &&
      (f.baustein === "" || x.baustein === f.baustein) &&
      (f.status === "" || x.status === f.status),
  );
}

export function nachJahrGruppiert<T extends { datum: string | null }>(fristen: T[]): { jahr: string; fristen: T[] }[] {
  const gruppen = new Map<string, T[]>();
  for (const f of fristen) {
    if (!f.datum) continue;
    const jahr = f.datum.slice(0, 4);
    gruppen.set(jahr, [...(gruppen.get(jahr) ?? []), f]);
  }
  return [...gruppen.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([jahr, liste]) => ({
      jahr,
      fristen: liste.sort((a, b) => (a.datum as string).localeCompare(b.datum as string)),
    }));
}

const GUELTIGE_STATUS: FristStatus[] = ["gilt", "kommt", "entwurf", "wiederkehrend"];

export function leseFristFilter(p: Record<string, string | undefined>): FristFilter {
  const status = p.status as FristStatus | undefined;
  return {
    station: p.station ?? "",
    baustein: p.baustein ?? "",
    status: status && GUELTIGE_STATUS.includes(status) ? status : "",
  };
}
