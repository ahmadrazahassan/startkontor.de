import type { Metadata } from "next";
import Link from "next/link";
import { Brotkrumen } from "@/components/brotkrumen";
import { Inline } from "@/components/inline";
import { Seitenkopf } from "@/components/seitenkopf";
import { anfangsbuchstaben } from "@/lib/filter";
import { sortiereAlphabetisch } from "@/lib/filter";
import { glossar, navigation, seiten, ui } from "@/lib/daten";
import { metaFuer } from "@/lib/seo";

const s = seiten.glossar;

export const metadata: Metadata = metaFuer({ seo: s.seo, pfad: "/wissen/glossar" });

export default function GlossarIndex() {
  const liste = sortiereAlphabetisch(glossar.map((g) => ({ ...g, name: g.begriff })));
  const buchstaben = anfangsbuchstaben(liste.map((g) => g.begriff));
  return (
    <>
      <Brotkrumen punkte={[{ label: navigation.kopfzeile[3].label, href: "/wissen" }, { label: s.eyebrow }]} />
      <Seitenkopf eyebrow={s.eyebrow} titel={s.h1} einleitung={s.einleitung} />

      <section className="band_eng" aria-label={s.eyebrow}>
        <div className="huelle verzeichnis__raster">
          <nav className="verzeichnis__rail sticky_rail" aria-label={ui.barrierefreiheit.anfangsbuchstaben}>
            <ul className="buchstabenleiste buchstabenleiste_rail liste_ohne">
              {buchstaben.map((b) => (
                <li key={b}>
                  <a href={`#buchstabe-${b}`}>{b}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="glossarliste">
            {buchstaben.map((b) => (
              <section key={b} id={`buchstabe-${b}`} className="glossargruppe" aria-label={b}>
                <h2 className="glossargruppe__zeichen" aria-hidden="true">
                  {b}
                </h2>
                <ul className="register glossarregister liste_ohne">
                  {liste
                    .filter((g) => g.begriff.charAt(0).toLocaleUpperCase("de") === b)
                    .map((g) => (
                      <li key={g.slug} className="glossarregister__zeile">
                        <h3 className="register__titel">
                          <Link href={`/wissen/glossar/${g.slug}`} className="register__link">
                            {g.begriff}
                          </Link>
                        </h3>
                        <p className="register__text">
                          <Inline text={g.kurz} />
                        </p>
                      </li>
                    ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
