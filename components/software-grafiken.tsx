// Grafiken im Softwareprofil. Alle Werte stammen aus belegten Angaben des Profils, siehe lib/analyse.ts.

import Link from "next/link";
import { Sterne } from "@/components/bewertung";
import { Icon } from "@/components/icons";
import { PreisPosition } from "@/components/preis-position";
import { betragText, profilzahlen, type Preisposition, type Tarife, type Transparenz } from "@/lib/analyse";
import type { Anbieter } from "@/lib/typen";

const zahl = (n: number) => n.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const stufe = (wert: number) => (wert >= 4 ? "hoch" : wert >= 3 ? "mittel" : "niedrig");

type Props = {
  anbieter: Pick<Anbieter, "slug" | "name" | "monatlichKuendbar" | "vertrag" | "funktionen" | "grenzen" | "fragen" | "quellen" | "geprueft" | "stationen">;
  transparenz: Transparenz;
  tarife: Tarife | null;
  position: Preisposition | null;
  kategorien: Record<string, string>;
  alleStationen: { slug: string; nummer: number; name: string }[];
};

export function SoftwareGrafiken({ anbieter: a, transparenz: t, tarife, position, kategorien, alleStationen }: Props) {
  const umfang = 2 * Math.PI * 52;
  const anteil = t.gesamt / 5;
  const zahlen = profilzahlen(a);
  const hoechsterTarif = tarife ? Math.max(...tarife.stufen.map((s) => s.betrag), 1) : 1;
  const vertragZustand = a.monatlichKuendbar === true ? "ja" : a.monatlichKuendbar === false ? "nein" : "offen";
  const aktiveStationen = alleStationen.filter((s) => a.stationen.includes(s.slug));

  return (
    <div className="ag">
      {/* Transparenzwert */}
      <section className="ag-karte ag-karte_breit ag-transparenz" aria-labelledby="ag-transparenz-titel">
        <div className="ag-ring">
          <svg viewBox="0 0 120 120" className="ag-ring__svg" role="img" aria-label={`Transparenzwert ${zahl(t.gesamt)} von 5`}>
            <defs>
              <linearGradient id="ag-verlauf" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#7aacdc" />
                <stop offset="100%" stopColor="#095fbb" />
              </linearGradient>
            </defs>
            <circle cx="60" cy="60" r="52" className="ag-ring__spur" />
            <circle
              cx="60"
              cy="60"
              r="52"
              className="ag-ring__fuell"
              strokeDasharray={`${umfang * anteil} ${umfang}`}
              style={{ "--umfang": umfang, "--ziel": umfang * anteil } as React.CSSProperties}
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div className="ag-ring__mitte">
            <span className="ag-ring__zahl">{zahl(t.gesamt)}</span>
            <span className="ag-ring__von">von 5</span>
          </div>
        </div>

        <div className="ag-transparenz__text">
          <h3 id="ag-transparenz-titel" className="ag-titel">Transparenzwert</h3>
          <p className="ag-transparenz__einordnung">
            <Sterne wert={t.gesamt} groesse={18} />
            <strong>{t.einordnung}</strong>
          </p>
          <p className="ag-hinweis">
            Der Wert zeigt, wie gut Preis, Vertrag und Herkunft von {a.name} öffentlich belegt sind. Er bewertet nicht die Qualität des Programms. <Link href="/redaktion/arbeitsweise#abschnitt-wie-der-transparenzwert-entsteht">So rechnen wir</Link>
          </p>
        </div>

        <ul className="ag-kriterien liste_ohne">
          {t.kriterien.map((k, i) => (
            <li key={k.schluessel} className="ag-kriterium" data-stufe={stufe(k.wert)} style={{ "--i": i } as React.CSSProperties}>
              <span className="ag-kriterium__label">{k.label}</span>
              <span className="ag-kriterium__spur" aria-hidden="true">
                <span className="ag-kriterium__fuell" style={{ "--w": `${(k.wert / 5) * 100}%` } as React.CSSProperties} />
              </span>
              <span className="ag-kriterium__wert">{k.wert} <small>von 5</small></span>
              <span className="ag-kriterium__grund">{k.grund}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Preisposition und Tarifstufen */}
      {position || tarife ? (
        <div className="ag-paar">
          {position ? (
            <section className="ag-karte" aria-labelledby="ag-position-titel">
              <h3 id="ag-position-titel" className="ag-titel">Einstiegspreis im Vergleich</h3>
              <PreisPosition titel={position.gruppe.titel} einheit={position.gruppe.einheit} punkte={position.gruppe.punkte} aktuellSlug={a.slug} kategorien={kategorien} />
              <p className="ag-hinweis">Der Rang gilt nur für den Preis und sagt nichts über die Qualität. Verglichen werden jeweils erste bezahlte Pakete laut Hersteller, Aktionen nicht eingerechnet.</p>
            </section>
          ) : null}

          {tarife ? (
            <section className="ag-karte" aria-labelledby="ag-tarife-titel">
              <h3 id="ag-tarife-titel" className="ag-titel">Tarifstufen</h3>
              <p className="ag-untertitel">Beträge {tarife.einheit}</p>
              <ul className="ag-tarife liste_ohne">
                {tarife.stufen.map((s, i) => (
                  <li key={s.name} className="ag-tarif" style={{ "--i": i } as React.CSSProperties}>
                    <span className="ag-tarif__name">
                      {s.name}
                      {s.zusatz ? <small>{s.zusatz}</small> : null}
                    </span>
                    <span className="ag-tarif__spur" aria-hidden="true">
                      <span className="ag-tarif__fuell" style={{ "--w": `${Math.max(2, (s.betrag / hoechsterTarif) * 100)}%` } as React.CSSProperties} />
                    </span>
                    <span className="ag-tarif__wert">{s.betrag === 0 ? "kostenlos" : `${betragText(s.betrag)} €`}</span>
                  </li>
                ))}
              </ul>
              <p className="ag-hinweis">Herstellerangaben vom {a.geprueft}. Maßgeblich sind die aktuellen Konditionen beim Hersteller.</p>
            </section>
          ) : null}
        </div>
      ) : null}

      {/* Phase, Vertrag, Profil in Zahlen */}
      <div className="ag-drei">
        <section className="ag-karte" aria-labelledby="ag-phase-titel">
          <h3 id="ag-phase-titel" className="ag-titel">Passende Unternehmensphase</h3>
          <ol className="ag-phasen liste_ohne">
            {alleStationen.map((s) => {
              const aktiv = a.stationen.includes(s.slug);
              return (
                <li key={s.slug} className="ag-phase" data-aktiv={aktiv ? "ja" : "nein"}>
                  <Link href={`/fahrplan/${s.slug}`} className="ag-phase__link" aria-label={`Station ${s.nummer}: ${s.name}${aktiv ? ", passt laut Profil" : ""}`}>
                    <span className="ag-phase__punkt">{s.nummer}</span>
                    <span className="ag-phase__name">{s.name}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
          <p className="ag-hinweis">Laut Profil passt {a.name} vor allem zu: {aktiveStationen.map((s) => s.name).join(" und ")}.</p>
        </section>

        <section className="ag-karte" aria-labelledby="ag-vertrag-titel">
          <h3 id="ag-vertrag-titel" className="ag-titel">Vertragsflexibilität</h3>
          <div className="ag-vertrag" data-zustand={vertragZustand} role="img" aria-label={vertragZustand === "ja" ? "Monatlich kündbar laut Hersteller" : vertragZustand === "nein" ? "Nicht monatlich kündbar laut Hersteller" : "Kündigungsfrist nicht belegt"}>
            <span data-zeichen="ja"><Icon name="check" groesse={16} />Monatlich kündbar</span>
            <span data-zeichen="nein"><Icon name="warning" groesse={16} />Längere Bindung</span>
            <span data-zeichen="offen">Nicht belegt</span>
          </div>
          {a.vertrag ? <p className="ag-vertrag__text">{a.vertrag}</p> : null}
        </section>

        <section className="ag-karte" aria-labelledby="ag-zahlen-titel">
          <h3 id="ag-zahlen-titel" className="ag-titel">Das Profil in Zahlen</h3>
          <ul className="ag-zahlen liste_ohne">
            {zahlen.map((z, i) => (
              <li key={z.label} className="ag-zahl" style={{ "--i": i } as React.CSSProperties}>
                <span className="ag-zahl__wert">{z.wert}</span>
                <span className="ag-zahl__label">{z.label}</span>
                <span className="ag-zahl__spur" aria-hidden="true">
                  <span className="ag-zahl__fuell" style={{ "--w": `${Math.max(z.wert === 0 ? 0 : 6, (z.wert / z.maximum) * 100)}%` } as React.CSSProperties} />
                </span>
              </li>
            ))}
          </ul>
          <p className="ag-hinweis">Anzahl der belegten Angaben in diesem Profil, Stand {a.geprueft}.</p>
        </section>
      </div>
    </div>
  );
}
