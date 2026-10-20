"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";
import { betragText, einheitTeile, ersparnisProzent, type Tarifstufe } from "@/lib/analyse";
import { relFuer } from "@/lib/partner";

export type TarifCta = { href: string; werbung: boolean; label: string };

type Props = {
  name: string;
  stufen: Tarifstufe[];
  einheit: string;
  /** Name der Stufe, auf die sich der Einstiegspreis bezieht */
  hervorgehoben: string;
  cta: TarifCta;
};

const euro = (b: number) => `${betragText(b)} €`;

/**
 * Tarifkarten im dunklen Stil: Name, großer Preis, Knopf und Checkliste.
 * Der Umschalter für jährliche Zahlung erscheint nur, wenn der Hersteller beide Beträge nennt.
 * Alle Beträge und Merkmale stammen aus data/tarife.json und sind gegen den Profiltext getestet.
 */
export function PreisTarife({ name, stufen, einheit, hervorgehoben, cta }: Props) {
  const hatJahr = stufen.some((s) => s.jaehrlich !== undefined);
  const [jahr, setJahr] = useState(false);
  const zeigeJahr = hatJahr && jahr;
  const { einheit: haupt, zusatz } = einheitTeile(einheit);
  const bestErsparnis = Math.max(0, ...stufen.map((s) => ersparnisProzent(s) ?? 0));

  return (
    <div className="tp-inhalt">
      {hatJahr ? (
        <div className="tp-umschalter" role="group" aria-label="Zahlungsweise">
          <button type="button" className="tp-umschalter__text" aria-pressed={!jahr} onClick={() => setJahr(false)}>Monatlich</button>
          <button type="button" role="switch" aria-checked={jahr} aria-label="Jährliche Zahlung anzeigen" className="tp-schalter" onClick={() => setJahr(!jahr)}>
            <span className="tp-schalter__knopf" />
          </button>
          <button type="button" className="tp-umschalter__text" aria-pressed={jahr} onClick={() => setJahr(true)}>Jährlich</button>
          {bestErsparnis > 0 ? <span className="tp-umschalter__chip">bis zu {bestErsparnis} % günstiger</span> : null}
        </div>
      ) : null}

      <div className="tp-raster" data-anzahl={stufen.length}>
        {stufen.map((s) => {
          const hervor = s.name === hervorgehoben;
          const betrag = zeigeJahr && s.jaehrlich !== undefined ? s.jaehrlich : s.betrag;
          const ersparnis = zeigeJahr ? ersparnisProzent(s) : null;
          const punkte = s.merkmale?.length ? s.merkmale : s.zusatz ? [s.zusatz] : [];
          const notiz = zeigeJahr && s.jaehrlich !== undefined ? "bei jährlicher Zahlung, je Monat gerechnet" : zusatz;
          return (
            <article key={s.name} className={hervor ? "tp-karte tp-karte_hervor" : "tp-karte"}>
              <header className="tp-karte__kopf">
                <h3 className="tp-karte__name">{s.name}</h3>
                {hervor ? <span className="tp-chip">Einstieg</span> : null}
              </header>

              <p className="tp-preis">
                {s.ab ? <span className="tp-preis__ab">ab</span> : null}
                <span className="tp-preis__zahl">{euro(betrag)}</span>
                <span className="tp-preis__einheit">{haupt}</span>
              </p>
              <p className="tp-karte__notiz">
                {ersparnis ? <><s>{euro(s.betrag)}</s> <b>{ersparnis} % günstiger</b></> : notiz || " "}
              </p>

              <div className="tp-knopf">
                <a
                  href={cta.href}
                  target="_blank"
                  rel={relFuer(cta.werbung)}
                  className={hervor ? "knopf knopf_primaer knopf_breit" : "knopf knopf_sekundaer knopf_breit"}
                  aria-label={`${cta.werbung ? "Werbung: " : ""}${name}, ${s.name}: ${cta.label} (neuer Tab)`}
                >
                  <span className="knopf__text">{cta.label}</span>
                  <Icon name="external" groesse={16} />
                </a>
                <span className="tp-knopf__werbung">{cta.werbung ? "Werbung" : " "}</span>
              </div>

              {punkte.length > 0 ? (
                <ul className="tp-liste liste_ohne">
                  {punkte.slice(0, 5).map((m) => (
                    <li key={m}>
                      <Icon name="check" groesse={18} />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
