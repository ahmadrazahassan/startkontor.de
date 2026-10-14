import Link from "next/link";
import { Icon } from "@/components/icons";
import { Bewertungsanzeige } from "@/components/bewertung";
import { wlStil } from "@/components/wort-stil";
import { nbsp } from "@/lib/nbsp";

export type SoftwareKarteDaten = {
  slug: string;
  name: string;
  href: string;
  kategorie: string;
  kurz: string;
  logo: { src: string; breite: number; hoehe: number } | null;
  fakten: { text: string; ton?: "ok" | "nebel" }[];
  geprueft: string;
  hersteller?: { href: string; werbung: boolean };
  bewertung?: number;
};
export type SoftwareKarteTexte = { reviewLesen: string; geprueftAm: string; von: string };

/** Herstellerlogos bleiben unverändert. Sterne erscheinen nur bei hinterlegten Bewertungen. */
export function SoftwareKarte({ karte, texte, ebene = 3, variante = "kachel" }: {
  karte: SoftwareKarteDaten;
  texte: SoftwareKarteTexte;
  ebene?: 2 | 3 | 4;
  variante?: "kachel" | "liste";
}) {
  const Titel = `h${ebene}` as "h2" | "h3" | "h4";
  const logo = karte.logo;
  return (
    <article className={variante === "liste" ? "softwarekarte softwarekarte_liste" : "softwarekarte"}>
      <div className="softwarekarte__oben">
        <div className="softwarekarte__logo">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo.src} alt="" width={Math.max(1, Math.round((64 * logo.breite) / logo.hoehe))} height={64} loading="lazy" decoding="async" />
          ) : <span className="softwarekarte__initial" aria-hidden="true">{karte.name.charAt(0)}</span>}
        </div>
        <div className="softwarekarte__kopf">
          <p className="softwarekarte__kategorie">{karte.kategorie}</p>
          <Titel className="softwarekarte__name" style={wlStil(karte.name)}>
            <Link href={karte.href} className="softwarekarte__link">{karte.name}</Link>
          </Titel>
          {karte.bewertung !== undefined ? <Bewertungsanzeige wert={karte.bewertung} von={texte.von} groesse="klein" /> : null}
        </div>
      </div>
      <p className="softwarekarte__kurz">{nbsp(karte.kurz)}</p>
      {karte.fakten.length > 0 ? (
        <ul className="softwarekarte__fakten liste_ohne">
          {karte.fakten.map((f) => (
            <li key={f.text} className={f.ton ? `softwarekarte__fakt softwarekarte__fakt_${f.ton}` : "softwarekarte__fakt"}>{nbsp(f.text)}</li>
          ))}
        </ul>
      ) : null}
      <div className="softwarekarte__fuss">
        <div className="softwarekarte__aktionen">
          {variante === "liste" ? <Link href={karte.href + "#preise"} className="softwarekarte__preislink">Preise ansehen</Link> : null}
          <Link href={karte.href} className="softwarekarte__cta softwarekarte__profil knopf knopf_sekundaer knopf_klein">
            <span className="knopf__text">{texte.reviewLesen}</span><Icon name="arrowRight" groesse={18} />
          </Link>
          {karte.hersteller ? (
            <div className="softwarekarte__hersteller">
              <a href={karte.hersteller.href} target="_blank" rel={karte.hersteller.werbung ? "sponsored noopener noreferrer" : "noopener noreferrer"} className="knopf knopf_primaer knopf_klein softwarekarte__website" aria-label={`${karte.hersteller.werbung ? "Werbung: " : ""}${karte.name}: Zur Website des Herstellers (neuer Tab)`}>
                <span className="knopf__text">Zur Website</span><Icon name="external" groesse={16} />
              </a>
              {karte.hersteller.werbung ? <span className="softwarekarte__werbung">Werbung</span> : null}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
