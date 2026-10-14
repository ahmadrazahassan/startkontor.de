// Überschreibt einzelne Begriffe der Datendatei, ohne die Originaldatei zu ändern (data/begriffe.json).
// Jeder Eintrag nennt den Pfad, den alten Text und den neuen Text. Fehlt der alte Text, bricht der Build ab:
// So fällt auf, wenn die Datendatei ersetzt wurde und die Liste angepasst werden muss.

export type Aenderung = { pfad: string; alt: string; neu: string };

/** "navigation.kopfzeile[2].label" wird zu ["navigation", "kopfzeile", 2, "label"] */
export function pfadSchritte(pfad: string): (string | number)[] {
  const schritte: (string | number)[] = [];
  for (const teil of pfad.split(".")) {
    const m = /^([^[\]]*)((?:\[\d+\])*)$/.exec(teil);
    if (!m) throw new Error(`begriffe.json: ungültiger Pfad ${pfad}`);
    if (m[1]) schritte.push(m[1]);
    for (const idx of m[2].matchAll(/\[(\d+)\]/g)) schritte.push(Number(idx[1]));
  }
  return schritte;
}

export function wendeBegriffeAn<T>(daten: T, aenderungen: Aenderung[]): T {
  const kopie = structuredClone(daten);
  for (const a of aenderungen) {
    const schritte = pfadSchritte(a.pfad);
    let eltern = kopie as Record<string | number, unknown>;
    for (const s of schritte.slice(0, -1)) {
      const naechster = eltern?.[s];
      if (naechster === null || typeof naechster !== "object") throw new Error(`begriffe.json: Pfad ${a.pfad} existiert nicht`);
      eltern = naechster as Record<string | number, unknown>;
    }
    const letzter = schritte[schritte.length - 1];
    const wert = eltern[letzter];
    if (typeof wert !== "string") throw new Error(`begriffe.json: ${a.pfad} ist kein Text`);
    if (!wert.includes(a.alt)) throw new Error(`begriffe.json: ${a.pfad} enthält "${a.alt}" nicht mehr. Liste anpassen.`);
    eltern[letzter] = wert.split(a.alt).join(a.neu);
  }
  return kopie;
}
