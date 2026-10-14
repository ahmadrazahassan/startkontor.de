import type { Metadata } from "next";
import Link from "next/link";
import { HeroSuche } from "@/components/hero-suche";
import { AffiliatePartner } from "@/components/affiliate-partner";
import { Deutschland } from "@/components/deutschland";
import { Akkordeon } from "@/components/akkordeon";
import { ArtikelKarte } from "@/components/artikel-karte";
import { SoftwareEntscheidung } from "@/components/software-entscheidung";
import { Icon } from "@/components/icons";
import { Inline } from "@/components/inline";
import { Illustration } from "@/components/illustration";
import { JsonLd } from "@/components/json-ld";
import { KategorieKarte, type KarteChip } from "@/components/kategorie-karte";
import { KategorienBereich } from "@/components/kategorien-bereich";
import { KnopfLink } from "@/components/knopf";
import { NewsletterBlock } from "@/components/newsletter-block";
import { SoftwareKarte } from "@/components/software-karte";
import { Strecke } from "@/components/strecke";
import { TarifExplorerBereich } from "@/components/tarif-explorer-bereich";
import { ZahlenBereich } from "@/components/zahlen-bereich";
import {
  anbieterFuerBaustein,
  anbieterNachSlug,
  bausteine,
  getLeitfaden,
  getFaq,
  kennzahlen,
  seiten,
  startseite,
  ui,
} from "@/lib/daten";
import { holeLogo } from "@/lib/bilder";
import { KATEGORIE_ICON } from "@/lib/kategorie-icons";
import { organisationUndWebsite } from "@/lib/jsonld";
import { metaFuer } from "@/lib/seo";
import { softwareKarte, softwareKarteTexte } from "@/lib/software-ansicht";
import type { Anbieter } from "@/lib/typen";

export const metadata: Metadata = metaFuer({ seo: seiten.start.seo, pfad: "/", absoluterTitel: true });

/** Warme Iconfarben der Kategorien: Gelb, Rot und Orange, ohne Hintergrund. */
const KATEGORIE_AKZENT: Record<string, string> = {
  finanzen: "#f2a900",
  lohn: "#e5484d",
  personal: "#f97316",
  vertrieb: "#d6336c",
  betrieb: "#d68a00",
};

/** Kurze Chips der Kategorienkarten: Preisstatus und, wenn belegt, monatliche Kündbarkeit. */
function karteChips(a: Anbieter): KarteChip[] {
  const preis = { veroeffentlicht: "Preis veröffentlicht", anfrage: "Preis auf Anfrage", nichtVerifiziert: "Preis nicht verifiziert" }[a.preis.status];
  return a.monatlichKuendbar === true ? [{ text: preis }, { text: "Monatlich kündbar", ton: "ok" }] : [{ text: preis }];
}

const PFAD_MOTIVE = ["softwarevergleich", "software-planung", "vertragscheck"] as const;

export default function Startseite() {
  const s = seiten.start;
  const h = startseite;

  // Logoleiste: nur Programme, für die ein Review und eine Logodatei vorliegen
  const logos = h.logoleiste.slugs.flatMap((slug) => {
    const a = anbieterNachSlug.get(slug);
    const logo = a ? holeLogo(slug) : null;
    return a && logo ? [{ anbieter: a, logo }] : [];
  });

  const bsp = anbieterNachSlug.get("billomat");

  const hervorgehoben = getLeitfaden(s.leitfaeden.hervorgehoben);
  const weitere = s.leitfaeden.weitere.map(getLeitfaden);

  return (
    <>
      <JsonLd daten={organisationUndWebsite()} />

      {/* 1. Hero: Suche, Zusicherungen, Logoleiste */}
      <section className="portalhero" aria-labelledby="hero-titel">
        <svg className="portalhero__masken" width="0" height="0" aria-hidden="true" focusable="false">
          <defs>
            <clipPath id="hero-buero-rahmen" clipPathUnits="objectBoundingBox">
              <path d="M.55 .065C.525 .04 .475 .04 .45 .065L.065 .45C.04 .475 .04 .525 .065 .55L.45 .935C.475 .96 .525 .96 .55 .935L.935 .55C.96 .525 .96 .475 .935 .45Z" />
            </clipPath>
          </defs>
        </svg>
        <div className="portalhero__buehne">
          <div className="portalhero__portraet portalhero__portraet_links">
            <Illustration motiv="buero-team" original sizes="(min-width: 1280px) 326px, 240px" />
          </div>
          <div className="huelle portalhero__zentrum">
          <div className="portalhero__innen">
            <p className="portalhero__marke">
              <Deutschland text="Softwarewissen für Deutschland" />
            </p>
            <h1 id="hero-titel" className="display portalhero__h1">
              <Inline text={h.hero.h1} />
            </h1>
            <p className="lead portalhero__text">{h.hero.text.replace("{anzahl}", String(kennzahlen.anbieter))}</p>

            <HeroSuche
              platzhalter={h.hero.suchePlatzhalter}
              label={h.hero.sucheLabel}
              knopf={h.hero.sucheKnopf}
              keineTreffer={ui.suche.keineTreffer}
              haeufigLabel={h.hero.haeufig}
              suchbegriffe={h.hero.suchbegriffe}
              gruppen={ui.suche.gruppen}
            />
            <div className="portalhero__aktionen"><Link href="/anbieter" className="textlink">Software entdecken<Icon name="arrowRight" groesse={16} /></Link><span aria-hidden="true">·</span><Link href="/planer" className="textlink">Auswahlhilfe starten<Icon name="arrowRight" groesse={16} /></Link></div>
            <p className="portalhero__offenlegung">Werbehinweis: Über gekennzeichnete Partnerlinks können wir eine Provision erhalten. <Link href="/redaktion/werbung">Mehr zur Finanzierung</Link></p>

          </div>
          </div>
          <div className="portalhero__portraet portalhero__portraet_rechts">
            <Illustration motiv="beratung" prioritaet sizes="360px" />
          </div>
        </div>

        {logos.length > 0 ? (
          <div className="huelle">
            <div className="logoleiste">
              <p className="logoleiste__titel">{h.logoleiste.titel}</p>
              <ul className="logoleiste__liste liste_ohne">
                {logos.map(({ anbieter: a, logo }) => (
                  <li key={a.slug}>
                    <Link href={a.url} className="logoleiste__link" aria-label={`${h.review.label}: ${a.name}`}>
                      {/* Unverändertes Herstellerlogo zur Identifikation des besprochenen Programms */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={logo.src}
                        alt=""
                        width={Math.max(1, Math.round((32 * logo.breite) / logo.hoehe))}
                        height={32}
                        loading="lazy"
                        decoding="async"
                      />
                      <span className="logoleiste__name">{a.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </section>

      <section className="band band_weiss entdecken" aria-labelledby="entdecken-titel">
        <div className="huelle">
          <div className="portalabschnittkopf">
            <div>
              <h2 id="entdecken-titel">Software entdecken</h2>
              <p>Vier Programme aus verschiedenen Kategorien. Finden Sie heraus, welches zu Ihrem Bedarf passt.</p>
            </div>
            <Link href="/anbieter" className="textlink">Alle Programme<Icon name="arrowRight" groesse={18} /></Link>
          </div>
          <div className="kartenraster entdecken__karten">
            {["billomat", "personio", "pipedrive", "weclapp"].map((slug) => {
              const a = anbieterNachSlug.get(slug);
              return a ? <SoftwareKarte key={slug} karte={softwareKarte(a, "start-entdecken")} texte={softwareKarteTexte} /> : null;
            })}
          </div>
          <ul className="portalzusagen liste_ohne">
            {h.hero.zusicherungen.map((z) => <li key={z}><Icon name="check" groesse={18} />{z}</li>)}
          </ul>
        </div>
      </section>

      <section className="band band_weiss aufgabenbereich" aria-labelledby="aufgaben-titel"><div className="huelle"><div className="portalabschnittkopf"><div><p className="eyebrow">Nach Ihrem Bedarf</p><h2 id="aufgaben-titel">Was möchten Sie einfacher machen?</h2><p>Starten Sie mit Ihrer Aufgabe und finden Sie passende Softwarebereiche.</p></div><Link href="/bausteine" className="textlink">Alle Kategorien<Icon name="arrowRight" groesse={18} /></Link></div><div className="aufgabenkarten">{[
        { titel: "Rechnungen & Belege", text: "Angebote schreiben, Belege ordnen und die Buchhaltung vorbereiten.", slug: "finanzen" },
        { titel: "Lohn abrechnen", text: "Gehaltsabrechnung, Meldungen und monatliche Abläufe organisieren.", slug: "lohn" },
        { titel: "Team & Arbeitszeit", text: "Personalakten, Urlaubsplanung und Zeiterfassung zusammenführen.", slug: "personal" },
        { titel: "Kunden gewinnen", text: "Kontakte, Verkaufschancen und Angebote im Blick behalten.", slug: "vertrieb" },
        { titel: "Waren & Aufträge", text: "Lager, Einkauf und Aufträge mit Ihrem Betrieb verbinden.", slug: "betrieb" },
      ].map((aufgabe) => <Link key={aufgabe.slug} href={`/anbieter?baustein=${aufgabe.slug}`} className="aufgabenkarte"><Icon name={KATEGORIE_ICON[aufgabe.slug]} groesse={32} /><h3>{aufgabe.titel}</h3><p>{aufgabe.text}</p><span className="textlink">Software finden<Icon name="arrowRight" groesse={16} /></span></Link>)}</div></div></section>

      {/* 2. Drei Wege: was als Nächstes zu tun ist */}
      <AffiliatePartner />

      <section className="band band_weiss" aria-labelledby="pfade-titel">
        <div className="huelle">
          <div className="startkopf startkopf_mitte">
            <p className="eyebrow">{h.pfade.eyebrow}</p>
            <h2 id="pfade-titel">{h.pfade.titel}</h2>
            <p className="lead">{h.pfade.text}</p>
          </div>
          <ul className="pfade liste_ohne">
            {h.pfade.karten.map((k, i) => (
              <li key={k.href} className="pfadkarte">
                <Illustration motiv={PFAD_MOTIVE[i]} className="pfadkarte__bild" sizes="(min-width: 900px) 330px, 400px" />
                <h3 className="pfadkarte__titel">{k.titel}</h3>
                <p className="pfadkarte__text">{k.text}</p>
                <KnopfLink href={k.href} variante="sekundaer" icon="arrowRight">
                  {k.cta}
                </KnopfLink>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Kennzahlen: Markt, Verzeichnis, Sage */}
      <ZahlenBereich />
      <TarifExplorerBereich />

      {/* 3. Programme nach Kategorie */}
      <section id="kategorien" className="band kategorienbereich kat-bereich" aria-labelledby="kategorien-titel">
        <div className="huelle">
          <KategorienBereich
            beschriftung={h.kategorien.titel}
            kopf={
              <>
                <p className="eyebrow">{h.kategorien.eyebrow}</p>
                <h2 id="kategorien-titel">
                  <Inline text={h.kategorien.titel} />
                </h2>
                <p className="lead">
                  <Inline text={h.kategorien.text} />
                </p>
              </>
            }
            fuss={
              <>
                <Link href="/bausteine" className="textlink">
                  Alle Kategorien ansehen
                  <Icon name="arrowRight" groesse={18} />
                </Link>
                <Link href="/anbieter" className="textlink">
                  Alle {kennzahlen.anbieter} Programme
                  <Icon name="arrowRight" groesse={18} />
                </Link>
              </>
            }
            eintraege={bausteine.map((b) => {
              const liste = anbieterFuerBaustein(b.slug);
              return {
                schluessel: b.slug,
                label: b.kurzname,
                beschreibung: b.name,
                icon: KATEGORIE_ICON[b.slug] ?? "file",
                akzent: KATEGORIE_AKZENT[b.slug] ?? "#e5484d",
                anzahl: liste.length,
                einheit: liste.length === 1 ? h.kategorien.review : h.kategorien.reviews,
                inhalt: (
                  <>
                    <div className="kat-panelkopf">
                      <div className="kat-panelkopf__text">
                        <h3 className="kat-panelkopf__titel">{b.name}</h3>
                        <p>
                          <Inline text={b.teaser} />
                        </p>
                      </div>
                      <div className="kat-panelkopf__links">
                        <Link href={`/anbieter?baustein=${b.slug}`} className="knopf knopf_sekundaer knopf_klein">
                          <span className="knopf__text">{h.kategorien.alleKategorie.replace("{n}", String(liste.length))}</span>
                          <Icon name="arrowRight" groesse={16} />
                        </Link>
                        <Link href={`/bausteine/${b.slug}`} className="kat-panelkopf__kriterien">
                          {h.kategorien.kriterien}
                        </Link>
                      </div>
                    </div>
                    <div className="kat-raster">
                      {liste.map((a) => (
                        <KategorieKarte key={a.slug} karte={softwareKarte(a, `start-kategorie-${b.slug}`)} chips={karteChips(a)} />
                      ))}
                    </div>
                  </>
                ),
              };
            })}
          />
        </div>
      </section>

      {/* 4. So ist ein Review aufgebaut */}
      <section className="band band_weiss" aria-labelledby="aufbau-titel">
        <div className="huelle aufbau">
          <div className="aufbau__text">
            <p className="eyebrow">{h.aufbau.eyebrow}</p>
            <h2 id="aufbau-titel">
              <Inline text={h.aufbau.titel} />
            </h2>
            <p className="lead">
              <Inline text={h.aufbau.text} />
            </p>
            <ol className="aufbau__punkte liste_ohne">
              {h.aufbau.punkte.map((p, i) => (
                <li key={p.titel} className="aufbau__punkt">
                  <span className="aufbau__nr" data-ziffer={String(i + 1)} aria-hidden="true" />
                  <div>
                    <h3 className="aufbau__titel">{p.titel}</h3>
                    <p>
                      <Inline text={p.text} />
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <Link href="/redaktion/arbeitsweise" className="textlink">So arbeitet die Redaktion<Icon name="arrowRight" groesse={18} /></Link>
          </div>

          {bsp ? (
            <div className="aufbau__vorschau">
              <Illustration motiv="softwareauswahl" className="aufbau__bild" symbolbild sizes="(min-width: 1024px) 480px, 92vw" />
              <SoftwareKarte karte={softwareKarte(bsp)} texte={softwareKarteTexte} />
            </div>
          ) : null}
        </div>
      </section>

      {/* 5. Bausteinplaner */}
      <section className="band band_nebel" aria-labelledby="planer-titel">
        <div className="huelle planerteaser">
          <div className="planerteaser__text">
            <p className="eyebrow">{s.planer.eyebrow}</p>
            <h2 id="planer-titel">
              <Inline text={s.planer.titel} />
            </h2>
            <p className="lead">
              <Inline text={s.planer.text} />
            </p>
            <p>
              <KnopfLink href={s.planer.cta.href} icon="arrowRight">
                {s.planer.cta.label}
              </KnopfLink>
            </p>
          </div>
          <div className="planerteaser__medien">
            <Illustration motiv="software-planung" className="planerteaser__bild" sizes="350px" />
            <Strecke
              variante="kompakt"
              vertikalMobil
              className="planerteaser__strecke"
              beschriftung={s.planer.titel}
              halte={s.planer.schritte.map((schritt, i) => ({
                schluessel: schritt,
                nummer: i + 1,
                titel: schritt,
                zustand: "neutral" as const,
              }))}
            />
          </div>
        </div>
      </section>

      {/* 6. Ratgeber */}
      <section className="band" aria-labelledby="leitfaeden-titel">
        <div className="huelle">
          <div className="startkopf">
            <p className="eyebrow">{s.leitfaeden.eyebrow}</p>
            <h2 id="leitfaeden-titel">
              Ratgeber für Ihre Softwareentscheidung
            </h2>
            <p className="lead">
              <Inline text={s.leitfaeden.text} />
            </p>
          </div>
          <div className="artikelkarten artikelkarten_start">{[hervorgehoben, ...weitere, getLeitfaden("crm-ohne-overhead")].map((l) => <ArtikelKarte key={l.slug} artikel={l} />)}</div>
          <p className="startkopf__cta">
            <KnopfLink href={s.leitfaeden.cta.href} variante="sekundaer" icon="arrowRight">
              {s.leitfaeden.cta.label}
            </KnopfLink>
          </p>
        </div>
      </section>

      {/* 7. Für Hersteller */}
      <section className="band band_nebel herstellerband" aria-labelledby="hersteller-titel">
        <div className="huelle hersteller">
          <div className="hersteller__text">
            <p className="eyebrow">{h.anbieter.eyebrow}</p>
            <h2 id="hersteller-titel">
              <Inline text={h.anbieter.titel} />
            </h2>
            <p className="lead">
              <Inline text={h.anbieter.text} />
            </p>
            <div className="knopf_gruppe">
              <KnopfLink href="/redaktion/arbeitsweise" icon="arrowRight">
                {h.anbieter.kriterien}
              </KnopfLink>
              <KnopfLink href="/kontakt" variante="sekundaer">
                {h.anbieter.schreiben}
              </KnopfLink>
            </div>
          </div>

          <Illustration motiv="anbieterprofil" className="hersteller__bild" sizes="(min-width: 1024px) 470px, 92vw" />
        </div>
      </section>

      {/* 8. Verzeichnis A bis Z nach Kategorie */}
      <section className="band band_weiss" aria-labelledby="verzeichnis-titel">
        <div className="huelle">
          <div className="startkopf">
            <p className="eyebrow">{h.verzeichnis.eyebrow}</p>
            <h2 id="verzeichnis-titel">{h.verzeichnis.titel}</h2>
            <p className="lead">{h.verzeichnis.text}</p>
          </div>
          <div className="azliste">
            {bausteine.map((b) => (
              <div key={b.slug} className="azliste__spalte">
                <h3 className="azliste__titel">
                  <Link href={`/bausteine/${b.slug}`}>{b.name}</Link>
                </h3>
                <ul className="azliste__liste liste_ohne">
                  {anbieterFuerBaustein(b.slug).map((a) => (
                    <li key={a.slug}>
                      <Link href={a.url}>{a.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="startkopf__cta">
            <KnopfLink href="/anbieter" variante="sekundaer" icon="arrowRight">
              {h.verzeichnis.alle}
            </KnopfLink>
          </p>
        </div>
      </section>

      <section className="band band_weiss" aria-labelledby="start-faq"><div className="huelle startfaq"><div className="startfaq__kopf"><p className="eyebrow">Gut zu wissen</p><h2 id="start-faq">Fragen zur Softwareauswahl</h2><p>Wie unsere Profile entstehen und was Sie vor Ihrer Entscheidung wissen sollten.</p><Link href="/faq" className="textlink">Alle Antworten<Icon name="arrowRight" groesse={18} /></Link></div><div>{s.faq.ids.slice(0, 4).map((id) => { const f = getFaq(id); return <Akkordeon key={id} frage={f.frage}><p><Inline text={f.antwort} /></p>{f.verweis ? <Link href={f.verweis} className="textlink">Mehr erfahren<Icon name="arrowRight" groesse={16} /></Link> : null}</Akkordeon>; })}</div></div></section>
      <section className="band_eng"><div className="huelle"><SoftwareEntscheidung /></div></section>

      {/* 9. Newsletter */}
      <section className="band band_primaer" aria-labelledby="brief-titel">
        <div className="huelle briefband">
          <div className="briefband__text">
            <p className="eyebrow">{s.newsletter.eyebrow}</p>
            <h2 id="brief-titel">
              <Inline text={s.newsletter.titel} />
            </h2>
            <p className="lead">
              <Inline text={s.newsletter.text} />
            </p>
            <Illustration motiv="monatsbrief" className="briefband__bild" sizes="290px" />
          </div>
          <NewsletterBlock />
        </div>
      </section>
    </>
  );
}
