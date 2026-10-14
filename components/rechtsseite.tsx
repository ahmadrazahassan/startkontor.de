import Link from "next/link";
import { Brotkrumen } from "@/components/brotkrumen";
import { Icon } from "@/components/icons";
import { Illustration, type MotivId } from "@/components/illustration";
import { H1 } from "@/components/h1";
import { Inline } from "@/components/inline";
import { hatPlatzhalter, platzhalterIn } from "@/lib/platzhalter";
import type { RechtAbschnitt } from "@/lib/typen";

type Props = {
  h1: string;
  abschnitte: RechtAbschnitt[];
  /** nur Entwicklung: gelber Hinweis aus den Daten */
  entwurfHinweis?: string;
  /** z. B. "Stand: 13. Oktober 2026" */
  stand?: string;
  inhaltLabel: string;
  eyebrow: string;
  lead: string;
  motiv: MotivId;
  schluss: string;
};

function hatInhalt(a: RechtAbschnitt): boolean {
  return (a.absaetze?.length ?? 0) > 0 || (a.liste?.length ?? 0) > 0 || !!a.tabelle;
}

function sammleText(a: RechtAbschnitt): string[] {
  return [a.titel, ...(a.absaetze ?? []), ...(a.liste ?? []), ...(a.tabelle?.zeilen.flat() ?? [])];
}

/**
 * Rechtsseite im Stil einer ruhigen Redaktionsseite: große Überschrift, Bildfläche, Inhaltsleiste mit unterstrichenen
 * Marken, Abschnitte mit Marke links und Text rechts, am Ende ein Kontaktband.
 * Abschnitte ohne Inhalt (alle Absätze optional und leer) entfallen samt Überschrift.
 */
export function RechtsSeite({ h1, abschnitte, entwurfHinweis, stand, inhaltLabel, eyebrow, lead, motiv, schluss }: Props) {
  const sichtbar = abschnitte.filter(hatInhalt);
  const offene = [...new Set(sichtbar.flatMap(sammleText).flatMap(platzhalterIn))];
  const zeigeBanner = process.env.NODE_ENV !== "production" && (entwurfHinweis || offene.length > 0);

  return (
    <>
      <Brotkrumen punkte={[{ label: h1 }]} />
      <header className="rv-kopf huelle">
        <p className="rv-eyebrow"><span className="rv-punkt" aria-hidden="true" />{eyebrow}</p>
        <H1 text={h1} className="rv-titel" />
        <div className="rv-kopf__unten">
          <p className="rv-lead">{lead}</p>
          {stand ? <p className="rv-stand">{stand}</p> : null}
        </div>
      </header>

      <div className="huelle">
        <div className="rv-flaeche">
          <Illustration motiv={motiv} sizes="(min-width: 768px) 320px, 240px" symbolbild />
        </div>
      </div>

      <div className="huelle rv">
        {zeigeBanner ? (
          <div className="entwurf_banner" role="note">
            {entwurfHinweis ? <p>{entwurfHinweis}</p> : null}
            {offene.length > 0 ? (
              <>
                <p>
                  <strong>Offene Platzhalter ({offene.length}):</strong>
                </p>
                <ul>
                  {offene.map((k) => (
                    <li key={k}>
                      <code>{`{{${k}}}`}</code>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        ) : null}

        <nav className="rv-inhalt" aria-label={inhaltLabel}>
          <p className="rv-marke">{inhaltLabel}</p>
          <ol>
            {sichtbar.map((a) => (
              <li key={a.id}>
                <a href={`#${a.id}`}>{a.titel}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="rv-abschnitte">
          {sichtbar.map((a) => (
            <section key={a.id} id={a.id} className="rv-abschnitt sprung_ziel" aria-labelledby={`${a.id}-titel`}>
              <h2 id={`${a.id}-titel`} className="rv-marke rv-marke_unterstrichen">{a.titel}</h2>
              <div className="rv-text">
                {(a.absaetze ?? []).map((p, i) => (
                  <p key={`p${i}`} data-offen={hatPlatzhalter(p) ? "ja" : undefined}>
                    <Inline text={p} />
                  </p>
                ))}
                {a.liste && a.liste.length > 0 ? (
                  <ul className="rv-liste">
                    {a.liste.map((l, i) => (
                      <li key={i}>
                        <Inline text={l} />
                      </li>
                    ))}
                  </ul>
                ) : null}
                {a.tabelle ? (
                  <div className="tabelle">
                    <div className="tabelle__huelle" tabIndex={0} role="region" aria-label={a.titel}>
                      <table>
                        <thead>
                          <tr>
                            {a.tabelle.spalten.map((sp) => (
                              <th key={sp} scope="col">
                                {sp}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {a.tabelle.zeilen.map((zeile, zi) => (
                            <tr key={zi}>
                              {zeile.map((zelle, ci) =>
                                ci === 0 ? (
                                  <th key={ci} scope="row">
                                    <Inline text={zelle} />
                                  </th>
                                ) : (
                                  <td key={ci}>
                                    <Inline text={zelle} />
                                  </td>
                                ),
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
          ))}
        </div>
      </div>

      <section className="rv-schluss" aria-label="Kontakt">
        <div className="huelle rv-schluss__innen">
          <p className="rv-schluss__text">{schluss}</p>
          <Link href="/kontakt" className="rv-link">
            Kontakt aufnehmen
            <Icon name="arrowRight" groesse={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
