import type { Metadata } from "next";
import { H1 } from "@/components/h1";
import { Suspense } from "react";
import { Brotkrumen } from "@/components/brotkrumen";
import { SuchSeite } from "@/components/such-seite";
import { seiten, ui } from "@/lib/daten";
import { metaFuer } from "@/lib/seo";

const s = seiten.suche;

export const metadata: Metadata = metaFuer({ seo: s.seo, pfad: "/suche" });

export default function SuchePage() {
  return (
    <>
      <Brotkrumen punkte={[{ label: s.h1 }]} />
      <header className="seitenkopf huelle">
        <H1 text={s.h1} />
      </header>
      <section className="band_eng" aria-label={s.h1}>
        <div className="huelle">
          <Suspense fallback={null}>
            <SuchSeite
              platzhalter={ui.suche.platzhalter}
              absenden={ui.knoepfe.sucheOeffnen}
              keineTreffer={ui.suche.keineTreffer}
              gruppen={ui.suche.gruppen}
            />
          </Suspense>
        </div>
      </section>
    </>
  );
}
