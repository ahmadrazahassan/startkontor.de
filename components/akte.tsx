import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/icons";
import { wlStil } from "@/components/wort-stil";

type Props = {
  titel: ReactNode;
  titelEbene?: 2 | 3 | 4;
  /** Bild oder Platzhalter oberhalb des Textes */
  bild?: ReactNode;
  /** große dekorative Ziffer oder Kennung, z. B. "01" */
  kennung?: ReactNode;
  eyebrow?: ReactNode;
  text?: ReactNode;
  /** macht die ganze Akte zum Link */
  href?: string;
  linkText?: ReactNode;
  /** Hervorhebung (aktuelle Station, empfohlene Akte) */
  aktuell?: boolean;
  /** Farbe des Kopfbalkens: Standard Sky, warn für typische Fehler */
  ton?: "standard" | "warn";
  /** liegende Akte: Bild links, Text rechts (ab 768 Pixel) */
  breit?: boolean;
  children?: ReactNode;
  className?: string;
};

/** Akte: Karte mit 6 Pixel Kopfbalken. Sky im Ruhezustand, Primär bei Hover oder wenn aktuell. */
export function Akte({
  titel,
  titelEbene = 3,
  bild,
  kennung,
  eyebrow,
  text,
  href,
  linkText,
  aktuell,
  ton = "standard",
  breit = false,
  children,
  className,
}: Props) {
  const Titel = `h${titelEbene}` as "h2" | "h3" | "h4";
  return (
    <article className={["akte", breit ? "akte_breit" : "", className ?? ""].filter(Boolean).join(" ")} data-aktuell={aktuell ? "ja" : undefined} data-ton={ton}>
      {bild ? <div className="akte__bild">{bild}</div> : null}
      <div className="akte__koerper">
        {kennung ? (
          <span className="akte__kennung" data-ziffer={kennung} aria-hidden="true" />
        ) : null}
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <Titel className="akte__titel" style={wlStil(titel)}>
          {href ? (
            <Link href={href} className="akte__link">
              {titel}
            </Link>
          ) : (
            titel
          )}
        </Titel>
        {text ? <p className="akte__text">{text}</p> : null}
        {children}
        {href && linkText ? (
          <span className="akte__fuss" aria-hidden="true">
            <span>{linkText}</span>
            <Icon name="arrowRight" groesse={18} />
          </span>
        ) : null}
      </div>
    </article>
  );
}
