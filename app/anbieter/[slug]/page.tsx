import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Akkordeon } from "@/components/akkordeon";
import { Bewertungsanzeige, Kriterienbalken, Sterne } from "@/components/bewertung";
import { Brotkrumen } from "@/components/brotkrumen";
import { Chip, StationenMarken } from "@/components/chips";
import { H1 } from "@/components/h1";
import { Icon } from "@/components/icons";
import { Inline } from "@/components/inline";
import { JsonLd } from "@/components/json-ld";
import { KnopfLink } from "@/components/knopf";
import { Produktnavigation } from "@/components/produkt-navigation";
import type { Produktpunkt } from "@/components/produkt-navigation";
import { PreisTarife } from "@/components/preis-tarife";
import { SoftwareGrafiken } from "@/components/software-grafiken";
import { TarifFallback } from "@/components/tarif-fallback";
import { SoftwareKarte } from "@/components/software-karte";
import { SoftwareMedienGalerie } from "@/components/software-medien";
import { AuswahlhilfeKarte } from "@/components/auswahlhilfe-karte";
import { Werbebanner } from "@/components/werbebanner";
import { wlStil } from "@/components/wort-stil";
import { einstiegsstufe, transparenzwert } from "@/lib/analyse";
import { preisPositionFuer, tarifeFuer } from "@/lib/analyse-daten";
import { holeLogo } from "@/lib/bilder";
import {
  anbieter,
  anbieterFuerBaustein,
  bausteine,
  bewertungen,
  getBaustein,
  getStation,
  hersteller,
  leitfaedenFuerAnbieter,
  navigation,
  partner,
  startseite,
  softwareReviews,
  stationen as alleStationenListe,
  ui,
} from "@/lib/daten";
import { formatiereIso } from "@/lib/datum";
import { faqSeite } from "@/lib/jsonld";
import { nbsp } from "@/lib/nbsp";
import { linkFuer } from "@/lib/partner";
import { datenzeilen, erzeugeFaq, fuelle, istPreiszeile } from "@/lib/produkt";
import { metaFuer } from "@/lib/seo";
import { softwareKarteTexte, softwareKarte } from "@/lib/software-ansicht";
import { softwareMedien } from "@/lib/software-medien";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return anbieter.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = anbieter.find((x) => x.slug === slug);
  if (!a) return {};
  const baustein = getBaustein(a.baustein);
  return metaFuer({
    seo: {
      titel: `${a.name}: Preise, Funktionen und Einschätzung`,
      beschreibung: `${a.kurz} Softwareprofil mit Herstellerangaben, Grenzen, Fragen für den Termin und Einschätzung der Redaktion. ${baustein.name}.`.slice(0, 300),
    },
    pfad: a.url,
  });
}

const t = ui.abschnitte.anbieter;
const r = startseite.review;

function Block({ id, titel, text, children }: { id: string; titel: string; text?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="produktblock" aria-labelledby={`${id}-titel`}>
      <header className="produktblock__kopf">
        <h2 id={`${id}-titel`} style={wlStil(titel)}>
          {titel}
        </h2>
        {text ? <p className="produktblock__text">{text}</p> : null}
      </header>
      {children}
    </section>
  );
}

export default async function Review({ params }: Props) {
  const { slug } = await params;
  const a = anbieter.find((x) => x.slug === slug);
  if (!a) notFound();

  const baustein = getBaustein(a.baustein);
  const logo = holeLogo(a.slug);
  const bewertung = bewertungen.get(a.slug);
  const profil = hersteller.get(a.slug);
  const analyse = softwareReviews.get(a.slug);
  const medien = softwareMedien.get(a.slug);
  const verwandteLeitfaeden = leitfaedenFuerAnbieter(a.slug);
  const alternativen = anbieterFuerBaustein(a.baustein).filter((x) => x.slug !== a.slug);
  const stationen = a.stationen.map(getStation);
  const tarife = tarifeFuer(a.slug);
  const transparenz = transparenzwert({ ...a, herstellerprofil: Boolean(profil), analyse: Boolean(analyse) });
  const kategorienNamen = Object.fromEntries(bausteine.map((b) => [b.slug, b.kurzname]));
  const f = (vorlage: string) => fuelle(vorlage, { name: a.name, kategorie: baustein.name });

  const linkKopf = linkFuer(a, `profil-${a.slug}-kopf`, partner);
  const linkRand = linkFuer(a, `profil-${a.slug}-rand`, partner);
  const linkPreise = linkFuer(a, `profil-${a.slug}-preise`, partner);
  const linkLeiste = linkFuer(a, `profil-${a.slug}-leiste`, partner);
  const ziel = (l: { werbung: boolean }) => (l.werbung ? ui.knoepfe.zumAnbieter : ui.knoepfe.zumAnbieterNeutral);

  const preisStatusText =
    a.preis.status === "veroeffentlicht"
      ? ui.anbieterFilter.preisOptionen[1]
      : a.preis.status === "anfrage"
        ? ui.labels.preisAufAnfrage
        : ui.labels.preisNichtVerifiziert;
  const preisKurz = a.preis.status === "veroeffentlicht" && a.preis.anker ? a.preis.anker : preisStatusText;

  const zeilen = datenzeilen(a, {
    kategorie: baustein.name,
    stationen: stationen.map((s) => ({ nummer: s.nummer, name: s.name })),
    stationLabel: ui.labels.station,
    preisStatusText,
    hersteller: profil,
    t: r.daten,
  });
  const datenTabelle = zeilen.filter((z) => z.schluessel !== "unternehmen" && z.schluessel !== "standort" && z.schluessel !== "geprueft");
  const kuendbarText = zeilen.find((z) => z.schluessel === "kuendbar")?.wert ?? r.daten.offen;
  const websiteText = zeilen.find((z) => z.schluessel === "website")?.wert ?? a.zielUrl;

  const faq = erzeugeFaq(a, {
    kategorie: baustein.name,
    alternativen: alternativen.map((x) => x.name),
    nettoHinweis: ui.labels.nettoHinweis,
    keinEigenerTest: ui.labels.keinEigenerTest,
    t: r.faq,
  });

  const preisNotizen = (a.preis.zeilen ?? []).filter((z) => !istPreiszeile(z));

  const quelleDatum = (
    <span className="quellenzeit">
      {ui.labels.quellenZeitpunkt} {nbsp(a.geprueft)}
    </span>
  );

  const punkte: Produktpunkt[] = [
    { id: "ueberblick", titel: r.tabs.ueberblick },
    { id: "grafiken", titel: "Grafiken" },
    ...(medien ? [{ id: "einblicke", titel: medien.video ? "Bilder & Video" : "Bilder" }] : []),
    ...(analyse ? [{ id: "analyse", titel: "Analyse" }] : []),
    { id: "funktionen", titel: r.tabs.funktionen },
    { id: "preise", titel: r.tabs.preise },
    { id: "eignung", titel: r.tabs.eignung },
    { id: "grenzen", titel: r.tabs.grenzen },
    { id: "daten", titel: r.tabs.daten },
    ...(alternativen.length > 0 ? [{ id: "alternativen", titel: r.tabs.alternativen }] : []),
    { id: "faq", titel: r.tabs.faq },
    { id: "quellen", titel: r.tabs.quellen },
  ];

  return (
    <>
      <JsonLd daten={faqSeite(faq.map((p) => ({ frage: p.frage, antwort: p.antwort.join(" ") })))} />
      <Brotkrumen punkte={[{ label: navigation.kopfzeile[2].label, href: "/anbieter" }, { label: a.name }]} />

      <div className="produktseite">
        {/* Kopf: Logo, Name, Kurzbeschreibung, Aktionen */}
        <header className="produktkopf">
          <div className="huelle produktkopf__innen">
            <div className="produktkopf__logo" aria-hidden={logo ? undefined : true}>
              {logo ? (
                // Unverändertes Herstellerlogo, nur zur Identifikation.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo.src} alt="" width={Math.max(1, Math.round((72 * logo.breite) / logo.hoehe))} height={72} />
              ) : (
                <span className="produktkopf__initial">{a.name.charAt(0)}</span>
              )}
            </div>

            <div className="produktkopf__text">
              <p className="eyebrow">
                {r.label}
                {" · "}
                <Link href={`/bausteine/${baustein.slug}`}>{baustein.name}</Link>
              </p>
              <H1 text={a.name} className="produktkopf__h1" />
            <div className="produktkopf__aktionen">
              <KnopfLink href={linkKopf.href} extern werbung={linkKopf.werbung} icon="external">
                {ziel(linkKopf)}
              </KnopfLink>
              <KnopfLink href="#preise" variante="sekundaer">
                Preise ansehen
              </KnopfLink>
            </div>
            </div>
            <div className="produktkopf__zusammenfassung">
              <p className="produktkopf__preislabel">{r.kopf.preis}</p>
              <p className="produktkopf__preis">{nbsp(preisKurz)}</p>
              {bewertung ? <Bewertungsanzeige wert={bewertung.gesamt} von={r.von} groesse="klein" /> : null}
              <a href="#grafiken" className="produktkopf__transparenz" aria-label={`Transparenzwert ${transparenz.gesamt.toLocaleString("de-DE", { minimumFractionDigits: 1 })} von 5, zu den Grafiken`}>
                <span>Transparenzwert</span>
                <Sterne wert={transparenz.gesamt} groesse={13} />
                <strong>{transparenz.gesamt.toLocaleString("de-DE", { minimumFractionDigits: 1 })}</strong>
              </a>
            </div>
          </div>
          {linkKopf.werbung ? <p className="produktkopf__affiliatehinweis">Affiliatehinweis: Wenn Sie über einen gekennzeichneten Link ein Angebot nutzen, können wir eine Provision erhalten. <Link href="/redaktion/werbung">Mehr zur Finanzierung</Link></p> : null}
        </header>

        <Produktnavigation punkte={punkte} beschriftung={r.sprung} />

        <div className="huelle produktraster">
          <div className="produkthaupt">
            {/* 1. Überblick */}
            <Block id="ueberblick" titel={f(r.ueberblickTitel)}>
              <p className="lead produktblock__lead">
                <Inline text={a.kurz} />
              </p>
              <dl className="faktenkacheln">
                <div className="faktenkachel">
                  <dt>{r.kopf.preis}</dt>
                  <dd>{nbsp(preisKurz)}</dd>
                </div>
                <div className="faktenkachel">
                  <dt>{r.kopf.kuendbar}</dt>
                  <dd>{kuendbarText}</dd>
                </div>
                <div className="faktenkachel">
                  <dt>{r.kopf.kategorie}</dt>
                  <dd>
                    <Link href={`/bausteine/${baustein.slug}`}>{baustein.name}</Link>
                  </dd>
                </div>
                <div className="faktenkachel">
                  <dt>{t.stationen}</dt>
                  <dd>
                    <StationenMarken stationen={a.stationen} verlinkt />
                  </dd>
                </div>
              </dl>

              <div className="einschaetzung">
                <p className="einschaetzung__abzeichen">{r.fazit}</p>
                <p className="einschaetzung__text">
                  <Inline text={a.einordnung} />
                </p>
                <p className="einschaetzung__hinweis">{ui.labels.keinEigenerTest}</p>
              </div>
            </Block>

            <Block id="grafiken" titel={`${a.name} in Grafiken`} text="Aus den belegten Angaben dieses Profils berechnet. Es ist kein eigener Test und keine Qualitätsnote.">
              <SoftwareGrafiken
                anbieter={a}
                transparenz={transparenz}
                tarife={tarife}
                position={preisPositionFuer(a.slug)}
                kategorien={kategorienNamen}
                alleStationen={alleStationenListe.map((st) => ({ slug: st.slug, nummer: st.nummer, name: st.name }))}
              />
            </Block>

            {medien ? <Block id="einblicke" titel={medien.video ? "Bilder und Produktvideo" : "Einblicke in die Software"} text="Sehen Sie sich die Benutzeroberfläche und ausgewählte Arbeitsabläufe an."><SoftwareMedienGalerie name={a.name} medien={medien} /></Block> : null}

            {analyse ? <Block id="analyse" titel={`Unsere Analyse von ${a.name}`} text={analyse.methodik}>
              <div className="softwareanalyse__markt"><Icon name="check" groesse={18} /><span>{analyse.deutschland.text}</span><a href={analyse.deutschland.quelle} target="_blank" rel="noopener noreferrer">Herstellerquelle<Icon name="external" groesse={14} /></a></div>
              <div className="softwareanalyse">{analyse.abschnitte.map((abschnitt) => <section key={abschnitt.id} aria-labelledby={`analyse-${abschnitt.id}`}><h3 id={`analyse-${abschnitt.id}`}>{abschnitt.titel}</h3>{abschnitt.absaetze.map((absatz, index) => <p key={index}><Inline text={absatz} /></p>)}<p className="softwareanalyse__quellen">Quellen: {abschnitt.quellen.map((index, n) => { const q = a.quellen[index]; return q ? <span key={index}>{n > 0 ? " · " : ""}<a href={q.url} target="_blank" rel="noopener noreferrer">{q.titel}</a></span> : null; })}</p></section>)}</div>
            </Block> : null}

            {/* 2. Funktionen */}
            <Block id="funktionen" titel={f(r.funktionenTitel)} text={r.funktionenText}>
              <div className="herkunft">
                <Chip ton="nebel">{ui.labels.herstellerangabe}</Chip>
              </div>
              <ul className="funktionsliste liste_ohne">
                {a.funktionen.map((x) => (
                  <li key={x} className="funktionsliste__punkt">
                    <Icon name="check" groesse={20} />
                    <span>
                      <Inline text={x} />
                    </span>
                  </li>
                ))}
              </ul>
            </Block>

            {/* 3. Preise */}
            <section id="preise" className="produktblock tp band_nacht" aria-labelledby="preise-titel">
              <header className="tp-kopf">
                <p className="tp-eyebrow"><Icon name="plus" groesse={14} />Preise</p>
                <h2 id="preise-titel" className="tp-titel">
                  <span>{tarife ? `Tarife von ${a.name},` : `Preise von ${a.name},`}</span>
                  <span>{tarife ? "klar aufgeschlüsselt." : "auf einen Blick."}</span>
                </h2>
              </header>

              {tarife ? (
                <PreisTarife name={a.name} stufen={tarife.stufen} einheit={tarife.einheit} hervorgehoben={einstiegsstufe(tarife.stufen, a.preis.anker).name} cta={{ href: linkPreise.href, werbung: linkPreise.werbung, label: ziel(linkPreise) }} />
              ) : (
                <TarifFallback name={a.name} status={a.preis.status} statusText={preisStatusText} anker={a.preis.anker} zeilen={a.preis.zeilen ?? []} cta={{ href: linkPreise.href, werbung: linkPreise.werbung, label: ziel(linkPreise) }} />
              )}

              <div className="tp-fuss">
                <p>
                  <Chip ton="nebel">{ui.labels.herstellerangabe}</Chip>{" "}
                  {quelleDatum}
                  {": "}
                  <a href={a.quellen[0]?.url ?? a.zielUrl} target="_blank" rel="noopener noreferrer">
                    {a.quellen[0]?.titel ?? t.herstellerseite}
                    <span className="visuell_versteckt"> ({ui.barrierefreiheit.externLink})</span>
                  </a>
                </p>
                {tarife && preisNotizen.length > 0 ? (
                  <ul className="tp-fuss__notizen">
                    {preisNotizen.map((z) => (
                      <li key={z}>
                        <Inline text={z} />
                      </li>
                    ))}
                  </ul>
                ) : null}
                {a.preis.hinweis ? (
                  <p>
                    <Inline text={a.preis.hinweis} />
                  </p>
                ) : null}
                {a.preis.status === "veroeffentlicht" && !preisNotizen.some((z) => /netto|Umsatzsteuer/i.test(z)) ? <p>{ui.labels.nettoHinweis}</p> : null}
              </div>
            </section>

            <Werbebanner platzierung={{ art: "anbieterakte", anbieter: a }} kennung={`profil-${a.slug}`} />

            {/* 4. Eignung */}
            <Block id="eignung" titel={f(r.eignungTitel)}>
              <div className="eignungskarten">
                <div className="eignungskarte eignungskarte_ja">
                  <h3 className="eignungskarte__titel">
                    <Icon name="check" groesse={22} />
                    {r.geeignet}
                  </h3>
                  <ul className="eignungskarte__liste liste_ohne">
                    {a.fuerWen.map((x) => (
                      <li key={x}>
                        <Inline text={x} />
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="eignungskarte eignungskarte_nein">
                  <h3 className="eignungskarte__titel">
                    <Icon name="warning" groesse={22} />
                    {r.wenigerGeeignet}
                  </h3>
                  <ul className="eignungskarte__liste liste_ohne">
                    {a.wenigerPassend.map((x) => (
                      <li key={x}>
                        <Inline text={x} />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Block>

            {/* 5. Grenzen */}
            <Block id="grenzen" titel={f(r.grenzenTitel)} text={r.grenzenText}>
              <ul className="grenzenliste liste_ohne">
                {a.grenzen.map((x) => (
                  <li key={x} className="grenzenliste__punkt">
                    <Icon name="warning" groesse={20} />
                    <span>
                      <Inline text={x} />
                    </span>
                  </li>
                ))}
              </ul>
            </Block>

            {/* 6. Vertrag */}
            {a.vertrag ? (
              <Block id="vertrag" titel={r.vertragTitel}>
                <div className="vertragskarte">
                  {a.monatlichKuendbar === true ? <Chip ton="ok">{ui.anbieterFilter.vertrag}</Chip> : null}
                  <p>
                    <Inline text={a.vertrag} />
                  </p>
                </div>
              </Block>
            ) : null}

            {/* 7. Daten auf einen Blick */}
            <Block id="daten" titel={f(r.datenTitel)} text={r.datenText}>
              <dl className="datentabelle">
                {datenTabelle.map((z) => (
                  <div key={z.schluessel} className="datentabelle__zeile">
                    <dt>{z.label}</dt>
                    <dd>
                      {z.link ? (
                        <a href={z.link} target="_blank" rel="noopener noreferrer" className="adresse">
                          {z.wert}
                          <span className="visuell_versteckt"> ({ui.barrierefreiheit.externLink})</span>
                        </a>
                      ) : (
                        nbsp(z.wert)
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </Block>

            {/* 8. Hersteller */}
            <Block id="hersteller" titel={r.herstellerTitel} text={profil ? f(r.herstellerText) : undefined}>
              {profil ? (
                <dl className="datentabelle">
                  <div className="datentabelle__zeile">
                    <dt>{r.daten.unternehmen}</dt>
                    <dd>{profil.unternehmen}</dd>
                  </div>
                  <div className="datentabelle__zeile">
                    <dt>{r.daten.standort}</dt>
                    <dd>
                      {profil.ort}, {profil.land}
                    </dd>
                  </div>
                  <div className="datentabelle__zeile">
                    <dt>{r.daten.website}</dt>
                    <dd>
                      <a href={a.zielUrl} target="_blank" rel="noopener noreferrer" className="adresse">
                        {websiteText}
                        <span className="visuell_versteckt"> ({ui.barrierefreiheit.externLink})</span>
                      </a>
                    </dd>
                  </div>
                  <div className="datentabelle__zeile">
                    <dt>{r.herstellerQuelle}</dt>
                    <dd>
                      <a href={profil.quelle.url} target="_blank" rel="noopener noreferrer" className="adresse">
                        {profil.quelle.titel}
                        <span className="visuell_versteckt"> ({ui.barrierefreiheit.externLink})</span>
                      </a>
                      <span className="datentabelle__klein">
                        {ui.labels.quellenZeitpunkt} {nbsp(formatiereIso(profil.geprueft))}
                      </span>
                    </dd>
                  </div>
                </dl>
              ) : analyse ? (
                <div className="fliesstext"><p>{analyse.deutschland.text}</p><p><a href={a.zielUrl} target="_blank" rel="noopener noreferrer" className="adresse">Zur offiziellen Website von {a.name}<span className="visuell_versteckt"> ({ui.barrierefreiheit.externLink})</span></a></p></div>
              ) : (
                <p>{f(r.herstellerLeer)}</p>
              )}

              <aside className="claimkarte" aria-label={r.claim.titel}>
                <div>
                  <h3 className="claimkarte__titel">{r.claim.titel}</h3>
                  <p>{r.claim.text}</p>
                </div>
                <KnopfLink href="/kontakt" variante="sekundaer" icon="arrowRight">
                  {r.claim.cta}
                </KnopfLink>
              </aside>
            </Block>

            {/* 9. Fragen für den Termin */}
            <Block id="fragen" titel={f(r.fragenTitel)} text={r.fragenText}>
              <ol className="fragenliste">
                {a.fragen.map((fr, i) => (
                  <li key={fr}>
                    <span className="fragenliste__nummer" data-ziffer={String(i + 1).padStart(2, "0")} aria-hidden="true" />
                    <span>
                      <Inline text={fr} />
                    </span>
                  </li>
                ))}
              </ol>
            </Block>

            {/* 10. Bewertung */}
            <Block id="bewertung" titel={f(r.bewertungTitel)}>
              {bewertung ? (
                <div className="bewertungsblock">
                  <div className="bewertungsblock__kopf">
                    <Bewertungsanzeige wert={bewertung.gesamt} von={r.von} groesse="gross" />
                    <p className="bewertungsblock__stand">
                      {r.bewertung}. {r.stand} <time dateTime={bewertung.stand}>{nbsp(formatiereIso(bewertung.stand))}</time>.{" "}
                      <Link href="/redaktion/arbeitsweise">{r.methodik}</Link>
                    </p>
                  </div>
                  {bewertung.kriterien.length > 0 ? (
                    <>
                      <h3 className="bewertungsblock__titel">{r.kriterien}</h3>
                      <Kriterienbalken kriterien={bewertung.kriterien} von={r.von} />
                    </>
                  ) : null}
                </div>
              ) : (
                <div className="leerkarte">
                  <span className="leerkarte__icon" aria-hidden="true">
                    <Icon name="pencil" groesse={24} />
                  </span>
                  <div>
                    <h3 className="leerkarte__titel">{r.bewertungLeerTitel}</h3>
                    <p>{r.bewertungLeerText}</p>
                    <div className="knopf_gruppe">
                      <KnopfLink href="/kontakt" variante="sekundaer" klein icon="arrowRight">
                        {r.bewertungLeerCta}
                      </KnopfLink>
                      <Link href="/redaktion/arbeitsweise" className="leerkarte__link">
                        {r.bewertungLeerCta2}
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </Block>

            {/* 11. Alternativen */}
            {alternativen.length > 0 ? (
              <Block id="alternativen" titel={f(r.alternativenTitel)} text={f(r.alternativenText)}>
                <ul className="kartenraster kartenraster_zwei liste_ohne">
                  {alternativen.map((x) => (
                    <li key={x.slug} className="kartenraster__eintrag">
                      <SoftwareKarte karte={softwareKarte(x)} texte={softwareKarteTexte} />
                    </li>
                  ))}
                </ul>
                <p className="produktblock__cta">
                  <KnopfLink href={`/anbieter?baustein=${baustein.slug}`} variante="sekundaer" icon="arrowRight">
                    {r.alternativenAlle}
                  </KnopfLink>
                </p>
              </Block>
            ) : null}

            {/* 12. FAQ */}
            <Block id="faq" titel={f(r.faqTitel)}>
              <div className="akkordeon-liste">
                {faq.map((p) => (
                  <Akkordeon key={p.schluessel} id={`faq-${p.schluessel}`} frage={p.frage}>
                    {p.art === "liste" ? (
                      <ul className="fliesstext">
                        {p.antwort.map((x) => (
                          <li key={x}>
                            <Inline text={x} />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      p.antwort.map((x) => (
                        <p key={x}>
                          <Inline text={x} />
                        </p>
                      ))
                    )}
                  </Akkordeon>
                ))}
              </div>
            </Block>

            {/* 13. Quellen */}
            <Block id="quellen" titel={ui.labels.quellen}>
              <ul className="quellenliste">
                {a.quellen.map((q) => (
                  <li key={q.url}>
                    <span className="quellenliste__titel">{q.titel}</span>
                    <a href={q.url} target="_blank" rel="noopener noreferrer" className="adresse quellenliste__url">
                      {q.url}
                      <span className="visuell_versteckt"> ({ui.barrierefreiheit.externLink})</span>
                    </a>
                    {quelleDatum}
                  </li>
                ))}
              </ul>
            </Block>

            {/* Weiterlesen */}
            <section className="produktblock produktblock_weiter" aria-labelledby="weiter-titel">
              <h2 id="weiter-titel">{r.weiterTitel}</h2>
              <div className="verwandt">
                <div>
                  <h3 className="verwandt__titel">{t.stationen}</h3>
                  <ul className="verwandt__liste liste_ohne">
                    {stationen.map((st) => (
                      <li key={st.slug}>
                        <Link href={`/fahrplan/${st.slug}`}>
                          {ui.labels.station} {st.nummer}: {st.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="verwandt__titel">{ui.labels.baustein}</h3>
                  <ul className="verwandt__liste liste_ohne">
                    <li>
                      <Link href={`/bausteine/${baustein.slug}`}>{baustein.name}</Link>
                    </li>
                  </ul>
                </div>
                {verwandteLeitfaeden.length > 0 ? (
                  <div>
                    <h3 className="verwandt__titel">{ui.abschnitte.leitfaden.verwandtLeitfaeden}</h3>
                    <ul className="verwandt__liste liste_ohne">
                      {verwandteLeitfaeden.map((l) => (
                        <li key={l.slug}>
                          <Link href={`/wissen/leitfaeden/${l.slug}`}>
                            <Inline text={l.titel} />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
              <p className="rueckweg">
                <KnopfLink href="/anbieter" variante="sekundaer" icon="arrowLeft" iconLinks>
                  {ui.knoepfe.alleAnbieter}
                </KnopfLink>
              </p>
            </section>
          </div>

          {/* Rand: klebt beim Scrollen, nur auf breiten Bildschirmen */}
          <aside className="produktrand" aria-label={a.name}>
            <AuswahlhilfeKarte />
            <div className="produktrand__karte">
              <p className="produktrand__label">{r.kopf.preis}</p>
              <p className="produktrand__preis">{nbsp(preisKurz)}</p>
              <KnopfLink href={linkRand.href} extern werbung={linkRand.werbung} icon="external" breit>
                {ziel(linkRand)}
              </KnopfLink>
              <a href="#fragen" className="produktrand__link">
                {r.kopf.fragenSpringen}
              </a>
            </div>
          </aside>
        </div>

        {/* Feste Leiste am Handy */}
        <div className="produktleiste">
          <KnopfLink href={linkLeiste.href} extern werbung={linkLeiste.werbung} icon="external" breit>
            {ziel(linkLeiste)}
          </KnopfLink>
        </div>
      </div>
    </>
  );
}
