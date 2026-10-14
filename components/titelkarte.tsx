import Link from "next/link";
import type { ReactNode } from "react";
import { Inline } from "@/components/inline";
import { wlStil } from "@/components/wort-stil";

/**
 * Titelkarte eines Leitfadens: Nebelfläche mit der Baustein Nummer als große Sky Ziffer,
 * Titel in der Hauptschrift, Lesezeit in der Oberflächenschrift. Nie ein Foto.
 */
export function Titelkarte({
  nummer,
  baustein,
  titel,
  untertitel,
  meta,
  href,
  gross = false,
  ebene = 3,
}: {
  nummer: number;
  baustein: string;
  titel: string;
  untertitel?: string;
  meta: ReactNode;
  href: string;
  gross?: boolean;
  ebene?: 2 | 3 | 4;
}) {
  const Titel = `h${ebene}` as "h2" | "h3" | "h4";
  return (
    <article className="titelkarte" data-gross={gross ? "ja" : undefined}>
      <span className="titelkarte__ziffer" data-ziffer={nummer} aria-hidden="true" />
      <div className="titelkarte__inhalt">
        <span className="eyebrow">{baustein}</span>
        <Titel className="titelkarte__titel" style={wlStil(titel)}>
          <Link href={href} className="titelkarte__link">
            <Inline text={titel} />
          </Link>
        </Titel>
        {untertitel ? (
          <p className="titelkarte__untertitel">
            <Inline text={untertitel} />
          </p>
        ) : null}
        <p className="titelkarte__meta">{meta}</p>
      </div>
    </article>
  );
}
