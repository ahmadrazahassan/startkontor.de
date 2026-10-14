import Link from "next/link";
import { Icon } from "@/components/icons";
import type { SoftwareKarteDaten } from "@/components/software-karte";

/** Kompakte Programmkarte der Kategorienansicht: Logo im Kreis, Name, zwei Fakten, Website und Profil. */
export function KategorieKarte({ karte }: { karte: SoftwareKarteDaten }) {
  const logo = karte.logo;
  const werbung = karte.hersteller?.werbung === true;
  return (
    <article className="kat-karte">
      <div className="kat-karte__logo">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo.src} alt="" width={Math.max(1, Math.round((56 * logo.breite) / logo.hoehe))} height={56} loading="lazy" decoding="async" />
        ) : (
          <span className="kat-karte__initial" aria-hidden="true">{karte.name.charAt(0)}</span>
        )}
      </div>
      <h4 className="kat-karte__name">
        <Link href={karte.href} className="kat-karte__link">{karte.name}</Link>
      </h4>
      <ul className="kat-karte__fakten liste_ohne">
        {karte.fakten.slice(0, 2).map((f) => (
          <li key={f.text} className={f.ton ? `kat-karte__fakt kat-karte__fakt_${f.ton}` : "kat-karte__fakt"}>{f.text}</li>
        ))}
      </ul>
      <div className="kat-karte__aktionen">
        {karte.hersteller ? (
          <div className="kat-karte__website">
            <a
              href={karte.hersteller.href}
              target="_blank"
              rel={werbung ? "sponsored noopener noreferrer" : "noopener noreferrer"}
              className="knopf knopf_primaer knopf_klein"
              aria-label={`${werbung ? "Werbung: " : ""}${karte.name}: Zur Website des Herstellers (neuer Tab)`}
            >
              <span className="knopf__text">Zur Website</span>
              <Icon name="external" groesse={16} />
            </a>
            {werbung ? <span className="kat-karte__werbung">Werbung</span> : null}
          </div>
        ) : null}
        <Link href={karte.href} className="kat-karte__profil">
          Profil ansehen
          <Icon name="arrowRight" groesse={16} />
        </Link>
      </div>
    </article>
  );
}
