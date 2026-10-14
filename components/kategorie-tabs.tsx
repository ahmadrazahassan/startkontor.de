"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { Icon } from "@/components/icons";
import type { IconName } from "@/components/icons";

export type KategorieEintrag = {
  schluessel: string;
  label: string;
  beschreibung: string;
  icon: IconName;
  /** z. B. "6 Programme" */
  anzahl: string;
  inhalt: ReactNode;
};

/**
 * Kategorien mit transparenten Linienicons und einem Panel für die jeweiligen Programme.
 * WAI ARIA Tabs mit Pfeiltasten. Der Server rendert alle Panels. Ohne JavaScript stehen sie untereinander
 * und die Listeneinträge sind Anker.
 */
export function KategorieTabs({ eintraege, beschriftung }: { eintraege: KategorieEintrag[]; beschriftung: string }) {
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

  const inhaltKachel = (e: KategorieEintrag) => (
    <>
      <span className="kategoriekachel__icon" aria-hidden="true">
        <Icon name={e.icon} groesse={32} />
      </span>
      <span className="kategoriekachel__text">
        <span className="kategoriekachel__name">{e.label}</span>
        <span className="kategoriekachel__anzahl">
          <span className="kategoriekachel__wert">{e.anzahl.split(" ")[0]}</span>{" "}
          <span className="kategoriekachel__einheit">{e.anzahl.split(" ").slice(1).join(" ")}</span>
        </span>
      </span>
    </>
  );

  return (
    <div className="kategorietabs" data-erweitert={erweitert ? "ja" : "nein"}>
      <div className="kategorietabs__liste" role={erweitert ? "tablist" : undefined} aria-label={beschriftung}>
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
              className="kategoriekachel"
              aria-selected={aktiv === i}
              aria-controls={`${basis}-panel-${i}`}
              aria-label={`${e.beschreibung}: ${e.anzahl}`}
              tabIndex={aktiv === i ? 0 : -1}
              onClick={() => waehle(i)}
              onKeyDown={(ev) => beiTaste(ev, i)}
            >
              {inhaltKachel(e)}
            </button>
          ) : (
            <a key={e.schluessel} href={`#${basis}-panel-${i}`} className="kategoriekachel" aria-label={`${e.beschreibung}: ${e.anzahl}`}>
              {inhaltKachel(e)}
            </a>
          ),
        )}
      </div>

      <div className="kategorietabs__panels">
        {eintraege.map((e, i) => (
          <div
            key={e.schluessel}
            id={`${basis}-panel-${i}`}
            className="kategorietabs__panel"
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
