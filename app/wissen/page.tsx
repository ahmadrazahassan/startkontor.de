import type { Metadata } from "next";
import { Brotkrumen } from "@/components/brotkrumen";
import { ArtikelKarte } from "@/components/artikel-karte";
import { SoftwareEntscheidung } from "@/components/software-entscheidung";
import { Inline } from "@/components/inline";
import { Register, RegisterZeile } from "@/components/register";
import { Seitenkopf } from "@/components/seitenkopf";
import { getLeitfaden, navigation, seiten } from "@/lib/daten";
import { metaFuer } from "@/lib/seo";

const s = seiten.wissen;

export const metadata: Metadata = metaFuer({ seo: s.seo, pfad: "/wissen" });

export default function WissenSeite() {
  return (
    <>
      <Brotkrumen punkte={[{ label: navigation.kopfzeile[3].label }]} />
      <Seitenkopf eyebrow={s.eyebrow} titel={s.h1} einleitung={s.einleitung} />
      <section className="band_eng" aria-label={s.eyebrow}>
        <div className="huelle">
          <Register className="register_gross" beschriftung={s.eyebrow}>
            {s.bereiche.map((b, i) => (
              <RegisterZeile
                key={b.href}
                ebene={2}
                nummer={String(i + 1).padStart(2, "0")}
                titel={<Inline text={b.titel} />}
                text={<Inline text={b.text} />}
                href={b.href}
              />
            ))}
          </Register>
        </div>
      </section>
      <section className="band" aria-labelledby="wissen-artikel"><div className="huelle"><div className="startkopf"><p className="eyebrow">Ratgeber</p><h2 id="wissen-artikel">Gut vorbereitet zur Softwareentscheidung</h2><p className="lead">Praktische Anleitungen zu Rechnungen, Team, Vertrieb und Softwarekosten.</p></div><div className="artikelkarten">{["e-rechnung-fahrplan", "arbeitszeit-erfassen", "crm-ohne-overhead", "warenwirtschaft-und-erp", "gesamtkosten-rechnen", "anbietergespraech-vorbereiten"].map((slug) => <ArtikelKarte key={slug} artikel={getLeitfaden(slug)} />)}</div><SoftwareEntscheidung /></div></section>
    </>
  );
}
