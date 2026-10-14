import type { Metadata } from "next";
import { Suspense } from "react";
import { Brotkrumen } from "@/components/brotkrumen";
import { Inline } from "@/components/inline";
import { LinkUngueltig } from "@/components/link-ungueltig";
import { NewsletterBlock } from "@/components/newsletter-block";
import { Seitenkopf } from "@/components/seitenkopf";
import { Illustration } from "@/components/illustration";
import { seiten, ui } from "@/lib/daten";
import { metaFuer } from "@/lib/seo";

const s = seiten.brief;

export const metadata: Metadata = metaFuer({ seo: s.seo, pfad: "/brief" });

export default function BriefSeite() {
  return (
    <>
      <Brotkrumen punkte={[{ label: s.eyebrow }]} />
      <Seitenkopf
        eyebrow={s.eyebrow}
        titel={s.h1}
        einleitung={s.einleitung}
        rechts={<Illustration motiv="monatsbrief" sizes="(min-width: 768px) 340px, 260px" />}
      />

      <section className="band_eng" aria-label={s.eyebrow}>
        <div className="huelle">
          <ol className="prinzipien prinzipien_drei">
            {s.inhalt.map((p, i) => (
              <li key={p.titel} className="prinzipien__punkt">
                <span className="prinzipien__ziffer" data-ziffer={String(i + 1).padStart(2, "0")} aria-hidden="true" />
                <h2 className="prinzipien__titel">
                  <Inline text={p.titel} />
                </h2>
                <p>
                  <Inline text={p.text} />
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="band band_nebel" aria-label={ui.knoepfe.abonnieren}>
        <div className="huelle briefseite">
          <Suspense fallback={null}>
            <LinkUngueltig titel={ui.newsletter.linkUngueltigTitel} text={ui.newsletter.linkUngueltigText} />
          </Suspense>
          <NewsletterBlock />
          <p className="verfahren">
            <Inline text={s.verfahren} />
          </p>
        </div>
      </section>
    </>
  );
}
