import type { ReactNode } from "react";
import { H1 } from "@/components/h1";
import { Inline } from "@/components/inline";

/** Kopf einer Unterseite: Eyebrow, H1, Einleitung. Einleitungen aus den Daten sind ein String oder eine Liste. */
export function Seitenkopf({
  eyebrow,
  titel,
  einleitung,
  lead = true,
  children,
  rechts,
}: {
  eyebrow?: string;
  titel: string;
  einleitung?: string | string[];
  /** erster Absatz größer setzen */
  lead?: boolean;
  children?: ReactNode;
  rechts?: ReactNode;
}) {
  const absaetze = Array.isArray(einleitung) ? einleitung : einleitung ? [einleitung] : [];
  return (
    <header className="seitenkopf huelle">
      <div className={rechts ? "seitenkopf__raster" : undefined}>
        <div className="seitenkopf__inhalt">
          {eyebrow ? <p className="eyebrow seitenkopf__eyebrow">{eyebrow}</p> : null}
          <H1 text={titel}>
            <Inline text={titel} />
          </H1>
          {absaetze.map((a, i) => (
            <p key={i} className={i === 0 && lead ? "seitenkopf__lead" : "seitenkopf__text"}>
              <Inline text={a} />
            </p>
          ))}
          {children}
        </div>
        {rechts ? <div className="seitenkopf__rechts">{rechts}</div> : null}
      </div>
    </header>
  );
}
