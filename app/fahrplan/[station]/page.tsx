import type { Metadata } from "next";
import { H1 } from "@/components/h1";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Abschnitt } from "@/components/abschnitt";
import { Akte } from "@/components/akte";
import { Bild } from "@/components/bild";
import { Brotkrumen } from "@/components/brotkrumen";
import { StatusChip } from "@/components/chips";
import { Icon } from "@/components/icons";
import { Inline } from "@/components/inline";
import { wlStil } from "@/components/wort-stil";
import { KnopfLink } from "@/components/knopf";
import { Strecke } from "@/components/strecke";
import { AnbieterZeilen, ChecklistenAkten, FristenKompaktListe, LeitfadenRegister, StatusLegende } from "@/components/verweise";
import {
  anbieterFuerStation,
  bausteine,
  getBaustein,
  getStation,
  navigation,
  stationen,
  ui,
} from "@/lib/daten";
import { metaFuer } from "@/lib/seo";

type Props = { params: Promise<{ station: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return stationen.map((s) => ({ station: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { station } = await params;
  const s = stationen.find((x) => x.slug === station);
  if (!s) return {};
  return metaFuer({ seo: s.seo, pfad: `/fahrplan/${s.slug}` });
}

const abschnitte = ui.abschnitte.station;

export default async function StationSeite({ params }: Props) {
  const { station: slug } = await params;
  const s = stationen.find((x) => x.slug === slug);
  if (!s) notFound();

  const vorherige = s.vorherige ? getStation(s.vorherige) : null;
  const naechste = s.naechste ? getStation(s.naechste) : null;
  const anbieterListe = anbieterFuerStation(s.slug);

  return (
    <>
      <Brotkrumen punkte={[{ label: navigation.kopfzeile[0].label, href: "/fahrplan" }, { label: s.name }]} />

      <header className="seitenkopf huelle stationskopf">
        <div className="stationskopf__text">
          <span className="stationskopf__ziffer" data-ziffer={s.nummer} aria-hidden="true" />
          <p className="eyebrow seitenkopf__eyebrow">
            {ui.barrierefreiheit.stationNummer.replace("{nummer}", String(s.nummer))}
          </p>
          <H1 text={s.name} />
          <p className="seitenkopf__lead">
            <Inline text={s.untertitel} />
          </p>
        </div>
        <div className="stationskopf__bild">
          <Bild id={s.bild} nummer={s.nummer} halt={s.nummer} versatz prioritaet sizes="(min-width: 1280px) 520px, (min-width: 1024px) 42vw, 92vw" />
        </div>
      </header>

      <div className="huelle stationsstrecke">
        <Strecke
          beschriftung={navigation.kopfzeile[0].label}
          halte={stationen.map((x) => ({
            schluessel: x.slug,
            nummer: x.nummer,
            titel: x.name,
            text: x.untertitel,
            href: `/fahrplan/${x.slug}`,
            zustand: x.nummer < s.nummer ? ("passiert" as const) : x.nummer === s.nummer ? ("aktuell" as const) : ("kommend" as const),
            lesetext:
              x.slug === s.slug ? ui.barrierefreiheit.aktuelleSeite : `${ui.labels.station} ${x.nummer}`,
          }))}
        />
      </div>

      <div className="huelle stationstext">
        {s.einleitung.map((absatz, i) => (
          <p key={i} className={i === 0 ? "lead" : undefined}>
            <Inline text={absatz} />
          </p>
        ))}
      </div>

      <div className="huelle">
        <Abschnitt nummer={1} id="kennzeichen" titel={abschnitte.kennzeichen}>
          <ul className="kennzeichen">
            {s.kennzeichen.map((k) => (
              <li key={k}>
                <Inline text={k} />
              </li>
            ))}
          </ul>
          <p className="stationsteaser">
            <Inline text={s.teaser} />
          </p>
        </Abschnitt>

        <Abschnitt nummer={2} id="aufgaben" titel={abschnitte.prioritaeten}>
          <ol className="prioritaeten">
            {s.prioritaeten.map((p, i) => {
              const b = getBaustein(p.baustein);
              return (
                <li key={p.titel} className="prioritaet">
                  <span className="prioritaet__nummer" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div className="prioritaet__inhalt">
                    <h3 className="prioritaet__titel" style={wlStil(p.titel)}>
                      <Inline text={p.titel} />
                    </h3>
                    <p>
                      <Inline text={p.text} />
                    </p>
                    <p className="prioritaet__baustein">
                      <span className="prioritaet__label">{abschnitte.prioritaetBaustein}</span>
                      <Link href={`/bausteine/${b.slug}`} className="bausteinmarke">
                        {b.name}
                        <Icon name="arrowRight" groesse={16} />
                      </Link>
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </Abschnitt>

        <Abschnitt nummer={3} id="bausteine" titel={abschnitte.bausteine}>
          <ul className="bausteinstatus">
            {bausteine.map((b) => {
              const z = s.bausteine[b.slug];
              return (
                <li key={b.slug} id={b.slug} className="bausteinstatus__zeile sprung_ziel">
                  <div className="bausteinstatus__status">
                    <StatusChip status={z.status} mitKurz />
                  </div>
                  <h3 className="bausteinstatus__name">
                    <Link href={`/bausteine/${b.slug}`}>{b.name}</Link>
                  </h3>
                  <p className="bausteinstatus__grund">
                    <Inline text={z.grund} />
                  </p>
                </li>
              );
            })}
          </ul>
          <StatusLegende />
        </Abschnitt>

        <Abschnitt nummer={4} id="fehler" titel={abschnitte.fehler}>
          <div className="akten akten_zwei">
            {s.fehler.map((f) => (
              <Akte key={f.titel} ton="warn" titel={<Inline text={f.titel} />} titelEbene={3} text={<Inline text={f.text} />} />
            ))}
          </div>
        </Abschnitt>

        <Abschnitt nummer={5} id="fragen" titel={abschnitte.fragen}>
          <ol className="fragenliste">
            {s.fragen.map((f, i) => (
              <li key={f}>
                <span className="fragenliste__nummer" data-ziffer={String(i + 1).padStart(2, "0")} aria-hidden="true" />
                <span>
                  <Inline text={f} />
                </span>
              </li>
            ))}
          </ol>
        </Abschnitt>

        <Abschnitt nummer={6} id="fristen" titel={abschnitte.fristen}>
          <FristenKompaktListe ids={s.fristen} />
        </Abschnitt>

        <Abschnitt nummer={7} id="leitfaeden" titel={abschnitte.leitfaeden}>
          <LeitfadenRegister slugs={s.leitfaeden} beschriftung={abschnitte.leitfaeden} />
        </Abschnitt>

        <Abschnitt nummer={8} id="checklisten" titel={abschnitte.checklisten}>
          <ChecklistenAkten slugs={s.checklisten} />
        </Abschnitt>

        <Abschnitt nummer={9} id="anbieter" titel={abschnitte.anbieter}>
          <AnbieterZeilen liste={anbieterListe} hinweis />
        </Abschnitt>
      </div>

      <section className="band band_nebel stationsnavigation" aria-labelledby="weiter-titel">
        <div className="huelle">
          <h2 id="weiter-titel" className="abschnittstitel">
            {abschnitte.weiter}
          </h2>
          <div className="stationsnavigation__raster">
            {vorherige ? (
              <Link href={`/fahrplan/${vorherige.slug}`} className="stationswechsel stationswechsel_zurueck">
                <Icon name="arrowLeft" groesse={22} />
                <span className="stationswechsel__text">
                  <span className="stationswechsel__label">{ui.knoepfe.vorherigeStation}</span>
                  <span className="stationswechsel__name">
                    {vorherige.nummer} {vorherige.name}
                  </span>
                </span>
              </Link>
            ) : (
              <span />
            )}
            {naechste ? (
              <Link href={`/fahrplan/${naechste.slug}`} className="stationswechsel stationswechsel_weiter">
                <span className="stationswechsel__text">
                  <span className="stationswechsel__label">{ui.knoepfe.naechsteStation}</span>
                  <span className="stationswechsel__name">
                    {naechste.nummer} {naechste.name}
                  </span>
                </span>
                <Icon name="arrowRight" groesse={22} />
              </Link>
            ) : (
              <KnopfLink href="/planer" variante="primaer" icon="arrowRight">
                {navigation.kopfzeileAktion.label}
              </KnopfLink>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
