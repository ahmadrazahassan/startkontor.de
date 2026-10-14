// Bausteinplaner: regelbasiert, rein clientseitig, ohne Server und ohne KI.
// Die Regeln stehen in data/startkontor-daten.json unter "planer".

import type {
  Planer,
  PlanerEingabe,
  PlanerErgebnisZeile,
  PlanerRegel,
  Station,
  StatusKey,
} from "./typen.ts";

/** Der Teil der Plannerdaten, den die Berechnung braucht. */
export type PlanerKern = Pick<
  Planer,
  "statusReihenfolge" | "bausteinReihenfolge" | "teamRegeln" | "modellRegeln" | "stationErmitteln" | "schritte"
>;
export type StationKern = Pick<Station, "slug" | "bausteine">;

export type PlanErgebnis = {
  station: string;
  ergebnis: PlanerErgebnisZeile[];
  gruende: Record<string, string>;
};

/** Löst "unsicher" mit den Regeln aus stationErmitteln auf. */
export function ermittleStation(
  eingabe: Pick<PlanerEingabe, "station" | "team" | "rechnungen">,
  planer: Pick<Planer, "stationErmitteln">,
): string {
  if (eingabe.station !== "unsicher") return eingabe.station;
  if (!eingabe.rechnungen) {
    throw new Error("Für die Stationsermittlung fehlt die Antwort auf die Frage nach Rechnungen.");
  }
  for (const regel of planer.stationErmitteln.regeln) {
    const passtRechnungen = regel.wenn.rechnungen === eingabe.rechnungen;
    const passtTeam = !regel.wenn.team || regel.wenn.team.includes(eingabe.team);
    if (passtRechnungen && passtTeam) return regel.station;
  }
  throw new Error(
    `Keine Regel für Rechnungen=${eingabe.rechnungen} und Team=${eingabe.team} in stationErmitteln.`,
  );
}

function regelPasst(regel: PlanerRegel, aktuell: { team: string; modell: string; station: string }): boolean {
  const bedingungen = Object.entries(regel.wenn) as [keyof typeof aktuell, string[]][];
  return bedingungen.every(([schluessel, werte]) => werte.includes(aktuell[schluessel]));
}

export function berechnePlan(
  eingabe: PlanerEingabe,
  stationen: StationKern[],
  planer: Omit<PlanerKern, "schritte">,
): PlanErgebnis {
  const stationSlug = ermittleStation(eingabe, planer);
  const station = stationen.find((s) => s.slug === stationSlug);
  if (!station) throw new Error(`Unbekannte Station: ${stationSlug}`);

  const rang = (s: StatusKey) => planer.statusReihenfolge.indexOf(s);
  const anzeigeRang = (s: StatusKey) => planer.statusReihenfolge.length - 1 - rang(s);

  type Zustand = { status: StatusKey; grund: string; regel: string };
  const zustand = new Map<string, Zustand>();
  for (const b of planer.bausteinReihenfolge) {
    const basis = station.bausteine[b];
    if (!basis) throw new Error(`Station ${stationSlug} hat keinen Grundstatus für ${b}`);
    zustand.set(b, { status: basis.status, grund: basis.grund, regel: "station" });
  }

  const aktuell = { team: eingabe.team, modell: eingabe.modell, station: stationSlug };
  for (const regel of [...planer.teamRegeln, ...planer.modellRegeln]) {
    if (!regelPasst(regel, aktuell)) continue;
    const z = zustand.get(regel.baustein);
    if (!z) throw new Error(`Regel ${regel.id} nennt unbekannten Baustein ${regel.baustein}`);
    let neuerStatus: StatusKey = z.status;
    if (regel.setze) neuerStatus = regel.setze;
    else if (regel.mindestens && rang(z.status) < rang(regel.mindestens)) neuerStatus = regel.mindestens;
    if (neuerStatus !== z.status) {
      zustand.set(regel.baustein, { status: neuerStatus, grund: regel.grund, regel: regel.id });
    }
  }

  const vorhanden = new Set(eingabe.vorhanden);
  const zeilen = planer.bausteinReihenfolge.map((baustein, reihenfolge) => {
    const z = zustand.get(baustein)!;
    return {
      reihenfolge,
      zeile: {
        baustein,
        status: z.status,
        regel: z.regel,
        vorhanden: vorhanden.has(baustein),
      } satisfies PlanerErgebnisZeile,
    };
  });
  zeilen.sort(
    (a, b) => anzeigeRang(a.zeile.status) - anzeigeRang(b.zeile.status) || a.reihenfolge - b.reihenfolge,
  );

  const gruende: Record<string, string> = {};
  for (const [baustein, z] of zustand) gruende[baustein] = z.grund;

  return { station: stationSlug, ergebnis: zeilen.map((z) => z.zeile), gruende };
}

/** Zustand in der URL (nach dem #): s=erstes-team&t=1bis5&m=handel&v=finanzen,lohn&r=ja */
export function eingabeZuHash(e: PlanerEingabe): string {
  const teile = [`s=${e.station}`, `t=${e.team}`, `m=${e.modell}`];
  if (e.vorhanden.length > 0) teile.push(`v=${e.vorhanden.join(",")}`);
  if (e.station === "unsicher" && e.rechnungen) teile.push(`r=${e.rechnungen}`);
  return teile.join("&");
}

export function hashZuEingabe(hash: string, planer: Pick<PlanerKern, "schritte" | "stationErmitteln">): PlanerEingabe | null {
  const p = new URLSearchParams(hash.replace(/^#/, ""));
  const station = p.get("s");
  const team = p.get("t");
  const modell = p.get("m");
  if (!station || !team || !modell) return null;
  const optionen = (id: string) => planer.schritte.find((s) => s.id === id)?.optionen.map((o) => o.id) ?? [];
  if (!optionen("station").includes(station)) return null;
  if (!optionen("team").includes(team)) return null;
  if (!optionen("modell").includes(modell)) return null;
  const erlaubteBausteine = optionen("vorhanden");
  const vorhanden = (p.get("v") ?? "")
    .split(",")
    .filter((v) => v !== "")
    .filter((v, i, alle) => erlaubteBausteine.includes(v) && alle.indexOf(v) === i);
  const rechnungen = p.get("r") ?? undefined;
  if (station === "unsicher") {
    const ok = planer.stationErmitteln.zusatzfrage.optionen.some((o) => o.id === rechnungen);
    if (!ok) return null;
  }
  return { station, team, modell, vorhanden, rechnungen: station === "unsicher" ? rechnungen : undefined };
}
