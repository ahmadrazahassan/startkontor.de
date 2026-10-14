import { Brotkrumen } from "@/components/brotkrumen";
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
};

function hatInhalt(a: RechtAbschnitt): boolean {
  return (a.absaetze?.length ?? 0) > 0 || (a.liste?.length ?? 0) > 0 || !!a.tabelle;
}

function sammleText(a: RechtAbschnitt): string[] {
  return [a.titel, ...(a.absaetze ?? []), ...(a.liste ?? []), ...(a.tabelle?.zeilen.flat() ?? [])];
}

/**
 * Ruhige Rechtsseite: eine Spalte, 68 Zeichen Breite, keine Karten, keine Dekoration.
 * Abschnitte ohne Inhalt (alle Absätze optional und leer) entfallen samt Überschrift.
 */
export function RechtsSeite({ h1, abschnitte, entwurfHinweis, stand, inhaltLabel }: Props) {
  const sichtbar = abschnitte.filter(hatInhalt);
  const offene = [...new Set(sichtbar.flatMap(sammleText).flatMap(platzhalterIn))];
  const zeigeBanner = process.env.NODE_ENV !== "production" && (entwurfHinweis || offene.length > 0);

  return (
    <>
      <Brotkrumen punkte={[{ label: h1 }]} />
      <header className="seitenkopf huelle">
        <H1 text={h1} />
        {stand ? <p className="rechtsseite__stand">{stand}</p> : null}
      </header>

      <div className="huelle rechtsseite">
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

        <nav className="rechtsseite__inhalt" aria-label={inhaltLabel}>
          <p className="rechtsseite__inhaltstitel">{inhaltLabel}</p>
          <ol>
            {sichtbar.map((a) => (
              <li key={a.id}>
                <a href={`#${a.id}`}>{a.titel}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="rechtsseite__text">
          {sichtbar.map((a) => (
            <section key={a.id} id={a.id} className="rechtsabschnitt sprung_ziel" aria-labelledby={`${a.id}-titel`}>
              <h2 id={`${a.id}-titel`}>{a.titel}</h2>
              {(a.absaetze ?? []).map((p, i) => (
                <p key={`p${i}`} data-offen={hatPlatzhalter(p) ? "ja" : undefined}>
                  <Inline text={p} />
                </p>
              ))}
              {a.liste && a.liste.length > 0 ? (
                <ul className="fliesstext">
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
                          {a.tabelle.spalten.map((s) => (
                            <th key={s} scope="col">
                              {s}
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
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
