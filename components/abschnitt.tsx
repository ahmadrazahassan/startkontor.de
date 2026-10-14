import type { ReactNode } from "react";
import { wlStil } from "@/components/wort-stil";

/**
 * Nummerierter Abschnitt mit Randleiste. Die große Ziffer in Sky ist dekorativ (aria-hidden).
 * Auf schmalen Seiten (unter 1024 Pixel) entfällt die Randleiste.
 */
export function Abschnitt({
  nummer,
  id,
  titel,
  children,
  inline = false,
  ebene = 2,
}: {
  /** 1 wird als "01" gesetzt */
  nummer?: number | string;
  id: string;
  titel: ReactNode;
  children: ReactNode;
  /** Ziffer neben der Überschrift statt in der Randleiste (für schmale Spalten) */
  inline?: boolean;
  ebene?: 2 | 3;
}) {
  const ziffer = typeof nummer === "number" ? String(nummer).padStart(2, "0") : nummer;
  const Titel = `h${ebene}` as "h2" | "h3";
  return (
    <section
      id={id}
      className={inline ? "abschnitt abschnitt_inline sprung_ziel" : "abschnitt sprung_ziel"}
      aria-labelledby={`${id}-titel`}
    >
      {ziffer ? (
        <div className="abschnitt__nummer" data-ziffer={ziffer} aria-hidden="true" />
      ) : (
        <div aria-hidden="true" className="abschnitt__nummer" />
      )}
      <div className="abschnitt__inhalt">
        <Titel id={`${id}-titel`} style={wlStil(titel)}>
          {titel}
        </Titel>
        {children}
      </div>
    </section>
  );
}
