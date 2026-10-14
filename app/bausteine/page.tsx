import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Brotkrumen } from "@/components/brotkrumen";
import { Inline } from "@/components/inline";
import { Seitenkopf } from "@/components/seitenkopf";
import { anbieterFuerBaustein, bausteine, navigation, seiten } from "@/lib/daten";
import { metaFuer } from "@/lib/seo";
import { KATEGORIE_ICON } from "@/lib/kategorie-icons";

const s = seiten.bausteine;

export const metadata: Metadata = metaFuer({ seo: s.seo, pfad: "/bausteine" });

export default function BausteineSeite() {
  return (
    <>
      <Brotkrumen punkte={[{ label: navigation.kopfzeile[1].label }]} />
      <Seitenkopf eyebrow={s.eyebrow} titel={s.h1} einleitung={s.einleitung} />

      <section className="band_eng" aria-labelledby="bausteinliste-titel">
        <div className="huelle">
          <h2 id="bausteinliste-titel" className="visuell_versteckt">
            {s.eyebrow}
          </h2>
          <div className="kategorieuebersicht">
            {bausteine.map((b) => (
              <article className="kategorieuebersicht__karte" key={b.slug}>
                <div className="kategorieuebersicht__kopf">
                  <Icon name={KATEGORIE_ICON[b.slug] ?? "file"} groesse={36} className="kategorieuebersicht__icon" />
                  <p className="kategorieuebersicht__anzahl">{anbieterFuerBaustein(b.slug).length} Programme</p>
                </div>
                <h2><Link href={`/bausteine/${b.slug}`}>{b.name}</Link></h2>
                <p><Inline text={b.teaser} /></p>
                <Link className="textlink" href={`/bausteine/${b.slug}`}>Programme ansehen<Icon name="arrowRight" groesse={18} /></Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
