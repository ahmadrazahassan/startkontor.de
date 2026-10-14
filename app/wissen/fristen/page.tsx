import type { Metadata } from "next";
import { Suspense } from "react";
import { Brotkrumen } from "@/components/brotkrumen";
import { FristChip, fristLabel } from "@/components/chips";
import { FristenRegister, FristenRegisterStatisch } from "@/components/fristen-register";
import type { RegisterFrist, RegisterTexte } from "@/components/fristen-register";
import { Inline } from "@/components/inline";
import { Seitenkopf } from "@/components/seitenkopf";
import { bausteine, fristen, getLeitfaden, navigation, seiten, stationen, ui } from "@/lib/daten";
import { metaFuer } from "@/lib/seo";
import type { FristStatus } from "@/lib/typen";

const s = seiten.fristen;

export const metadata: Metadata = metaFuer({ seo: s.seo, pfad: "/wissen/fristen" });

export default function FristenSeite() {
  const daten: RegisterFrist[] = fristen.map((f) => ({
    id: f.id,
    titel: f.titel,
    art: f.art,
    datum: f.datum,
    anzeige: f.anzeige,
    status: f.status,
    text: f.text,
    stationen: f.stationen,
    baustein: f.baustein,
    quelle: f.quelle,
    stand: f.stand,
    leitfaden: { slug: f.leitfaden, titel: getLeitfaden(f.leitfaden).titel },
  }));
  const a = ui.abschnitte.fristen;
  const statusLabels = Object.fromEntries(
    (["gilt", "kommt", "entwurf", "wiederkehrend"] as FristStatus[]).map((k) => [k, fristLabel(k)]),
  ) as Record<FristStatus, string>;
  const stationenKurz = stationen.map((x) => ({ slug: x.slug, nummer: x.nummer, name: x.name }));
  const texte: RegisterTexte = {
    filterStation: a.filterStation,
    filterBaustein: a.filterBaustein,
    filterStatus: a.filterStatus,
    filterAlle: a.filterAlle,
    art: a.art,
    datum: a.datum,
    ohneDatum: a.ohneDatum,
    leitfaden: a.leitfaden,
    quellenZeitpunkt: ui.labels.quellenZeitpunkt,
    station: ui.labels.station,
    statusLabels,
    extern: ui.barrierefreiheit.externLink,
    stationenBeschriftung: ui.abschnitte.anbieter.stationen,
    treffer: s.eyebrow,
    keine: ui.suche.keineTreffer,
  };

  return (
    <>
      <Brotkrumen punkte={[{ label: navigation.kopfzeile[3].label, href: "/wissen" }, { label: s.eyebrow }]} />
      <Seitenkopf eyebrow={s.eyebrow} titel={s.h1} einleitung={s.einleitung} />

      <section className="band_eng" aria-labelledby="legende-titel">
        <div className="huelle">
          <h2 id="legende-titel" className="legende__titel">
            {a.filterStatus}
          </h2>
          <ul className="fristlegende liste_ohne">
            {s.legende.map((l) => (
              <li key={l.status}>
                <FristChip status={l.status} />
                <span>
                  <Inline text={l.text} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="band_eng" aria-label={s.eyebrow}>
        <div className="huelle">
          <Suspense
            fallback={
              <FristenRegisterStatisch fristen={daten} stationen={stationenKurz} texte={texte} />
            }
          >
            <FristenRegister
              fristen={daten}
              stationen={stationenKurz}
              bausteine={bausteine.map((b) => ({ slug: b.slug, name: b.name }))}
              texte={texte}
            />
          </Suspense>
          <p className="aussage aussage_klein">
            <Inline text={s.hinweis} />
          </p>
        </div>
      </section>
    </>
  );
}
