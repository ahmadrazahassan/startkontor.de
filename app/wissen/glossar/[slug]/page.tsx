import type { Metadata } from "next";
import { H1 } from "@/components/h1";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Brotkrumen } from "@/components/brotkrumen";
import { Icon } from "@/components/icons";
import { Inline } from "@/components/inline";
import { JsonLd } from "@/components/json-ld";
import { glossar, fristNachId, getBaustein, getLeitfaden, navigation, seiten, ui } from "@/lib/daten";
import { definierterBegriff } from "@/lib/jsonld";
import { inlineZuText } from "@/lib/inline";
import { metaFuer } from "@/lib/seo";
import { sortiereAlphabetisch } from "@/lib/filter";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return glossar.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const g = glossar.find((x) => x.slug === slug);
  if (!g) return {};
  return metaFuer({
    seo: { titel: `${g.begriff}: Begriff kurz erklärt`, beschreibung: inlineZuText(g.kurz) },
    pfad: `/wissen/glossar/${g.slug}`,
  });
}

const t = ui.abschnitte.glossar;

export default async function GlossarSeite({ params }: Props) {
  const { slug } = await params;
  const g = glossar.find((x) => x.slug === slug);
  if (!g) notFound();

  const alle = sortiereAlphabetisch(glossar.map((x) => ({ ...x, name: x.begriff })));
  const i = alle.findIndex((x) => x.slug === g.slug);
  const vorher = i > 0 ? alle[i - 1] : null;
  const nachher = i < alle.length - 1 ? alle[i + 1] : null;
  const leitfaeden = g.siehe.leitfaeden ?? [];
  const bausteineSiehe = g.siehe.bausteine ?? [];
  const fristenSiehe = g.siehe.fristen ?? [];

  return (
    <>
      <Brotkrumen
        punkte={[
          { label: navigation.kopfzeile[3].label, href: "/wissen" },
          { label: seiten.glossar.eyebrow, href: "/wissen/glossar" },
          { label: g.begriff },
        ]}
      />
      <JsonLd daten={definierterBegriff(g)} />

      <article>
        <header className="seitenkopf huelle">
          <p className="eyebrow seitenkopf__eyebrow">{seiten.glossar.eyebrow}</p>
          <H1 text={g.begriff} />
          <p className="seitenkopf__lead">
            <Inline text={g.kurz} />
          </p>
        </header>

        <div className="huelle glossarseite">
          <div className="fliesstext">
            <p>
              <Inline text={g.erklaerung} />
            </p>
          </div>

          {leitfaeden.length + bausteineSiehe.length + fristenSiehe.length > 0 ? (
            <aside className="glossarseite__siehe" aria-label={t.siehe}>
              <h2 className="glossarseite__titel">{t.siehe}</h2>
              <div className="verwandt">
                {leitfaeden.length > 0 ? (
                  <div>
                    <h3 className="verwandt__titel">{t.leitfaeden}</h3>
                    <ul className="verwandt__liste liste_ohne">
                      {leitfaeden.map((s) => (
                        <li key={s}>
                          <Link href={`/wissen/leitfaeden/${s}`}>
                            <Inline text={getLeitfaden(s).titel} />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {bausteineSiehe.length > 0 ? (
                  <div>
                    <h3 className="verwandt__titel">{t.bausteine}</h3>
                    <ul className="verwandt__liste liste_ohne">
                      {bausteineSiehe.map((s) => (
                        <li key={s}>
                          <Link href={`/bausteine/${s}`}>{getBaustein(s).name}</Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {fristenSiehe.length > 0 ? (
                  <div>
                    <h3 className="verwandt__titel">{ui.abschnitte.leitfaden.verwandtFristen}</h3>
                    <ul className="verwandt__liste liste_ohne">
                      {fristenSiehe.map((id) => {
                        const f = fristNachId.get(id);
                        return f ? (
                          <li key={id}>
                            <Link href={`/wissen/fristen#${f.id}`}>{f.titel}</Link>
                          </li>
                        ) : null;
                      })}
                    </ul>
                  </div>
                ) : null}
              </div>
            </aside>
          ) : null}

          <nav className="stationsnavigation__raster glossarnavigation" aria-label={t.zurUebersicht}>
            {vorher ? (
              <Link href={`/wissen/glossar/${vorher.slug}`} className="stationswechsel stationswechsel_zurueck">
                <Icon name="arrowLeft" groesse={22} />
                <span className="stationswechsel__text">
                  <span className="stationswechsel__name">{vorher.begriff}</span>
                </span>
              </Link>
            ) : (
              <span />
            )}
            {nachher ? (
              <Link href={`/wissen/glossar/${nachher.slug}`} className="stationswechsel stationswechsel_weiter">
                <span className="stationswechsel__text">
                  <span className="stationswechsel__name">{nachher.begriff}</span>
                </span>
                <Icon name="arrowRight" groesse={22} />
              </Link>
            ) : (
              <span />
            )}
          </nav>
          <p className="rueckweg">
            <Link href="/wissen/glossar" className="knopf knopf_sekundaer">
              <Icon name="arrowLeft" groesse={18} />
              <span className="knopf__text">{t.zurUebersicht}</span>
            </Link>
          </p>
        </div>
      </article>
    </>
  );
}
