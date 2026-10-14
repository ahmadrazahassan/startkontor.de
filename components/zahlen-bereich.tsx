// Kennzahlen der Startseite: Markt (Statistisches Bundesamt), Verzeichnis und Sage. Nur Server, keine erfundenen Werte.

import Link from "next/link";
import { Icon } from "@/components/icons";
import { verzeichnisZahlen, zahlenQuelle, type Preiszeile } from "@/lib/zahlen";

const z = zahlenQuelle.markt;

function Kachel({ wert, text, quelle, url }: { wert: string; text: string; quelle: string; url: string }) {
  return (
    <li className="zahl">
      <p className="zahl__wert">{wert}</p>
      <p className="zahl__text">{text}</p>
      <a className="zahl__quelle" href={url} target="_blank" rel="noopener noreferrer">
        {quelle}
      </a>
    </li>
  );
}

function Preisbalken({ titel, zeilen, einheit }: { titel: string; zeilen: Preiszeile[]; einheit: string }) {
  const max = Math.max(...zeilen.map((r) => r.betrag));
  return (
    <div className="preisbalken">
      <h4 className="preisbalken__titel">{titel}</h4>
      <ul className="preisbalken__liste liste_ohne">
        {zeilen.map((r) => (
          <li key={r.slug} className="preisbalken__zeile">
            <Link href={r.href} className="preisbalken__name">{r.name}</Link>
            <span className="preisbalken__paket">{r.paket}</span>
            <span className="preisbalken__spur" aria-hidden="true">
              <span className="preisbalken__fuellung" style={{ width: `${Math.max(4, (r.betrag / max) * 100)}%` }} />
            </span>
            <span className="preisbalken__wert">{r.text}<small> {einheit}</small></span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ZahlenBereich() {
  const v = verzeichnisZahlen();
  const s = v.sage;
  const maxKategorie = Math.max(...v.kategorien.map((k) => k.anzahl));
  const preisTeile = [
    { schluessel: "veroeffentlicht", label: "Preis veröffentlicht", n: v.preis.veroeffentlicht },
    { schluessel: "anfrage", label: "Preis auf Anfrage", n: v.preis.anfrage },
    { schluessel: "offen", label: "Preis nicht verifiziert", n: v.preis.nichtVerifiziert },
  ];

  return (
    <>
      <section className="band band_nebel zahlenband" aria-labelledby="zahlen-titel">
        <div className="huelle">
          <div className="startkopf startkopf_mitte">
            <p className="eyebrow">Zahlen und Daten</p>
            <h2 id="zahlen-titel">Kleine Unternehmen prägen den Markt, Cloudsoftware setzt sich durch</h2>
            <p className="lead">Amtliche Zahlen zeigen, für wen Geschäftssoftware gebaut wird und wie verbreitet sie bereits ist.</p>
          </div>

          <ul className="zahlenraster liste_ohne">
            <Kachel {...z.kleinUndMittel} />
            <Kachel {...z.beschaeftigte} />
            <Kachel {...z.cloud} />
          </ul>

          <figure className="diagramm">
            <figcaption className="diagramm__kopf">
              <strong>{z.cloudNachGroesse.titel}</strong>
              <span>{z.cloudNachGroesse.untertitel}</span>
            </figcaption>
            <ul className="saeulen liste_ohne">
              {z.cloudNachGroesse.werte.map((w) => (
                <li key={w.label} className="saeule">
                  <span className="saeule__wert">{w.prozent} %</span>
                  <span className="saeule__spur" aria-hidden="true">
                    <span className="saeule__fuellung" style={{ height: `${w.prozent}%` }} />
                  </span>
                  <span className="saeule__label">{w.label}</span>
                  <span className="saeule__klasse">{w.klasse}</span>
                </li>
              ))}
            </ul>
            <p className="diagramm__quelle">
              Quelle: <a href={z.cloudNachGroesse.url} target="_blank" rel="noopener noreferrer">{z.cloudNachGroesse.quelle}</a>. Kleine und mittlere Unternehmen nutzen Cloudsoftware seltener als große. Gerade dort lohnt der Preisvergleich.
            </p>
          </figure>
        </div>
      </section>

      <section className="band band_weiss zahlenband" aria-labelledby="verzeichnis-zahlen-titel">
        <div className="huelle">
          <div className="portalabschnittkopf">
            <div>
              <p className="eyebrow">Unser Verzeichnis in Zahlen</p>
              <h2 id="verzeichnis-zahlen-titel">{v.gesamt} Programme, {v.preis.anteilVeroeffentlicht} Prozent mit veröffentlichtem Preis</h2>
              <p>Alle Werte werden direkt aus den Softwareprofilen berechnet. Stand der Angaben ist das Prüfdatum im jeweiligen Profil.</p>
            </div>
            <Link href="/anbieter" className="textlink">Alle Programme<Icon name="arrowRight" groesse={18} /></Link>
          </div>

          <div className="diagrammpaar">
            <figure className="diagramm">
              <figcaption className="diagramm__kopf"><strong>Programme nach Kategorie</strong><span>Anzahl der Softwareprofile</span></figcaption>
              <ul className="saeulen liste_ohne">
                {v.kategorien.map((k) => (
                  <li key={k.slug} className="saeule">
                    <span className="saeule__wert">{k.anzahl}</span>
                    <span className="saeule__spur" aria-hidden="true">
                      <span className="saeule__fuellung" style={{ height: `${(k.anzahl / maxKategorie) * 100}%` }} />
                    </span>
                    <span className="saeule__label">{k.label}</span>
                  </li>
                ))}
              </ul>
            </figure>

            <figure className="diagramm">
              <figcaption className="diagramm__kopf"><strong>Preistransparenz</strong><span>Angaben der Hersteller auf ihren deutschen Seiten</span></figcaption>
              <div className="stapel" role="img" aria-label={preisTeile.map((t) => `${t.label}: ${t.n} von ${v.gesamt}`).join(", ")}>
                {preisTeile.map((t) => (
                  <span key={t.schluessel} className={`stapel__teil stapel__teil_${t.schluessel}`} style={{ flexGrow: t.n }}>{t.n}</span>
                ))}
              </div>
              <ul className="legende liste_ohne">
                {preisTeile.map((t) => (
                  <li key={t.schluessel}><span className={`legende__punkt stapel__teil_${t.schluessel}`} aria-hidden="true" />{t.label} ({t.n})</li>
                ))}
              </ul>
              <p className="diagramm__quelle">Monatlich kündbar laut Hersteller: {v.kuendbar.ja} Programme. Ausdrücklich nicht monatlich kündbar: {v.kuendbar.nein}. Bei {v.kuendbar.offen} Programmen ist die Frist nicht belegt und bleibt im Profil offen.</p>
            </figure>
          </div>
        </div>
      </section>

      <section className="band band_nebel zahlenband" aria-labelledby="sage-zahlen-titel">
        <div className="huelle">
          <div className="portalabschnittkopf">
            <div>
              <p className="eyebrow">Sage im Überblick</p>
              <h2 id="sage-zahlen-titel">Sage deckt in unserem Verzeichnis alle {s.kategorien} Kategorien ab</h2>
              <p>{s.anzahl} Programme des Herstellers, das sind {s.anteil} Prozent des Verzeichnisses. Preise stammen von den Herstellerseiten, Aktionen sind darin nicht eingerechnet.</p>
            </div>
            <Link href="/anbieter?baustein=finanzen" className="textlink">Sage Programme ansehen<Icon name="arrowRight" groesse={18} /></Link>
          </div>

          <ul className="zahlenraster zahlenraster_vier liste_ohne">
            <li className="zahl"><p className="zahl__wert">{s.anzahl}</p><p className="zahl__text">Programme von Sage mit eigenem Softwareprofil.</p></li>
            <li className="zahl"><p className="zahl__wert">{s.preisVeroeffentlicht} von {s.anzahl}</p><p className="zahl__text">mit veröffentlichtem Einstiegspreis.</p></li>
            <li className="zahl"><p className="zahl__wert">{s.kuendbar.ja} von {s.anzahl}</p><p className="zahl__text">laut Hersteller monatlich kündbar. {s.kuendbar.nein} ausdrücklich nicht, {s.kuendbar.offen} offen.</p></li>
            <li className="zahl"><p className="zahl__wert">{s.richtpreis.text}</p><p className="zahl__text">Richtpreis netto je Monat für {s.richtpreis.name} im Paket Standard.</p></li>
          </ul>

          <div className="diagrammpaar">
            <figure className="diagramm">
              <figcaption className="diagramm__kopf"><strong>Einstiegspreise: Pauschale je Monat</strong><span>Erstes Paket laut Hersteller, zuzüglich Umsatzsteuer</span></figcaption>
              <Preisbalken titel="" zeilen={s.pauschal} einheit="im Monat" />
            </figure>
            <figure className="diagramm">
              <figcaption className="diagramm__kopf"><strong>Einstiegspreise: je Nutzer und Monat</strong><span>Erstes Paket laut Hersteller, zuzüglich Umsatzsteuer</span></figcaption>
              <Preisbalken titel="" zeilen={s.jeNutzer} einheit="je Nutzer" />
            </figure>
          </div>
          <p className="zahlenhinweis">Die Pakete sind nicht eins zu eins vergleichbar: Sie unterscheiden sich in Nutzerzahl, Funktionsumfang und Abrechnungsart. Maßgeblich sind die aktuellen Konditionen bei Sage. Fragen für Ihr Gespräch mit dem Hersteller finden Sie im jeweiligen Softwareprofil.</p>
        </div>
      </section>
    </>
  );
}
