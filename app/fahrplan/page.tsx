import type { Metadata } from "next";
import { Akte } from "@/components/akte";
import { Bild } from "@/components/bild";
import { Brotkrumen } from "@/components/brotkrumen";
import { Fahrplantafel } from "@/components/fahrplantafel";
import { Inline } from "@/components/inline";
import { KnopfLink } from "@/components/knopf";
import { Seitenkopf } from "@/components/seitenkopf";
import { bausteine, navigation, planer, seiten, stationen, ui } from "@/lib/daten";
import { metaFuer } from "@/lib/seo";
import type { StatusKey } from "@/lib/typen";

const s = seiten.fahrplan;

export const metadata: Metadata = metaFuer({ seo: s.seo, pfad: "/fahrplan" });

export default function FahrplanSeite() {
  const zellen = Object.fromEntries(
    stationen.map((st) => [
      st.slug,
      Object.fromEntries(bausteine.map((b) => [b.slug, { status: st.bausteine[b.slug].status, grund: st.bausteine[b.slug].grund }])),
    ]),
  );
  const statusLabels = Object.fromEntries(
    planer.statusReihenfolge.map((k) => [k, planer.statusAnzeige[k].label]),
  ) as Record<StatusKey, string>;
  const statusKurz = Object.fromEntries(
    planer.statusReihenfolge.map((k) => [k, planer.statusAnzeige[k].kurz]),
  ) as Record<StatusKey, string>;

  return (
    <>
      <Brotkrumen punkte={[{ label: navigation.kopfzeile[0].label }]} />
      <Seitenkopf eyebrow={s.eyebrow} titel={s.h1} einleitung={s.einleitung} />

      <section className="band_eng" aria-labelledby="lesen-titel">
        <div className="huelle">
          <h2 id="lesen-titel" className="abschnittstitel">
            <Inline text={s.lesen.titel} />
          </h2>
          <ol className="prinzipien prinzipien_drei">
            {s.lesen.punkte.map((p, i) => (
              <li key={p.titel} className="prinzipien__punkt">
                <span className="prinzipien__ziffer" data-ziffer={String(i + 1).padStart(2, "0")} aria-hidden="true" />
                <h3 className="prinzipien__titel">
                  <Inline text={p.titel} />
                </h3>
                <p>
                  <Inline text={p.text} />
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="band band_weiss" aria-labelledby="tafel-titel">
        <div className="huelle">
          <div className="startkopf">
            <h2 id="tafel-titel">
              <Inline text={s.tafel.titel} />
            </h2>
            <p className="lead">
              <Inline text={s.tafel.text} />
            </p>
          </div>
          <Fahrplantafel
            titel={s.tafel.titel}
            stationen={stationen.map((st) => ({ slug: st.slug, nummer: st.nummer, name: st.name }))}
            bausteine={bausteine.map((b) => ({ slug: b.slug, nummer: b.nummer, name: b.name, kurzname: b.kurzname }))}
            zellen={zellen}
            statusLabels={statusLabels}
            statusKurz={statusKurz}
            texte={{
              station: ui.labels.station,
              baustein: ui.labels.baustein,
              zurStation: String(ui.abschnitte.planer.stationLink),
              zumBaustein: String(ui.abschnitte.planer.bausteinLink),
              legende: s.tafel.hinweisTabelle,
            }}
          />
          <p className="tafel__hinweis">
            <Inline text={s.tafel.hinweisTabelle} />
          </p>
        </div>
      </section>

      <section className="band_eng" aria-label={s.eyebrow}>
        <div className="huelle">
          <p className="aussage">
            <Inline text={s.hinweis} />
          </p>
        </div>
      </section>

      <section className="band" aria-labelledby="stationen-titel">
        <div className="huelle">
          <h2 id="stationen-titel" className="visuell_versteckt">
            {s.eyebrow}
          </h2>
          <div className="akten_breit_liste">
            {stationen.map((st) => (
              <Akte
                key={st.slug}
                breit
                kennung={String(st.nummer).padStart(2, "0")}
                eyebrow={`${ui.labels.station} ${st.nummer}`}
                titel={st.name}
                href={`/fahrplan/${st.slug}`}
                linkText={String(ui.abschnitte.planer.stationLink)}
                text={
                  <>
                    <strong className="akte__untertitel">{st.untertitel}</strong>
                    <br />
                    <Inline text={st.teaser} />
                  </>
                }
                bild={
                  <Bild
                    id={st.bild}
                    nummer={st.nummer}
                    halt={st.nummer}
                    sizes="(min-width: 1280px) 460px, (min-width: 768px) 40vw, 92vw"
                  />
                }
              />
            ))}
          </div>
        </div>
      </section>

      <section className="band band_nacht" aria-labelledby="abschluss-titel">
        <div className="huelle abschlussband">
          <div>
            <h2 id="abschluss-titel">
              <Inline text={s.abschluss.titel} />
            </h2>
            <p className="lead">
              <Inline text={s.abschluss.text} />
            </p>
          </div>
          <KnopfLink href={s.abschluss.cta.href} icon="arrowRight">
            {s.abschluss.cta.label}
          </KnopfLink>
        </div>
      </section>
    </>
  );
}
