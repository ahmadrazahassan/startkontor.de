import type { CSSProperties } from "react";
import { Checkliste } from "@/components/checkliste";
import { Icon } from "@/components/icons";
import { Inline } from "@/components/inline";
import { wlStil } from "@/components/wort-stil";
import { TabelleHuelle } from "@/components/tabelle";
import { checkTexteFuer } from "@/lib/checkliste-texte";
import { getCheckliste, ui } from "@/lib/daten";
import type { Block } from "@/lib/typen";

/**
 * Renderer für die Blöcke eines Leitfadens. Unbekannte Typen brechen den Build ab (siehe lib/daten.ts).
 * nummeriert: Blöcke mit "start" setzen die Zählung fort.
 */
export function ArtikelBloecke({ bloecke, ids }: { bloecke: Block[]; ids: Map<number, { id: string; nummer: string }> }) {
  return (
    <div className="artikel__body fliesstext">
      {bloecke.map((b, i) => {
        switch (b.typ) {
          case "zwischentitel": {
            const z = ids.get(i);
            return (
              <h2 key={i} id={z?.id} className="artikel__h2 sprung_ziel" style={wlStil(b.text)}>
                <span className="artikel__nr" data-ziffer={z?.nummer} aria-hidden="true" />
                <span>
                  <Inline text={b.text} />
                </span>
              </h2>
            );
          }
          case "absatz":
            return (
              <p key={i}>
                <Inline text={b.text} />
              </p>
            );
          case "tabelle":
            return (
              <div key={i}>
                <TabelleHuelle beschriftung={b.titel}>
                  <table>
                    <caption>
                      <Inline text={b.titel} />
                    </caption>
                    <thead>
                      <tr>
                        {b.spalten.map((s) => (
                          <th key={s} scope="col">
                            <Inline text={s} />
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {b.zeilen.map((zeile, zi) => (
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
                </TabelleHuelle>
                {b.hinweis ? (
                  <p className="tabelle__fussnote">
                    <Inline text={b.hinweis} />
                  </p>
                ) : null}
              </div>
            );
          case "liste":
            return (
              <ul key={i}>
                {b.eintraege.map((e, ei) => (
                  <li key={ei}>
                    <Inline text={e} />
                  </li>
                ))}
              </ul>
            );
          case "nummeriert": {
            const start = b.start ?? 1;
            return (
              <ol key={i} className="nummeriert" style={{ counterReset: `nr ${start - 1}` } as CSSProperties}>
                {b.eintraege.map((e, ei) => (
                  <li key={ei}>
                    <Inline text={e} />
                  </li>
                ))}
              </ol>
            );
          }
          case "hinweis":
            return (
              <aside key={i} className="randnotiz">
                <p className="randnotiz__label">{ui.labels.hinweis}</p>
                <p className="randnotiz__titel">
                  <Inline text={b.titel} />
                </p>
                <p>
                  <Inline text={b.text} />
                </p>
              </aside>
            );
          case "achtung":
            return (
              <aside key={i} className="achtung">
                <p className="achtung__label">
                  <Icon name="warning" groesse={20} />
                  <span>{ui.labels.achtung}</span>
                </p>
                <p className="achtung__titel">
                  <Inline text={b.titel} />
                </p>
                <p>
                  <Inline text={b.text} />
                </p>
              </aside>
            );
          case "merksatz":
            return (
              <blockquote key={i} className="merksatz">
                <p className="merksatz__label">{ui.labels.merksatz}</p>
                <p className="merksatz__text">
                  <Inline text={b.text} />
                </p>
              </blockquote>
            );
          case "checkliste": {
            const c = getCheckliste(b.id);
            return (
              <div key={i} className="artikel__checkliste">
                <Checkliste
                  id={c.id}
                  titel={c.titel}
                  gruppen={c.gruppen}
                  texte={checkTexteFuer(c.slug, true)}
                  ueberschriftEbene={3}
                />
              </div>
            );
          }
        }
      })}
    </div>
  );
}
