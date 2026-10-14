import Link from "next/link";
import type { CSSProperties } from "react";

export type Halt = {
  schluessel: string;
  nummer?: number | string;
  titel: string;
  text?: string;
  href?: string;
  zustand?: "aktuell" | "passiert" | "kommend" | "neutral";
  /** Zusatz für Screenreader, z. B. "Station 2 von 5" */
  lesetext?: string;
};

type Props = {
  halte: Halt[];
  variante?: "gross" | "kompakt" | "menue";
  /** Unterhalb von 768 Pixel vertikal darstellen */
  vertikalMobil?: boolean;
  /** Linie zeichnet sich einmal beim ersten Sichtbarwerden (nur Startseite) */
  animiert?: boolean;
  beschriftung?: string;
  titelEbene?: 2 | 3 | 4;
  /** Auf der Strecke aktive Seite, nur für aria-current */
  className?: string;
};

function Titel({ ebene, children }: { ebene: 2 | 3 | 4 | undefined; children: React.ReactNode }) {
  if (ebene === 2) return <h2 className="strecke__titel">{children}</h2>;
  if (ebene === 3) return <h3 className="strecke__titel">{children}</h3>;
  if (ebene === 4) return <h4 className="strecke__titel">{children}</h4>;
  return <span className="strecke__titel">{children}</span>;
}

/**
 * Strecke: dünne Linie mit quadratischen Haltepunkten. Aktueller Halt gefüllt in Primär,
 * passierte in Sky, kommende als Umriss. Wird rein über Props gespeist und ist daher auch
 * in Client Komponenten verwendbar.
 */
export function Strecke({
  halte,
  variante = "gross",
  vertikalMobil = true,
  animiert = false,
  beschriftung,
  titelEbene,
  className,
}: Props) {
  const klassen = [
    "strecke",
    `strecke_${variante}`,
    vertikalMobil ? "strecke_mobilvertikal" : "",
    animiert ? "strecke_animiert" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <ol className={klassen} aria-label={beschriftung} data-anzahl={halte.length}>
      {halte.map((h, i) => {
        const inhalt = (
          <>
            {variante === "menue" && h.nummer !== undefined ? (
              <span className="strecke__ziffer" data-ziffer={h.nummer} aria-hidden="true" />
            ) : null}
            <Titel ebene={titelEbene}>{h.titel}</Titel>
            {h.text ? <span className="strecke__text">{h.text}</span> : null}
            {h.lesetext ? <span className="visuell_versteckt">{h.lesetext}</span> : null}
          </>
        );
        return (
          <li
            key={h.schluessel}
            className="strecke__halt"
            data-zustand={h.zustand ?? "neutral"}
            style={{ "--i": i } as CSSProperties}
          >
            <span className="strecke__knoten" aria-hidden="true">
              {variante === "menue" ? "" : h.nummer}
            </span>
            {h.href && h.zustand !== "aktuell" ? (
              <Link href={h.href} className="strecke__inhalt strecke__link">
                {inhalt}
              </Link>
            ) : (
              <div className="strecke__inhalt" aria-current={h.zustand === "aktuell" ? "step" : undefined}>
                {inhalt}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
