import type { Metadata } from "next";
import { H1 } from "@/components/h1";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Abschnitt } from "@/components/abschnitt";
import { Akkordeon } from "@/components/akkordeon";
import { Akte } from "@/components/akte";
import { Bild } from "@/components/bild";
import { SoftwareKarte } from "@/components/software-karte";
import { AuswahlhilfeKarte } from "@/components/auswahlhilfe-karte";
import { Brotkrumen } from "@/components/brotkrumen";
import { StationenMarken } from "@/components/chips";
import { Inline } from "@/components/inline";
import { wlStil } from "@/components/wort-stil";
import { JsonLd } from "@/components/json-ld";
import { ChecklistenAkten, LeitfadenRegister } from "@/components/verweise";
import { Werbebanner } from "@/components/werbebanner";
import { anbieterFuerBaustein, bausteine, getStation, navigation, ui } from "@/lib/daten";
import { faqSeite } from "@/lib/jsonld";
import { metaFuer } from "@/lib/seo";
import { softwareKarte, softwareKarteTexte } from "@/lib/software-ansicht";

type Props = { params: Promise<{ baustein: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return bausteine.map((b) => ({ baustein: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { baustein } = await params;
  const b = bausteine.find((x) => x.slug === baustein);
  if (!b) return {};
  return metaFuer({ seo: b.seo, pfad: `/bausteine/${b.slug}` });
}

const abschnitte = ui.abschnitte.baustein;

export default async function BausteinSeite({ params }: Props) {
  const { baustein: slug } = await params;
  const b = bausteine.find((x) => x.slug === slug);
  if (!b) notFound();

  return (
    <>
      <Brotkrumen punkte={[{ label: navigation.kopfzeile[1].label, href: "/bausteine" }, { label: b.name }]} />

      <header className="seitenkopf huelle kategoriekopfseite">
        <div className="stationskopf__text">
          <p className="eyebrow seitenkopf__eyebrow">{ui.labels.baustein}</p>
          <H1 text={b.name} />
          <p className="seitenkopf__lead">
            <Inline text={b.definition} />
          </p>
        </div>
        <div className="stationskopf__bild">
          <Bild id={b.bild} nummer={b.nummer} halt={b.nummer} prioritaet sizes="220px" />
        </div>
      </header>

      <nav className="kategorienav" aria-label="In dieser Kategorie">
        <div className="huelle"><a href="#anbieter">Software im Überblick</a><a href="#auswahlhilfe">Auswahlkriterien und Ratgeber</a></div>
      </nav>
      <section className="huelle softwarekategorie" id="anbieter" aria-labelledby="softwareliste-titel">
        <div>
          <div className="portalabschnittkopf">
            <div><h2 id="softwareliste-titel">{anbieterFuerBaustein(b.slug).length} Programme für {b.name}</h2><p>Alphabetisch sortiert, ohne Wertung.</p></div>
          </div>
          <ul className="softwareliste liste_ohne">
            {anbieterFuerBaustein(b.slug).map((a) => <li key={a.slug}><SoftwareKarte karte={softwareKarte(a)} texte={softwareKarteTexte} variante="liste" /></li>)}
          </ul>
          <Werbebanner platzierung={{ art: "baustein", baustein: b.slug }} kennung={`baustein-${b.slug}`} />
        </div>
        <aside className="softwarekategorie__rand">
          <AuswahlhilfeKarte />
          <div className="kategorielinks"><h3>Weitere Kategorien</h3><ul className="liste_ohne">{bausteine.filter((x) => x.slug !== b.slug).map((x) => <li key={x.slug}><Link href={`/bausteine/${x.slug}`}>{x.name}</Link></li>)}</ul></div>
        </aside>
      </section>
      <div className="huelle kategorieratgeber" id="auswahlhilfe">
        <Abschnitt nummer={1} id="wann" titel={abschnitte.wann}>
          <p className="fliesstext">
            <Inline text={b.wann.text} />
          </p>
          <div className="stationsmarken_zeile">
            <StationenMarken stationen={b.wann.stationen} verlinkt />
            <ul className="stationsliste liste_ohne">
              {b.wann.stationen.map((slugStation) => {
                const st = getStation(slugStation);
                return (
                  <li key={slugStation}>
                    <Link href={`/fahrplan/${st.slug}`}>
                      {ui.labels.station} {st.nummer}: {st.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </Abschnitt>

        <Abschnitt nummer={2} id="kriterien" titel={abschnitte.kriterien}>
          <dl className="kriterien">
            {b.kriterien.map((k, i) => (
              <div key={k.titel} className="kriterium">
                <dt className="kriterium__titel" style={wlStil(k.titel)}>
                  <span className="kriterium__nummer" data-ziffer={String(i + 1).padStart(2, "0")} aria-hidden="true" />
                  <Inline text={k.titel} />
                </dt>
                <dd className="kriterium__warum">
                  <span className="kriterium__label">{abschnitte.kriteriumWarum}</span>
                  <Inline text={k.warum} />
                </dd>
                <dd className="kriterium__frage">
                  <span className="kriterium__label">{abschnitte.kriteriumFrage}</span>
                  <Inline text={k.frage} />
                </dd>
              </div>
            ))}
          </dl>
        </Abschnitt>

        <Abschnitt nummer={3} id="preislogik" titel={abschnitte.preislogik}>
          <p className="fliesstext">
            <Inline text={b.preislogik.intro} />
          </p>
          <div className="akten preismuster">
            {b.preislogik.muster.map((m) => (
              <Akte key={m.name} titel={<Inline text={m.name} />} titelEbene={3} text={<Inline text={m.beschreibung} />}>
                <p className="preismuster__beispiel">
                  <span className="preismuster__label">{abschnitte.preismusterBeispiel}</span> {m.beispiel}
                </p>
                <p className="preismuster__vorsicht">
                  <span className="preismuster__vorsichtLabel">{abschnitte.preismusterVorsicht}</span>
                  <Inline text={m.vorsicht} />
                </p>
              </Akte>
            ))}
          </div>
        </Abschnitt>

        <Abschnitt nummer={4} id="fehler" titel={abschnitte.fehler}>
          <div className="akten">
            {b.fehler.map((f) => (
              <Akte key={f.titel} ton="warn" titel={<Inline text={f.titel} />} text={<Inline text={f.text} />} />
            ))}
          </div>
        </Abschnitt>

        <Abschnitt nummer={5} id="faq" titel={abschnitte.faq}>
          <div className="akkordeon-liste">
            {b.faq.map((f, i) => (
              <Akkordeon key={f.frage} frage={<Inline text={f.frage} />} id={`${b.slug}-frage-${i + 1}`}>
                <p>
                  <Inline text={f.antwort} />
                </p>
              </Akkordeon>
            ))}
          </div>
          <JsonLd daten={faqSeite(b.faq)} />
        </Abschnitt>

        <Abschnitt nummer={6} id="leitfaeden" titel={abschnitte.leitfaeden}>
          <LeitfadenRegister slugs={b.leitfaeden} beschriftung={abschnitte.leitfaeden} />
        </Abschnitt>

        <Abschnitt nummer={7} id="checklisten" titel={abschnitte.checklisten}>
          <ChecklistenAkten slugs={b.checklisten} />
        </Abschnitt>

        <Abschnitt nummer={8} id="stationen" titel={abschnitte.stationen}>
          <StationenMarken stationen={b.stationen} verlinkt />
        </Abschnitt>
      </div>
    </>
  );
}
