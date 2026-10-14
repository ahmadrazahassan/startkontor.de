"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { Icon } from "@/components/icons";
import type { IconName } from "@/components/icons";

export type KategorienEintrag = {
  schluessel: string;
  label: string;
  beschreibung: string;
  icon: IconName;
  /** Farbe des Icons, z. B. #f2a900 */
  akzent: string;
  /** Anzahl der Programme als Zahl */
  anzahl: number;
  /** Beschriftung der Anzahl, z. B. "Programme" */
  einheit: string;
  inhalt: ReactNode;
};

/**
 * Kategorien: links die Liste mit Kopf und Fuß, rechts die Programme der gewählten Kategorie.
 * WAI ARIA Tabs mit Pfeiltasten. Der Server rendert alle Panels. Ohne JavaScript stehen sie untereinander
 * und die Listeneinträge sind Anker. Am Handy wird die Liste zu einer scrollbaren Reihe.
 */
export function KategorienBereich({ eintraege, beschriftung, kopf, fuss }: { eintraege: KategorienEintrag[]; beschriftung: string; kopf: ReactNode; fuss: ReactNode }) {
  const basis = useId();
  const [aktiv, setAktiv] = useState(0);
  const [erweitert, setErweitert] = useState(false);
  const knoepfe = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => setErweitert(true), []);

  const waehle = (i: number, fokus = false) => {
    setAktiv(i);
    if (fokus) knoepfe.current[i]?.focus();
  };

  const beiTaste = (e: KeyboardEvent, i: number) => {
    const n = eintraege.length;
    let ziel = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") ziel = (i + 1) % n;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") ziel = (i - 1 + n) % n;
    else if (e.key === "Home") ziel = 0;
    else if (e.key === "End") ziel = n - 1;
    if (ziel >= 0) {
      e.preventDefault();
      waehle(ziel, true);
    }
  };

  const inhaltPunkt = (e: KategorienEintrag) => (
    <>
      <span className="kat-punkt__icon" aria-hidden="true" style={{ color: e.akzent }}>
        <Icon name={e.icon} groesse={28} />
      </span>
      <span className="kat-punkt__name">{e.label}</span>
      <span className="kat-punkt__zahl" aria-hidden="true">{e.anzahl}</span>
    </>
  );

  return (
    <div className="kat" data-erweitert={erweitert ? "ja" : "nein"}>
      <div className="kat__seite">
        <div className="kat__kopf">{kopf}</div>
        <div className="kat__liste" role={erweitert ? "tablist" : undefined} aria-label={beschriftung} aria-orientation="vertical">
          {eintraege.map((e, i) =>
            erweitert ? (
              <button
                key={e.schluessel}
                ref={(el) => {
                  knoepfe.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`${basis}-tab-${i}`}
                className="kat-punkt"
                aria-selected={aktiv === i}
                aria-controls={`${basis}-panel-${i}`}
                aria-label={`${e.beschreibung}: ${e.anzahl} ${e.einheit}`}
                tabIndex={aktiv === i ? 0 : -1}
                onClick={() => waehle(i)}
                onKeyDown={(ev) => beiTaste(ev, i)}
              >
                {inhaltPunkt(e)}
              </button>
            ) : (
              <a key={e.schluessel} href={`#${basis}-panel-${i}`} className="kat-punkt" aria-label={`${e.beschreibung}: ${e.anzahl} ${e.einheit}`}>
                {inhaltPunkt(e)}
              </a>
            ),
          )}
        </div>
        <div className="kat__fuss">{fuss}</div>
      </div>

      <div className="kat__panels">
        {eintraege.map((e, i) => (
          <div
            key={e.schluessel}
            id={`${basis}-panel-${i}`}
            className="kat__panel"
            role={erweitert ? "tabpanel" : undefined}
            aria-labelledby={erweitert ? `${basis}-tab-${i}` : undefined}
            hidden={erweitert && aktiv !== i}
          >
            {e.inhalt}
          </div>
        ))}
      </div>
    </div>
  );
}
