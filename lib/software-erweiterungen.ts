import type { Anbieter, Daten, SoftwareReview } from "./typen.ts";

export type SoftwareErgaenzungen = {
  stand: string;
  anbieter: Anbieter[];
  reviews: Record<string, SoftwareReview>;
  verknuepfungen: Record<string, string[]>;
};

/** Ergänzt die redaktionellen Daten, ohne den ursprünglichen Datenbestand zu überschreiben. */
export function ergaenzeSoftware(roh: Daten, neu: SoftwareErgaenzungen): Daten {
  const d = structuredClone(roh);
  const vorhanden = new Set(d.anbieter.map((a) => a.slug));
  for (const a of neu.anbieter) {
    if (vorhanden.has(a.slug)) throw new Error(`Doppeltes Softwareprofil: ${a.slug}`);
    const b = d.bausteine.find((x) => x.slug === a.baustein);
    if (!b) throw new Error(`Software ${a.slug}: unbekannte Kategorie ${a.baustein}`);
    if (!neu.reviews[a.slug]) throw new Error(`Software ${a.slug}: ausführliche Analyse fehlt`);
    vorhanden.add(a.slug);
    d.anbieter.push(a);
    b.anbieter.push(a.slug);
    d.routen.push(a.url);
  }
  d.kennzahlen.anbieter = d.anbieter.length;
  d.navigation.kopfzeile[2].beschreibung = `${d.anbieter.length} Softwareprofile mit Fakten, Quellen und redaktioneller Einschätzung`;
  for (const [slug, software] of Object.entries(neu.verknuepfungen)) {
    const l = d.leitfaeden.find((x) => x.slug === slug);
    if (!l) throw new Error(`Unbekannter Ratgeber für Softwareverknüpfung: ${slug}`);
    l.verwandt.anbieter = [...new Set([...l.verwandt.anbieter, ...software])];
  }
  return d;
}
