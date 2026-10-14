import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/icons";
import { wlStil } from "@/components/wort-stil";

/** Register: linierte Liste statt Kartenraster. Zeile mit Nummer, Titel, Beschreibung und kleiner Metaspalte. */
export function Register({
  children,
  className,
  beschriftung,
}: {
  children: ReactNode;
  className?: string;
  beschriftung?: string;
}) {
  return (
    <ol className={["register", className ?? ""].filter(Boolean).join(" ")} aria-label={beschriftung}>
      {children}
    </ol>
  );
}

export function RegisterZeile({
  nummer,
  titel,
  text,
  meta,
  href,
  ebene = 3,
  id,
  pfeil = true,
}: {
  nummer?: ReactNode;
  titel: ReactNode;
  text?: ReactNode;
  meta?: ReactNode;
  href?: string;
  ebene?: 2 | 3 | 4;
  id?: string;
  pfeil?: boolean;
}) {
  const Titel = `h${ebene}` as "h2" | "h3" | "h4";
  return (
    <li className="register__zeile" id={id}>
      {nummer !== undefined ? (
        <span className="register__nummer" data-ziffer={nummer} aria-hidden="true" />
      ) : (
        <span aria-hidden="true" />
      )}
      <div className="register__haupt">
        <Titel className="register__titel" style={wlStil(titel)}>
          {href ? (
            <Link href={href} className="register__link">
              {titel}
            </Link>
          ) : (
            titel
          )}
        </Titel>
        {text ? <p className="register__text">{text}</p> : null}
      </div>
      {meta ? <div className="register__meta">{meta}</div> : <span />}
      {href && pfeil ? <Icon name="arrowRight" groesse={20} className="register__pfeil" /> : <span />}
    </li>
  );
}
