"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { PreisTarife, type TarifCta } from "@/components/preis-tarife";
import type { Tarifstufe } from "@/lib/analyse";

export type TarifEintrag = {
  slug: string;
  name: string;
  kategorie: string;
  logo: { src: string; breite: number; hoehe: number } | null;
  einheit: string;
  stufen: Tarifstufe[];
  hervorgehoben: string;
  cta: TarifCta;
  profil: string;
  geprueft: string;
};

type Props = { eintraege: TarifEintrag[]; kategorien: { slug: string; label: string }[] };

/** Tarife im Detail: Kategorie und Programm wählen, die Tarifkarten erscheinen darunter. */
export function TarifExplorer({ eintraege, kategorien }: Props) {
  const erste = kategorien.find((k) => eintraege.some((e) => e.kategorie === k.slug))?.slug ?? "alle";
  const [kategorie, setKategorie] = useState(erste);
  const [aktiv, setAktiv] = useState(eintraege.find((e) => e.kategorie === erste)?.slug ?? eintraege[0]?.slug ?? "");
  const sichtbar = useMemo(() => (kategorie === "alle" ? eintraege : eintraege.filter((e) => e.kategorie === kategorie)), [eintraege, kategorie]);
  const gewaehlt = sichtbar.find((e) => e.slug === aktiv) ?? sichtbar[0];

  const waehleKategorie = (k: string) => {
    setKategorie(k);
    const liste = k === "alle" ? eintraege : eintraege.filter((e) => e.kategorie === k);
    if (!liste.some((e) => e.slug === aktiv) && liste[0]) setAktiv(liste[0].slug);
  };

  return (
    <div className="te">
      <div className="te-filter" role="group" aria-label="Kategorie">
        {kategorien.map((k) => {
          const n = eintraege.filter((e) => e.kategorie === k.slug).length;
          return n > 0 ? (
            <button key={k.slug} type="button" aria-pressed={kategorie === k.slug} onClick={() => waehleKategorie(k.slug)}>{k.label} ({n})</button>
          ) : null;
        })}
        <button type="button" aria-pressed={kategorie === "alle"} onClick={() => waehleKategorie("alle")}>Alle ({eintraege.length})</button>
      </div>

      <div className="te-programme" role="group" aria-label="Programm">
        {sichtbar.map((e) => (
          <button key={e.slug} type="button" className="te-programm" aria-pressed={gewaehlt?.slug === e.slug} onClick={() => setAktiv(e.slug)}>
            {e.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={e.logo.src} alt="" width={Math.max(1, Math.round((22 * e.logo.breite) / e.logo.hoehe))} height={22} loading="lazy" />
            ) : null}
            <span>{e.name}</span>
          </button>
        ))}
      </div>

      {gewaehlt ? (
        <div className="te-ergebnis" key={gewaehlt.slug}>
          <div className="te-kopf">
            <p className="te-kopf__titel">{gewaehlt.name}</p>
            <Link href={`${gewaehlt.profil}#preise`} className="te-kopf__link">
              Profil mit allen Details
              <Icon name="arrowRight" groesse={16} />
            </Link>
          </div>
          <PreisTarife name={gewaehlt.name} stufen={gewaehlt.stufen} einheit={gewaehlt.einheit} hervorgehoben={gewaehlt.hervorgehoben} cta={gewaehlt.cta} />
          <p className="te-hinweis">Herstellerangaben, zuletzt geprüft am {gewaehlt.geprueft}. Maßgeblich sind die aktuellen Konditionen beim Hersteller.</p>
        </div>
      ) : null}
    </div>
  );
}
