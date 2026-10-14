"use client";

import { useMemo, useState } from "react";
import { betragText, logPosition, median, type PreisPunkt } from "@/lib/analyse";

type Props = {
  titel: string;
  einheit: string;
  punkte: PreisPunkt[];
  aktuellSlug: string;
  kategorien: Record<string, string>;
};

const euro = (b: number) => `${betragText(b)} €`;

/** Streudiagramm der Einstiegspreise auf logarithmischer Achse. Jeder Punkt ist ein Link zum Profil. */
export function PreisPosition({ titel, einheit, punkte, aktuellSlug, kategorien }: Props) {
  const aktuell = punkte.find((p) => p.slug === aktuellSlug)!;
  const gleiche = useMemo(() => punkte.filter((p) => p.baustein === aktuell.baustein), [punkte, aktuell.baustein]);
  const [nurKategorie, setNurKategorie] = useState(false);
  const sicht = nurKategorie && gleiche.length >= 2 ? gleiche : punkte;

  const { werte, min, max, med, rang, abweichung } = useMemo(() => {
    const betraege = sicht.map((p) => p.betrag);
    const mn = Math.min(...betraege);
    const mx = Math.max(...betraege);
    const md = median(betraege);
    const sortiert = [...sicht].sort((a, b) => a.betrag - b.betrag || a.name.localeCompare(b.name, "de"));
    // Punkte mit ähnlichem Betrag auf mehrere Zeilen verteilen, damit nichts verdeckt wird
    const bahnenEnde: number[] = [];
    const platziert = sortiert.map((p) => {
      const pos = logPosition(p.betrag, mn, mx);
      let bahn = bahnenEnde.findIndex((ende) => pos - ende >= 0.045);
      if (bahn === -1) bahn = bahnenEnde.length;
      bahnenEnde[bahn] = pos;
      return { ...p, pos, bahn };
    });
    return {
      werte: platziert,
      min: mn,
      max: mx,
      med: md,
      rang: sortiert.findIndex((p) => p.slug === aktuellSlug) + 1,
      abweichung: Math.round(((aktuell.betrag - md) / md) * 100),
    };
  }, [sicht, aktuell.betrag, aktuellSlug]);

  const bahnen = Math.max(...werte.map((w) => w.bahn)) + 1;
  const medPos = logPosition(med, min, max);
  const kategorieName = kategorien[aktuell.baustein] ?? "Kategorie";
  const vergleich = abweichung === 0 ? "genau auf dem Median" : `${Math.abs(abweichung)} Prozent ${abweichung < 0 ? "unter" : "über"} dem Median`;

  return (
    <div className="ag-position">
      <div className="ag-position__kopf">
        <p className="ag-position__titel">{titel}</p>
        {gleiche.length >= 2 ? (
          <div className="ag-umschalter" role="group" aria-label="Vergleichsgruppe">
            <button type="button" aria-pressed={!nurKategorie} onClick={() => setNurKategorie(false)}>Alle ({punkte.length})</button>
            <button type="button" aria-pressed={nurKategorie} onClick={() => setNurKategorie(true)}>{kategorieName} ({gleiche.length})</button>
          </div>
        ) : null}
      </div>

      <div className="ag-strip" style={{ "--bahnen": bahnen } as React.CSSProperties}>
        <div className="ag-strip__spur" aria-hidden="true" />
        <div className="ag-strip__median" style={{ left: `${medPos * 100}%` }} aria-hidden="true">
          <span>Median {euro(med)}</span>
        </div>
        {werte.map((w) => (
          <a
            key={w.slug}
            href={w.href}
            className={w.slug === aktuellSlug ? "ag-punkt ag-punkt_aktuell" : "ag-punkt"}
            style={{ left: `${w.pos * 100}%`, "--bahn": w.bahn } as React.CSSProperties}
            data-tip={`${w.name}: ${euro(w.betrag)}`}
            data-rand={w.pos < 0.2 ? "links" : w.pos > 0.8 ? "rechts" : undefined}
            aria-label={`${w.name}: ${euro(w.betrag)} ${einheit}`}
            aria-current={w.slug === aktuellSlug ? "true" : undefined}
          />
        ))}
        <div className="ag-strip__achse" aria-hidden="true">
          <span>{euro(min)}</span>
          <span>{euro(max)}</span>
        </div>
      </div>

      <p className="ag-position__text">
        <strong>{aktuell.name}</strong> beginnt bei <strong>{euro(aktuell.betrag)}</strong> {einheit} und liegt {vergleich} von {euro(med)}. Rang {rang} von {sicht.length} nach Einstiegspreis, aufsteigend.
      </p>
    </div>
  );
}
