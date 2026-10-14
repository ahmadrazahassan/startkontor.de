import Image from "next/image";
import { holeBildplatz } from "@/lib/bilder";
import type { CSSProperties } from "react";

type Props = {
  /** id aus bilder.plaetze, z. B. "station-2" */
  id: string;
  sizes: string;
  prioritaet?: boolean;
  /** Ziffer im Platzhalter (Station oder Baustein) */
  nummer?: number;
  /** Welcher Halt auf der Strecke im Platzhalter gefüllt ist (1 bis 5), 0 für keinen */
  halt?: number;
  /** quadratischer Versatzblock in Sky hinter dem Bild (Startseite) */
  versatz?: boolean;
  className?: string;
};

const HALTE = [1, 2, 3, 4, 5];

/**
 * Zeigt das hochgeladene Bild. Fehlt die Datei, erscheint der gestaltete Markenplatzhalter,
 * nie eine graue Fläche. Das Seitenverhältnis bleibt in beiden Fällen gleich.
 */
export function Bild({ id, sizes, prioritaet = false, nummer, halt = 0, versatz = false, className }: Props) {
  const platz = holeBildplatz(id);
  const stil = { "--verhaeltnis": `${platz.verhaeltnis[0]} / ${platz.verhaeltnis[1]}` } as CSSProperties;
  const klassen = ["bild", versatz ? "bild_versatz" : "", platz.transparent ? "bild_illustration" : "", className ?? ""].filter(Boolean).join(" ");

  return (
    <div className={klassen} style={stil}>
      {platz.vorhanden ? (
        <Image
          src={platz.datei}
          alt={platz.alt}
          width={platz.breite}
          height={platz.hoehe}
          sizes={sizes}
          priority={prioritaet}
          className="bild__bild"
        />
      ) : (
        <div className="bild__platzhalter" role="presentation">
          {nummer !== undefined ? (
            <span className="bild__ziffer" data-ziffer={nummer} aria-hidden="true" />
          ) : null}
          <span className="bild__strecke" aria-hidden="true">
            {HALTE.map((h) => (
              <span
                key={h}
                className="bild__halt"
                data-zustand={halt === 0 ? "kommend" : h === halt ? "aktuell" : h < halt ? "passiert" : "kommend"}
              />
            ))}
          </span>
        </div>
      )}
    </div>
  );
}
