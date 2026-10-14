// Kennzahlen der Startseite: Markt (Statistisches Bundesamt), Verzeichnis und Einstiegspreise aller Hersteller.
// Nur Server, keine erfundenen Werte. Alle Programme werden gleich behandelt.

import Link from "next/link";
import { Icon } from "@/components/icons";
import { verzeichnisZahlen, zahlenQuelle, type Preiszeile } from "@/lib/zahlen";

const z = zahlenQuelle.markt;
const nummer = (n: number) => n.toLocaleString("de-DE");

function Zahl({ wert, text, quelle, url }: { wert: string; text: string; quelle?: string; url?: string }) {
  return (
    <li className="gross">
      <p className="gross__wert">{wert}</p>
      <div className="gross__text">
        <p>{text}</p>
        {quelle && url ? <a href={url} target="_blank" rel="noopener noreferrer">{quelle}</a> : null}
      </div>
    </li>
  );
}

function Rangliste({ titel, untertitel, zeilen, max, einheit, median }: { titel: string; untertitel: string; zeilen: Preiszeile[]; max: number; einheit: string; median: string }) {
  return (
    <figure className="rang">
      <figcaption className="rang__kopf">
        <strong>{titel}</strong>
        <span>{untertitel}</span>
      </figcaption>
      <ol className="rang__liste liste_ohne">
        {zeilen.map((r) => (
          <li key={r.slug} className="rang__zeile">
            <Link href={r.href} className="rang__name" title={r.paket}>{r.name}</Link>
            <span className="rang__spur" aria-hidden="true"><span className="rang__fuellung" style={{ width: `${Math.max(2, (r.betrag / max) * 100)}%` }} /></span>
            <span className="rang__wert">{r.text}</span>
          </li>
        ))}
      </ol>
      <p className="rang__fuss">Mittlerer Wert (Median): <strong>{median}</strong> {einheit}. Pakete und Nutzerzahlen unterscheiden sich, der Name zeigt beim Darüberfahren das Paket.</p>
    </figure>
  );
}

export function ZahlenBereich() {
  const v = verzeichnisZahlen();
  const teile = [
    { k: "veroeffentlicht", label: "Preis veröffentlicht", n: v.preis.veroeffentlicht },
    { k: "anfrage", label: "Preis auf Anfrage", n: v.preis.anfrage },
    { k: "offen", label: "Preis nicht verifiziert", n: v.preis.nichtVerifiziert },
  ];
  const hoechster = Math.max(...v.kategorien.map((k) => k.anteil));

  return (
    <>
      {/* Markt: große Zahlen und Säulen mit Trennlinien */}
      <section className="band band_nebel zahlenband" aria-labelledby="zahlen-titel">
        <div className="huelle">
          <div className="zahlenkopf">
            <p className="eyebrow">Zahlen und Daten</p>
            <h2 id="zahlen-titel">Kleine Unternehmen prägen den Markt, Cloudsoftware setzt sich durch</h2>
            <p className="lead">Amtliche Zahlen zeigen, für wen Geschäftssoftware gebaut wird und wie verbreitet sie bereits ist.</p>
          </div>

          <ul className="grossraster liste_ohne">
            <Zahl {...z.kleinUndMittel} />
            <Zahl {...z.beschaeftigte} />
            <Zahl {...z.cloud} />
            <Zahl wert={String(v.gesamt)} text={`Programme in ${v.kategorienAnzahl} Kategorien mit eigenem Softwareprofil, von Rechnung bis Warenwirtschaft.`} />
          </ul>

          <figure className="riesen">
            <p className="riesen__titel">Nach Unternehmensgröße: {z.cloudNachGroesse.untertitel}</p>
            <ul className="riesen__spalten liste_ohne">
              {z.cloudNachGroesse.werte.map((w) => (
                <li key={w.label} className="riesen__spalte">
                  <span className="riesen__label">{w.label}<small>{w.klasse}</small></span>
                  <span className="riesen__flaeche">
                    <span className="riesen__wert">{w.prozent}%</span>
                    <span className="riesen__fuellung" style={{ height: `${w.prozent}%` }} />
                  </span>
                </li>
              ))}
            </ul>
            <figcaption className="riesen__quelle">
              Quelle: <a href={z.cloudNachGroesse.url} target="_blank" rel="noopener noreferrer">{z.cloudNachGroesse.quelle}</a>. Je kleiner das Unternehmen, desto seltener Cloudsoftware. Der Preisvergleich lohnt sich daher gerade für Einsteiger.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Verzeichnis: Stufendiagramm mit Skala, Stapelbalken mit Legende */}
      <section className="band band_weiss zahlenband" aria-labelledby="verzeichnis-zahlen-titel">
        <div className="huelle">
          <div className="portalabschnittkopf">
            <div>
              <p className="eyebrow">Unser Verzeichnis in Zahlen</p>
              <h2 id="verzeichnis-zahlen-titel">{v.preis.anteilVeroeffentlicht} Prozent der Programme nennen einen Preis</h2>
              <p>Die Werte werden direkt aus den {v.gesamt} Softwareprofilen berechnet. Stand ist das Prüfdatum im jeweiligen Profil.</p>
            </div>
            <Link href="/anbieter" className="textlink">Alle Programme<Icon name="arrowRight" groesse={18} /></Link>
          </div>

          <div className="diagrammpaar">
            <figure className="stufen">
              <figcaption className="stufen__kopf"><strong>Preistransparenz nach Kategorie</strong><span>Anteil der Programme mit veröffentlichtem Preis</span></figcaption>
              <div className="stufen__feld">
                <ul className="stufen__spalten liste_ohne">
                  {v.kategorien.map((k) => (
                    <li key={k.slug} className={`stufe${k.anteil === hoechster ? " stufe_spitze" : ""}`} style={{ height: `${Math.max(k.anteil, 4)}%` }}>
                      <span className="stufe__wert">{k.anteil}%</span>
                      <span className="stufe__zaehler">{k.mitPreis} von {k.anzahl}</span>
                      <span className="stufe__label">{k.label}</span>
                    </li>
                  ))}
                </ul>
                <ol className="stufen__skala liste_ohne" aria-hidden="true"><li>100</li><li>75</li><li>50</li><li>25</li><li>0</li></ol>
              </div>
            </figure>

            <figure className="stapelblock">
              <figcaption className="stufen__kopf"><strong>Preisangaben im Verzeichnis</strong><span>Laut deutscher Herstellerseite, {v.gesamt} Programme</span></figcaption>
              <ul className="stapelzahlen liste_ohne">
                {teile.map((t) => <li key={t.k} style={{ flexGrow: t.n }}>{t.n}</li>)}
              </ul>
              <div className="stapel" role="img" aria-label={teile.map((t) => `${t.label}: ${t.n} von ${v.gesamt}`).join(", ")}>
                {teile.map((t) => <span key={t.k} className={`stapel__teil stapel__teil_${t.k}`} style={{ flexGrow: t.n }} />)}
              </div>
              <ul className="legende liste_ohne">
                {teile.map((t) => <li key={t.k}><span className={`legende__punkt stapel__teil_${t.k}`} aria-hidden="true" />{t.label} ({t.n})</li>)}
              </ul>
              <p className="stapelblock__fuss">Monatlich kündbar laut Hersteller: {v.kuendbar.ja} Programme, ausdrücklich nicht: {v.kuendbar.nein}. Bei {v.kuendbar.offen} Programmen ist die Frist nicht belegt und bleibt im Profil offen. Kostenlosen Einstieg oder eine kostenlose Edition bieten {v.gratis.length} Programme: {v.gratis.join(", ")}.</p>
            </figure>
          </div>
        </div>
      </section>

      {/* Einstiegspreise aller Hersteller */}
      <section className="band band_nebel zahlenband" aria-labelledby="preise-zahlen-titel">
        <div className="huelle">
          <div className="portalabschnittkopf">
            <div>
              <p className="eyebrow">Einstiegspreise im Vergleich</p>
              <h2 id="preise-zahlen-titel">Was der Einstieg kostet: {v.pauschal.zeilen.length + v.jeNutzer.zeilen.length} Programme im Preisvergleich</h2>
              <p>Pauschalpreise und Preise je Nutzer stehen getrennt, jeweils vom niedrigsten zum höchsten Betrag. Die Reihenfolge ist keine Qualitätswertung. Preise sind Herstellerangaben, Aktionen sind nicht eingerechnet.</p>
            </div>
            <Link href="/anbieter?preis=veroeffentlicht" className="textlink">Programme mit Preis<Icon name="arrowRight" groesse={18} /></Link>
          </div>

          <ul className="grossraster grossraster_drei liste_ohne">
            <Zahl wert={v.pauschal.medianText.replace(" Euro", "")} text={`Euro im Monat: mittlerer Einstieg bei Programmen mit Pauschalpreis (${v.pauschal.zeilen.length} Programme).`} />
            <Zahl wert={v.jeNutzer.medianText.replace(" Euro", "")} text={`Euro je Nutzer und Monat: mittlerer Einstieg bei Programmen mit Preis je Nutzer (${v.jeNutzer.zeilen.length} Programme).`} />
            <Zahl wert={String(v.gratis.length)} text="Programme mit kostenlosem Einstieg oder kostenloser Edition." />
          </ul>

          <div className="diagrammpaar">
            <Rangliste titel="Pauschalpreis je Monat" untertitel="Erstes bezahltes Paket, Finanzen, Lohn und Betrieb" zeilen={v.pauschal.zeilen} max={v.pauschal.max} einheit="Euro im Monat" median={v.pauschal.medianText} />
            <Rangliste titel="Preis je Nutzer und Monat" untertitel="Erstes bezahltes Paket, Personal, Vertrieb und Betrieb" zeilen={v.jeNutzer.zeilen} max={v.jeNutzer.max} einheit="je Nutzer und Monat" median={v.jeNutzer.medianText} />
          </div>
          <p className="zahlenhinweis">
            Außerhalb dieser Skala liegen {v.darueber.map((r) => `${r.name} (${r.text} im Monat, ${r.paket})`).join(" und ")}. {nummer(v.gesamt - v.pauschal.zeilen.length - v.jeNutzer.zeilen.length - v.darueber.length)} weitere Programme erscheinen hier nicht als Rangliste, weil der Hersteller keinen Preis nennt, Preise nur auf Anfrage vergibt oder ihn nur im kostenlosen Tarif nennt. Maßgeblich sind immer die aktuellen Konditionen beim Hersteller.
          </p>
        </div>
      </section>
    </>
  );
}
