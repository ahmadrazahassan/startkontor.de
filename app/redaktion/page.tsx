import type { Metadata } from "next";
import Link from "next/link";
import { Bild } from "@/components/bild";
import { Brotkrumen } from "@/components/brotkrumen";
import { Inline } from "@/components/inline";
import { Illustration } from "@/components/illustration";
import { KnopfLink } from "@/components/knopf";
import { Register, RegisterZeile } from "@/components/register";
import { Seitenkopf } from "@/components/seitenkopf";
import { holeBildplatz } from "@/lib/bilder";
import { navigation, seiten } from "@/lib/daten";
import { hatPlatzhalter } from "@/lib/platzhalter";
import { metaFuer } from "@/lib/seo";

const s = seiten.redaktion;

export const metadata: Metadata = metaFuer({ seo: s.seo, pfad: "/redaktion" });

export default function RedaktionSeite() {
  // Der Block "Wer dahintersteht" erscheint nur, wenn alle Platzhalter gefüllt sind.
  const werSichtbar = !hatPlatzhalter(s.wer.text) && !hatPlatzhalter(s.wer.titel);
  const bildVorhanden = holeBildplatz(s.bild).vorhanden;

  return (
    <>
      <Brotkrumen punkte={[{ label: navigation.kopfzeile[4].label }]} />
      <Seitenkopf eyebrow={s.eyebrow} titel={s.h1} />

      <section className="band_eng" aria-labelledby="auftrag-titel">
        <div className="huelle redaktionsraster">
          <div>
            <h2 id="auftrag-titel" className="abschnittstitel">
              {s.auftrag.titel}
            </h2>
            <div className="fliesstext stapel">
              {s.auftrag.absaetze.map((a, i) => (
                <p key={i} className={i === 0 ? "lead" : undefined}>
                  <Inline text={a} />
                </p>
              ))}
            </div>
          </div>
          {bildVorhanden ? (
            <div className="redaktionsraster__bild">
              <Bild id={s.bild} sizes="(min-width: 1024px) 480px, 92vw" versatz />
            </div>
          ) : (
            <div className="redaktionsraster__bild">
              <Illustration motiv="quellenpruefung" sizes="(min-width: 1024px) 480px, 92vw" />
            </div>
          )}
        </div>
      </section>

      <section className="band band_weiss" aria-labelledby="haltung-titel">
        <div className="huelle">
          <h2 id="haltung-titel" className="abschnittstitel">
            {s.haltung.titel}
          </h2>
          <Register beschriftung={s.haltung.titel}>
            {s.haltung.punkte.map((p, i) => (
              <RegisterZeile
                key={i}
                ebene={3}
                nummer={String(i + 1).padStart(2, "0")}
                titel={<Inline text={p} />}
                pfeil={false}
              />
            ))}
          </Register>
        </div>
      </section>

      {werSichtbar ? (
        <section className="band_eng" aria-labelledby="wer-titel">
          <div className="huelle">
            <h2 id="wer-titel" className="abschnittstitel">
              {s.wer.titel}
            </h2>
            <p className="lead">
              <Inline text={s.wer.text} />
            </p>
          </div>
        </section>
      ) : null}

      <section className="band band_nebel" aria-labelledby="korrektur-titel">
        <div className="huelle abschlussband">
          <div>
            <h2 id="korrektur-titel">
              <Inline text={s.korrektur.titel} />
            </h2>
            <p className="lead">
              <Inline text={s.korrektur.text} />
            </p>
          </div>
          <KnopfLink href={s.korrektur.cta.href} icon="arrowRight">
            {s.korrektur.cta.label}
          </KnopfLink>
        </div>
      </section>

      <section className="band_eng" aria-label={s.eyebrow}>
        <div className="huelle">
          <ul className="verweisliste liste_ohne">
            {s.verweise.map((v) => (
              <li key={v.href}>
                <Link href={v.href} className="verweisliste__link">
                  {v.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
