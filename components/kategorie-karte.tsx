import Link from "next/link";
import { Icon } from "@/components/icons";
import type { SoftwareKarteDaten } from "@/components/software-karte";

export type KarteChip = { text: string; ton?: "ok" };

/** Kompakte Programmkarte der Kategorienansicht: Logo, Name, kurze Chips, Website und Profil. */
export function KategorieKarte({ karte, chips }: { karte: SoftwareKarteDaten; chips: KarteChip[] }) {
  const logo = karte.logo;
  const werbung = karte.hersteller?.werbung === true;
  return (
    <article className="kat-karte">
      <div className="kat-karte__logo">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo.src} alt="" width={Math.max(1, Math.round((48 * logo.breite) / logo.hoehe))} height={48} loading="lazy" decoding="async" />
        ) : (
          <span className="kat-karte__initial" aria-hidden="true">{karte.name.charAt(0)}</span>
        )}
      </div>
      <h4 className="kat-karte__name">
        <Link href={karte.href} className="kat-karte__link">{karte.name}</Link>
      </h4>
      <ul className="kat-karte__chips liste_ohne">
        {chips.map((c) => (
          <li key={c.text} className={c.ton === "ok" ? "chip chip_ok" : "chip chip_nebel"}>{c.text}</li>
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
        <Link href={karte.href} className="knopf knopf_sekundaer knopf_klein kat-karte__profil">
          <span className="knopf__text">Profil ansehen</span>
          <Icon name="arrowRight" groesse={16} />
        </Link>
      </div>
    </article>
  );
}
