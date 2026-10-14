import type { Metadata } from "next";
import Link from "next/link";
import { Akkordeon } from "@/components/akkordeon";
import { AkkordeonHash } from "@/components/akkordeon-hash";
import { Brotkrumen } from "@/components/brotkrumen";
import { Inline } from "@/components/inline";
import { JsonLd } from "@/components/json-ld";
import { Seitenkopf } from "@/components/seitenkopf";
import { Illustration } from "@/components/illustration";
import { faq, seiten, ui } from "@/lib/daten";
import { faqAusEintraegen } from "@/lib/jsonld";
import { metaFuer } from "@/lib/seo";

const s = seiten.faq;

export const metadata: Metadata = metaFuer({ seo: s.seo, pfad: "/faq" });

export default function FaqSeite() {
  const themen = [...new Set(faq.map((f) => f.thema))];
  return (
    <>
      <Brotkrumen punkte={[{ label: s.eyebrow }]} />
      <Seitenkopf
        eyebrow={s.eyebrow}
        titel={s.h1}
        einleitung={s.einleitung}
        rechts={<Illustration motiv="beratung" sizes="(min-width: 768px) 340px, 260px" symbolbild />}
      />
      <JsonLd daten={faqAusEintraegen(faq)} />
      <AkkordeonHash />

      <div className="huelle faqseite">
        {themen.map((thema) => (
          <section key={thema} className="faqgruppe" aria-labelledby={`thema-${thema}`}>
            <h2 id={`thema-${thema}`} className="faqgruppe__titel">
              {thema}
            </h2>
            <div className="akkordeon-liste">
              {faq
                .filter((f) => f.thema === thema)
                .map((f) => (
                  <Akkordeon key={f.id} id={f.id} frage={<Inline text={f.frage} />}>
                    <p>
                      <Inline text={f.antwort} />
                    </p>
                    {f.verweis ? (
                      <p className="akkordeon__mehr">
                        <Link href={f.verweis} className="knopf knopf_tertiaer">
                          <span className="knopf__text">{ui.knoepfe.mehrLesen}</span>
                        </Link>
                      </p>
                    ) : null}
                  </Akkordeon>
                ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
