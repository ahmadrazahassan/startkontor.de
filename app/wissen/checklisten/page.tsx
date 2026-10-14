import type { Metadata } from "next";
import { Akte } from "@/components/akte";
import { Brotkrumen } from "@/components/brotkrumen";
import { StationenMarken } from "@/components/chips";
import { Inline } from "@/components/inline";
import { Seitenkopf } from "@/components/seitenkopf";
import { Illustration } from "@/components/illustration";
import { anzahlPunkte } from "@/components/verweise";
import { checklisten, navigation, seiten, ui } from "@/lib/daten";
import { metaFuer } from "@/lib/seo";

const s = seiten.checklisten;

export const metadata: Metadata = metaFuer({ seo: s.seo, pfad: "/wissen/checklisten" });

export default function ChecklistenIndex() {
  return (
    <>
      <Brotkrumen punkte={[{ label: navigation.kopfzeile[3].label, href: "/wissen" }, { label: s.eyebrow }]} />
      <Seitenkopf
        eyebrow={s.eyebrow}
        titel={s.h1}
        einleitung={s.einleitung}
        rechts={<Illustration motiv="vertragscheck" sizes="(min-width: 768px) 340px, 260px" />}
      />
      <section className="band_eng" aria-label={s.eyebrow}>
        <div className="huelle">
          <div className="akten akten_zwei">
            {checklisten.map((c, i) => (
              <Akte
                key={c.slug}
                kennung={String(i + 1).padStart(2, "0")}
                titel={<Inline text={c.titel} />}
                href={`/wissen/checklisten/${c.slug}`}
                linkText={ui.knoepfe.checklisteOeffnen}
                text={<Inline text={c.einleitung} />}
              >
                <p className="akte__meta">
                  {anzahlPunkte(c.slug)} {ui.labels.punkte}
                </p>
                <StationenMarken stationen={c.stationen} />
              </Akte>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
