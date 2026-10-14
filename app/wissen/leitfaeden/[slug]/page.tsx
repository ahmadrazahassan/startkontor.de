import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtikelBloecke } from "@/components/artikel-bloecke";
import { ArtikelBild } from "@/components/artikel-bild";
import { ArtikelKarte } from "@/components/artikel-karte";
import { SoftwareKarte } from "@/components/software-karte";
import { SoftwareEntscheidung } from "@/components/software-entscheidung";
import { Icon } from "@/components/icons";
import { Brotkrumen } from "@/components/brotkrumen";
import { H1 } from "@/components/h1";
import { StationenMarken } from "@/components/chips";
import { Inhaltsverzeichnis } from "@/components/inhaltsverzeichnis";
import { Inline } from "@/components/inline";
import { JsonLd } from "@/components/json-ld";
import { anbieterNachSlug, fristNachId, getBaustein, getLeitfaden, leitfaeden, navigation, seiten, ui } from "@/lib/daten";
import { parseDeutschesDatum } from "@/lib/datum";
import { artikel } from "@/lib/jsonld";
import { metaFuer } from "@/lib/seo";
import { eindeutigeSlugs } from "@/lib/slug";
import { inlineZuText } from "@/lib/inline";
import { softwareKarte, softwareKarteTexte } from "@/lib/software-ansicht";
import artikelbilder from "@/data/artikelbilder.json";
import { absolut } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return leitfaeden.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const l = leitfaeden.find((x) => x.slug === slug);
  if (!l) return {};
  const metadata = metaFuer({
    seo: l.seo,
    pfad: `/wissen/leitfaeden/${l.slug}`,
    typ: "article",
    geaendert: parseDeutschesDatum(l.rechtsstand) ?? undefined,
  });
  const bild = (artikelbilder as Record<string, { datei: string; breite: number; hoehe: number; alt: string }>)[slug];
  if (bild) {
    metadata.openGraph = { ...metadata.openGraph, images: [{ url: absolut(bild.datei), width: bild.breite, height: bild.hoehe, alt: bild.alt }] };
    metadata.twitter = { ...metadata.twitter, images: [absolut(bild.datei)] };
  }
  return metadata;
}

const t = ui.abschnitte.leitfaden;

export default async function LeitfadenSeite({ params }: Props) {
  const { slug } = await params;
  const l = leitfaeden.find((x) => x.slug === slug);
  if (!l) notFound();

  const baustein = getBaustein(l.baustein);

  const titelIndizes = l.bloecke.flatMap((b, i) => (b.typ === "zwischentitel" ? [i] : []));
  const slugs = eindeutigeSlugs(titelIndizes.map((i) => inlineZuText((l.bloecke[i] as { text: string }).text)));
  const ids = new Map(
    titelIndizes.map((blockIndex, n) => [blockIndex, { id: slugs[n], nummer: String(n + 1).padStart(2, "0") }]),
  );
  const verzeichnis = titelIndizes.map((blockIndex, n) => ({
    id: slugs[n],
    titel: inlineZuText((l.bloecke[blockIndex] as { text: string }).text),
    nummer: String(n + 1).padStart(2, "0"),
  }));

  return (
    <>
      <Brotkrumen
        punkte={[
          { label: navigation.kopfzeile[3].label, href: "/wissen" },
          { label: seiten.leitfaeden.eyebrow, href: "/wissen/leitfaeden" },
          { label: inlineZuText(l.titel) },
        ]}
      />
      <JsonLd daten={{ ...artikel(l), image: absolut(`/bilder/artikel/${l.slug}.png`) }} />

      <article>
        <header className="seitenkopf huelle artikelkopf artikelkopf_bebildert">
          <div className="artikelkopf__text">
          <p className="eyebrow seitenkopf__eyebrow">
            <Link href={`/bausteine/${baustein.slug}`}>{baustein.name}</Link>
          </p>
          <H1 text={l.titel}>
            <Inline text={l.titel} />
          </H1>
          <p className="seitenkopf__lead">
            <Inline text={l.untertitel} />
          </p>
          <ul className="artikelmeta liste_ohne">
            <li>
              <span className="artikelmeta__label">{ui.labels.lesezeit}</span> {l.lesezeit} {ui.labels.minuten}
            </li>
            <li>
              <span className="artikelmeta__label">{ui.labels.rechtsstand}</span> <time dateTime={parseDeutschesDatum(l.rechtsstand) ?? undefined}>{l.rechtsstand}</time>
            </li>
            <li>
              <StationenMarken stationen={l.stationen} verlinkt />
            </li>
          </ul>
          </div>
          <ArtikelBild slug={l.slug} prioritaet className="artikelkopf__bild" sizes="(min-width: 1024px) 500px, 100vw" />
        </header>

        <div className="huelle inhaltsraster artikelraster">
          <aside className="inhaltsraster__rail sticky_rail">
            <Inhaltsverzeichnis punkte={verzeichnis} titel={ui.labels.inhaltsverzeichnis} />
            <div className="artikelsoftwarehilfe"><p>Software zum Thema</p><Link href={`/anbieter?baustein=${l.baustein}`} className="textlink">{baustein.kurzname} entdecken<Icon name="arrowRight" groesse={16} /></Link><Link href="/planer">Auswahlhilfe starten</Link></div>
          </aside>

          <div className="artikel">
            <section className="kernaussagen" aria-labelledby="kernaussagen-titel">
              <h2 id="kernaussagen-titel" className="kernaussagen__titel">
                {ui.labels.wichtigstesInKuerze}
              </h2>
              <ul className="kernaussagen__liste">
                {l.kernaussagen.map((k) => (
                  <li key={k}>
                    <Inline text={k} />
                  </li>
                ))}
              </ul>
            </section>

            <ArtikelBloecke bloecke={l.bloecke} ids={ids} />

            {l.verwandt.anbieter.length > 0 ? <section className="artikelsoftware" aria-labelledby="artikelsoftware-titel"><div className="portalabschnittkopf"><div><p className="eyebrow">Vom Wissen zur Auswahl</p><h2 id="artikelsoftware-titel">Software zum Thema entdecken</h2><p>Programme aus diesem Ratgeber. Prüfen Sie im Profil, welche Funktionen und Grenzen zu Ihrem Bedarf passen.</p></div><Link href={`/anbieter?baustein=${l.baustein}`} className="textlink">Weitere Programme<Icon name="arrowRight" groesse={16} /></Link></div><div className="artikelsoftware__karten">{l.verwandt.anbieter.slice(0, 3).map((softwareSlug) => { const a = anbieterNachSlug.get(softwareSlug); return a ? <SoftwareKarte key={a.slug} karte={softwareKarte(a, `ratgeber-${l.slug}`)} texte={softwareKarteTexte} /> : null; })}</div></section> : <SoftwareEntscheidung />}

            <footer className="artikelfuss">
              <p className="rechtshinweis">
                <Inline text={l.rechtshinweis} />
              </p>

              <section aria-labelledby="quellen-titel" className="artikelfuss__block">
                <h2 id="quellen-titel" className="artikelfuss__titel">
                  {ui.labels.quellen}
                </h2>
                <ul className="quellenliste">
                  {l.quellen.map((q) => (
                    <li key={q.url}>
                      <span className="quellenliste__titel">{q.titel}</span>
                      <a href={q.url} target="_blank" rel="noopener noreferrer" className="adresse quellenliste__url">
                        {q.url}
                        <span className="visuell_versteckt"> ({ui.barrierefreiheit.externLink})</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>

              <section aria-labelledby="verwandt-titel" className="artikelfuss__block">
                <h2 id="verwandt-titel" className="artikelfuss__titel">
                  {t.verwandt}
                </h2>
                <div className="verwandt">
                  {l.verwandt.anbieter.length > 0 ? (
                    <div>
                      <h3 className="verwandt__titel">{t.verwandtAnbieter}</h3>
                      <ul className="verwandt__liste liste_ohne">
                        {l.verwandt.anbieter.map((slugAnbieter) => {
                          const a = anbieterNachSlug.get(slugAnbieter);
                          return a ? (
                            <li key={a.slug}>
                              <Link href={a.url}>{a.name}</Link>
                            </li>
                          ) : null;
                        })}
                      </ul>
                    </div>
                  ) : null}
                  {l.verwandt.leitfaeden.length > 0 ? (
                    <div>
                      <h3 className="verwandt__titel">{t.verwandtLeitfaeden}</h3>
                      <ul className="verwandt__liste liste_ohne">
                        {l.verwandt.leitfaeden.map((s) => {
                          const x = getLeitfaden(s);
                          return (
                            <li key={s}>
                              <Link href={`/wissen/leitfaeden/${s}`}>
                                <Inline text={x.titel} />
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ) : null}
                  {l.verwandt.fristen.length > 0 ? (
                    <div>
                      <h3 className="verwandt__titel">{t.verwandtFristen}</h3>
                      <ul className="verwandt__liste liste_ohne">
                        {l.verwandt.fristen.map((id) => {
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
              </section>
            </footer>
            {l.verwandt.leitfaeden.length > 0 ? <section className="artikelweiter" aria-labelledby="artikelweiter-titel"><h2 id="artikelweiter-titel">Das könnte Sie auch interessieren</h2><div className="artikelkarten artikelkarten_zwei">{l.verwandt.leitfaeden.slice(0, 2).map((weiterSlug) => <ArtikelKarte key={weiterSlug} artikel={getLeitfaden(weiterSlug)} />)}</div></section> : null}
          </div>
        </div>
      </article>
    </>
  );
}
