import type { Metadata } from "next";
import { Brotkrumen } from "@/components/brotkrumen";
import { ArtikelKarte } from "@/components/artikel-karte";
import { SoftwareEntscheidung } from "@/components/software-entscheidung";
import { Seitenkopf } from "@/components/seitenkopf";
import { bausteine, leitfaeden, navigation, seiten } from "@/lib/daten";
import { metaFuer } from "@/lib/seo";

const s = seiten.leitfaeden;

export const metadata: Metadata = metaFuer({ seo: s.seo, pfad: "/wissen/leitfaeden" });

export default function LeitfadenIndex() {
  return (
    <>
      <Brotkrumen
        punkte={[{ label: navigation.kopfzeile[3].label, href: "/wissen" }, { label: seiten.leitfaeden.eyebrow }]}
      />
      <Seitenkopf eyebrow={s.eyebrow} titel={s.h1} einleitung={s.einleitung} />

      <div className="huelle leitfadengruppen">
        {bausteine.map((b) => {
          const liste = leitfaeden.filter((l) => l.baustein === b.slug);
          if (liste.length === 0) return null;
          return (
            <section key={b.slug} className="leitfadengruppe" aria-labelledby={`gruppe-${b.slug}`}>
              <h2 id={`gruppe-${b.slug}`} className="leitfadengruppe__titel">
                <span className="leitfadengruppe__nr" data-ziffer={String(b.nummer).padStart(2, "0")} aria-hidden="true" />
                {b.name}
              </h2>
              <div className="artikelkarten">{liste.map((l) => <ArtikelKarte key={l.slug} artikel={l} />)}</div>
            </section>
          );
        })}
        <SoftwareEntscheidung />
      </div>
    </>
  );
}
