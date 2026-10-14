// Kennzahlen der Startseite: Markt (Statistisches Bundesamt), Verzeichnis und Einstiegspreise aller Hersteller.
// Nur Server, keine erfundenen Werte. Alle Programme werden gleich behandelt.

import Link from "next/link";
import { Icon } from "@/components/icons";
import { verzeichnisZahlen, zahlenQuelle, type Preiszeile } from "@/lib/zahlen";

const z = zahlenQuelle.markt;
const nummer = (n: number) => n.toLocaleString("de-DE");

/** Versetzte Karte: Zahl oben, Punkt und Beschriftung unten. */
function Kachel({ wert, label, text, quelle, url }: { wert: string; label: string; text?: string; quelle?: string; url?: string }) {
  return (
    <li className="kz-kachel">
      <p className="kz-kachel__text">{text}</p>
      <div className="kz-kachel__karte">
        <p className="kz-zahl">{wert}</p>
        <p className="kz-label"><span className="kz-punkt" aria-hidden="true" />{label}</p>
      </div>
      {quelle && url ? <a className="kz-quelle" href={url} target="_blank" rel="noopener noreferrer">{quelle}</a> : null}
    </li>
  );
}

/** Vollbreite Karte: große Zahl links, Beschriftung und optional Balken rechts. */
function Zeile({ wert, label, anteil }: { wert: string; label: string; anteil?: number }) {
  return (
    <li className="kz-zeile">
      <p className="kz-zahl kz-zahl_fett">{wert}</p>
      <div className="kz-zeile__seite">
        <p className="kz-label"><span className="kz-punkt" aria-hidden="true" />{label}</p>
        {anteil !== undefined ? <span className="kz-spur" aria-hidden="true"><span className="kz-spur__fuellung" style={{ width: `${anteil}%` }} /></span> : null}
      </div>
    </li>
  );
}

function Kopf({ id, label, titel, text, link }: { id: string; label: string; titel: string; text: string; link?: { href: string; text: string } }) {
  return (
    <header className="kz-kopf">
      <p className="kz-eyebrow"><span className="kz-punkt" aria-hidden="true" />{label}</p>
      <h2 id={id} className="kz-titel">{titel}</h2>
      <div className="kz-kopf__unten">
        <p className="kz-lead">{text}</p>
        {link ? <Link href={link.href} className="textlink">{link.text}<Icon name="arrowRight" groesse={18} /></Link> : null}
      </div>
    </header>
  );
}

function Rangliste({ titel, untertitel, zeilen, max, median, einheit }: { titel: string; untertitel: string; zeilen: Preiszeile[]; max: number; median: string; einheit: string }) {
  return (
    <figure className="kz-rang">
      <figcaption className="kz-rang__kopf">
        <strong>{titel}</strong>
        <span>{untertitel}</span>
      </figcaption>
      <ol className="kz-rang__liste liste_ohne">
        {zeilen.map((r) => (
          <li key={r.slug} className="kz-rang__zeile">
            <Link href={r.href} className="kz-rang__name" title={r.paket}>{r.name}</Link>
            <span className="kz-rang__spur" aria-hidden="true"><span style={{ width: `${Math.max(2, (r.betrag / max) * 100)}%` }} /></span>
            <span className="kz-rang__wert">{r.text}</span>
          </li>
        ))}
      </ol>
      <p className="kz-rang__fuss">Median: <strong>{median}</strong> {einheit}. Das Paket sehen Sie beim Darüberfahren mit der Maus.</p>
    </figure>
  );
}

export function ZahlenBereich() {
  const v = verzeichnisZahlen();
  return (
    <section className="band band_weiss kz" aria-label="Zahlen und Daten">
      <div className="huelle kz__huelle">
        {/* 1. Markt */}
        <div className="kz-block" aria-labelledby="zahlen-titel">
          <Kopf id="zahlen-titel" label="Zahlen und Daten" titel="Kleine Unternehmen prägen den Markt, Cloudsoftware setzt sich durch" text="Amtliche Zahlen zeigen, für wen Geschäftssoftware gebaut wird und wie verbreitet sie bereits ist." />
          <ul className="kz-versetzt kz-versetzt_drei liste_ohne">
            <Kachel {...z.kleinUndMittel} wert={z.kleinUndMittel.wert} label="Anteil kleiner und mittlerer Unternehmen" text="Rund 3,2 Millionen Unternehmen in ausgewählten Wirtschaftsbereichen, ohne Bau." quelle="Statistisches Bundesamt, 2024" />
            <Kachel {...z.beschaeftigte} label="Beschäftigte in kleinen und mittleren Unternehmen" text="Mehr als die Hälfte aller Beschäftigten arbeitet nicht in Großunternehmen." quelle="Statistisches Bundesamt, 2024" />
            <Kachel {...z.cloud} label="Unternehmen mit bezahlten Cloud Diensten" text="Unternehmen mit mindestens 10 Beschäftigten, Stand 2025." quelle="Statistisches Bundesamt, 2025" />
          </ul>

          <div className="kz-unterblock">
            <h3 className="kz-unterblock__titel">Cloud Nutzung nach Unternehmensgröße</h3>
            <ul className="kz-zeilen liste_ohne">
              {z.cloudNachGroesse.werte.map((w) => (
                <Zeile key={w.label} wert={`${w.prozent} %`} label={`${w.label}, ${w.klasse}`} anteil={w.prozent} />
              ))}
            </ul>
            <p className="kz-fuss">Je kleiner das Unternehmen, desto seltener wird bezahlte Cloudsoftware genutzt. Der Preisvergleich lohnt sich daher gerade für Einsteiger. Quelle: <a href={z.cloudNachGroesse.url} target="_blank" rel="noopener noreferrer">{z.cloudNachGroesse.quelle}</a>.</p>
          </div>
        </div>

        {/* 2. Einstiegspreise */}
        <div className="kz-block" aria-labelledby="preise-zahlen-titel">
          <Kopf id="preise-zahlen-titel" label="Einstiegspreise im Vergleich" titel={`Was der Einstieg kostet: ${v.pauschal.zeilen.length + v.jeNutzer.zeilen.length}\u00a0Programme im Preisvergleich`} text="Pauschalpreise und Preise je Nutzer stehen getrennt, jeweils vom niedrigsten zum höchsten Betrag. Die Reihenfolge ist keine Qualitätswertung. Preise sind Herstellerangaben, Aktionen sind nicht eingerechnet." link={{ href: "/anbieter?preis=veroeffentlicht", text: "Programme mit Preis" }} />

          <ul className="kz-zeilen liste_ohne">
            <Zeile wert={v.pauschal.medianText.replace(" Euro", " €")} label={`Mittlerer Einstieg im Monat, ${v.pauschal.zeilen.length} Programme mit Pauschalpreis`} />
            <Zeile wert={v.jeNutzer.medianText.replace(" Euro", " €")} label={`Mittlerer Einstieg je Nutzer und Monat, ${v.jeNutzer.zeilen.length} Programme`} />
          </ul>

          <div className="kz-raenge">
            <Rangliste titel="Pauschalpreis je Monat" untertitel="Erstes bezahltes Paket, Finanzen, Lohn und Betrieb" zeilen={v.pauschal.zeilen} max={v.pauschal.max} median={v.pauschal.medianText} einheit="im Monat" />
            <Rangliste titel="Preis je Nutzer und Monat" untertitel="Erstes bezahltes Paket, Personal, Vertrieb und Betrieb" zeilen={v.jeNutzer.zeilen} max={v.jeNutzer.max} median={v.jeNutzer.medianText} einheit="je Nutzer und Monat" />
          </div>
          <p className="kz-fuss kz-fuss_breit">
            Außerhalb dieser Skala liegen {v.darueber.map((r) => `${r.name} (${r.text} im Monat, ${r.paket})`).join(" und ")}. {nummer(v.gesamt - v.pauschal.zeilen.length - v.jeNutzer.zeilen.length - v.darueber.length)} weitere Programme erscheinen hier nicht als Rangliste, weil der Hersteller keinen Preis nennt, Preise nur auf Anfrage vergibt oder ihn nur im kostenlosen Tarif nennt. Maßgeblich sind immer die aktuellen Konditionen beim Hersteller.
          </p>
        </div>
      </div>
    </section>
  );
}
