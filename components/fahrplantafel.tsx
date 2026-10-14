"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { StatusChipRein } from "@/components/chips-rein";
import { Icon } from "@/components/icons";
import { nbsp } from "@/lib/nbsp";
import type { StatusKey } from "@/lib/typen";

export type TafelStation = { slug: string; nummer: number; name: string };
export type TafelBaustein = { slug: string; nummer: number; name: string; kurzname: string };
export type TafelZelle = { status: StatusKey; grund: string };

type Props = {
  titel: string;
  stationen: TafelStation[];
  bausteine: TafelBaustein[];
  /** zellen[stationSlug][bausteinSlug] */
  zellen: Record<string, Record<string, TafelZelle>>;
  statusLabels: Record<StatusKey, string>;
  statusKurz: Record<StatusKey, string>;
  texte: { station: string; baustein: string; zurStation: string; zumBaustein: string; legende: string };
};

/**
 * Fahrplantafel: Matrix aus Bausteinen (Zeilen) und Stationen (Spalten).
 * Ohne JavaScript ist jede Zelle ein Link auf die Station. Mit JavaScript öffnet eine Zelle einen Detailstreifen.
 */
export function Fahrplantafel({ titel, stationen, bausteine, zellen, statusLabels, statusKurz, texte }: Props) {
  const id = useId();
  const [erweitert, setErweitert] = useState(false);
  const [auswahl, setAuswahl] = useState<{ station: string; baustein: string } | null>(null);

  useEffect(() => setErweitert(true), []);

  const gewaehlt = auswahl
    ? {
        station: stationen.find((s) => s.slug === auswahl.station)!,
        baustein: bausteine.find((b) => b.slug === auswahl.baustein)!,
        zelle: zellen[auswahl.station][auswahl.baustein],
      }
    : null;

  return (
    <div className="tafel">
      <div className="tabelle tafel__huelle_aussen">
        <div className="tabelle__huelle" tabIndex={0} role="region" aria-label={titel}>
          <table className="tafel__tabelle">
            <caption className="visuell_versteckt">{titel}</caption>
            <thead>
              <tr>
                <th scope="col">
                  <span className="visuell_versteckt">{texte.baustein}</span>
                </th>
                {stationen.map((s) => (
                  <th key={s.slug} scope="col" className="tafel__station">
                    <Link href={`/fahrplan/${s.slug}`} className="tafel__stationlink">
                      <span className="tafel__stationsnummer" aria-hidden="true">
                        {s.nummer}
                      </span>
                      <span className="visuell_versteckt">{texte.station} </span>
                      {s.name}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bausteine.map((b) => (
                <tr key={b.slug}>
                  <th scope="row" className="tafel__baustein">
                    <Link href={`/bausteine/${b.slug}`}>{b.name}</Link>
                  </th>
                  {stationen.map((s) => {
                    const z = zellen[s.slug][b.slug];
                    const label = statusLabels[z.status];
                    const aktiv = auswahl?.station === s.slug && auswahl?.baustein === b.slug;
                    const beschriftung = `${s.name}, ${b.kurzname}: ${label}`;
                    return (
                      <td key={s.slug} className="tafel__zelle" data-status={z.status} data-aktiv={aktiv ? "ja" : undefined}>
                        {erweitert ? (
                          <button
                            type="button"
                            className="tafel__knopf"
                            aria-pressed={aktiv}
                            aria-controls={`${id}-detail`}
                            aria-label={beschriftung}
                            onClick={() => setAuswahl(aktiv ? null : { station: s.slug, baustein: b.slug })}
                          >
                            <StatusMarke status={z.status} />
                            <span className="tafel__label" aria-hidden="true">
                              {label}
                            </span>
                          </button>
                        ) : (
                          <Link href={`/fahrplan/${s.slug}#${b.slug}`} className="tafel__knopf" aria-label={beschriftung}>
                            <StatusMarke status={z.status} />
                            <span className="tafel__label" aria-hidden="true">
                              {label}
                            </span>
                          </Link>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ul className="tafel__legende" aria-label={texte.legende}>
        {(Object.keys(statusLabels) as StatusKey[]).map((k) => (
          <li key={k}>
            <StatusChipRein status={k} label={statusLabels[k]} kurz={statusKurz[k]} />
          </li>
        ))}
      </ul>

      <div id={`${id}-detail`} className="tafel__detail" role="region" aria-live="polite" aria-label={titel} data-leer={gewaehlt ? undefined : "ja"} hidden={!erweitert || !gewaehlt}>
        {gewaehlt ? (
          <>
            <div className="tafel__detailkopf">
              <p className="tafel__detailtitel">
                {gewaehlt.station.name}
                <span aria-hidden="true" className="tafel__trenner" />
                {gewaehlt.baustein.name}
              </p>
              <StatusChipRein status={gewaehlt.zelle.status} label={statusLabels[gewaehlt.zelle.status]} kurz={statusKurz[gewaehlt.zelle.status]} />
            </div>
            <p className="tafel__grund">{nbsp(gewaehlt.zelle.grund)}</p>
            <p className="tafel__links">
              <Link href={`/fahrplan/${gewaehlt.station.slug}#${gewaehlt.baustein.slug}`} className="knopf knopf_sekundaer knopf_klein">
                <span className="knopf__text">{texte.zurStation}</span>
                <Icon name="arrowRight" groesse={16} />
              </Link>
              <Link href={`/bausteine/${gewaehlt.baustein.slug}`} className="knopf knopf_tertiaer">
                <span className="knopf__text">{texte.zumBaustein}</span>
              </Link>
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}

function StatusMarke({ status }: { status: StatusKey }) {
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false" className="tafel__glyph" data-status={status}>
      {status === "jetzt" && <rect x="1.5" y="1.5" width="17" height="17" fill="currentColor" />}
      {status === "alsNaechstes" && (
        <>
          <rect x="2.5" y="2.5" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" />
          <rect x="1.5" y="1.5" width="8.5" height="17" fill="currentColor" />
        </>
      )}
      {status === "spaeter" && <rect x="2.5" y="2.5" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" />}
      {status === "nichtNoetig" && (
        <rect x="2.5" y="2.5" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3.5 2.5" />
      )}
    </svg>
  );
}
