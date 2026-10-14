import type { Metadata } from "next";
import { Brotkrumen } from "@/components/brotkrumen";
import { Inline } from "@/components/inline";
import { Planer } from "@/components/planer";
import type { PlanerTexte } from "@/components/planer";
import { Seitenkopf } from "@/components/seitenkopf";
import { Illustration } from "@/components/illustration";
import { StatusChip } from "@/components/chips";
import { berechnePlan } from "@/lib/planer";
import { bausteinNachSlug, bausteine, planer, seiten, stationen, ui } from "@/lib/daten";
import { metaFuer } from "@/lib/seo";
import type { PlanerRegel, StatusKey } from "@/lib/typen";

const s = seiten.planer;

export const metadata: Metadata = metaFuer({ seo: s.seo, pfad: "/planer" });

function optionLabel(schrittId: string, id: string): string {
  const o = planer.schritte.find((x) => x.id === schrittId)?.optionen.find((x) => x.id === id);
  return o?.label ?? id;
}

function bedingung(r: PlanerRegel): string {
  const t = ui.abschnitte.planer;
  const teile: string[] = [];
  if (r.wenn.team) teile.push(`${t.bedingungTeam}: ${r.wenn.team.map((x) => optionLabel("team", x)).join("; ")}`);
  if (r.wenn.modell) teile.push(`${t.bedingungModell}: ${r.wenn.modell.map((x) => optionLabel("modell", x)).join("; ")}`);
  if (r.wenn.station) teile.push(`${t.bedingungStation}: ${r.wenn.station.map((x) => optionLabel("station", x)).join("; ")}`);
  return teile.join(". ");
}

function wirkung(r: PlanerRegel): string {
  const t = ui.abschnitte.planer;
  if (r.setze) return `${t.wirkungSetzt} ${planer.statusAnzeige[r.setze].label}`;
  if (r.mindestens) return `${t.wirkungMindestens} ${planer.statusAnzeige[r.mindestens].label}`;
  return "";
}

/** Nur die Felder, die der Planer im Browser braucht. Builder Felder (algorithmus, beschreibung, ergebnisLinks) bleiben draußen. */
const planerKern = {
  statusReihenfolge: planer.statusReihenfolge,
  bausteinReihenfolge: planer.bausteinReihenfolge,
  teamRegeln: planer.teamRegeln,
  modellRegeln: planer.modellRegeln,
  stationErmitteln: planer.stationErmitteln,
  schritte: planer.schritte,
};

export default function PlanerSeite() {
  const t = ui.abschnitte.planer;
  const statusLabels = Object.fromEntries(
    planer.statusReihenfolge.map((k) => [k, planer.statusAnzeige[k].label]),
  ) as Record<StatusKey, string>;
  const statusKurz = Object.fromEntries(
    planer.statusReihenfolge.map((k) => [k, planer.statusAnzeige[k].kurz]),
  ) as Record<StatusKey, string>;

  const texte: PlanerTexte = {
    fortschritt: ui.planer.fortschritt,
    weiter: ui.knoepfe.weiter,
    zurueck: ui.knoepfe.zurueck,
    ergebnisUeberschrift: ui.planer.ergebnisUeberschrift,
    ergebnisHinweis: ui.planer.ergebnisHinweis,
    stationLabel: ui.labels.station,
    drucken: ui.knoepfe.ergebnisDrucken,
    druckenHinweis: ui.barrierefreiheit.druckenHinweis,
    linkKopieren: ui.knoepfe.linkKopieren,
    linkKopiert: ui.knoepfe.linkKopiert,
    neuStarten: ui.knoepfe.neuStarten,
    vorhandenHinweis: planer.vorhandenHinweis,
    vorhandenLabel: String(t.vorhanden),
    bausteinLink: String(t.bausteinLink),
    leitfadenLink: String(t.leitfadenLink),
    stationLink: String(t.stationLink),
    datenschutz: s.datenschutz,
    statusLabels,
    statusKurz,
  };

  const kopf = t.regelnKopf as string[];
  const alleRegeln = [...planer.teamRegeln, ...planer.modellRegeln];

  return (
    <>
      <Brotkrumen punkte={[{ label: s.eyebrow }]} />
      <Seitenkopf
        eyebrow={s.eyebrow}
        titel={s.h1}
        einleitung={s.einleitung}
        rechts={<Illustration motiv="software-planung" sizes="(min-width: 768px) 340px, 260px" />}
      />

      <section className="band_eng planerwerkzeug" aria-label={s.eyebrow}>
        <div className="huelle planerwerkzeug__innen">
          <Planer
            planer={planerKern}
            stationen={stationen.map((st) => ({ slug: st.slug, nummer: st.nummer, name: st.name, bausteine: st.bausteine }))}
            bausteine={bausteine.map((b) => ({ slug: b.slug, name: b.name, leitfaden: b.leitfaeden[0] ?? null }))}
            texte={texte}
          />
        </div>
      </section>

      <section className="band band_weiss" aria-labelledby="transparenz-titel">
        <div className="huelle">
          <div className="startkopf">
            <h2 id="transparenz-titel">
              <Inline text={s.transparenz.titel} />
            </h2>
            <p className="lead">
              <Inline text={s.transparenz.text} />
            </p>
          </div>

          <h3 className="transparenz__titel">{String(t.regeln)}</h3>
          <div className="tabelle">
            <div className="tabelle__huelle" tabIndex={0} role="region" aria-label={String(t.regeln)}>
              <table className="regeltabelle">
                <caption className="visuell_versteckt">{String(t.regeln)}</caption>
                <thead>
                  <tr>
                    {kopf.map((k) => (
                      <th key={k} scope="col">
                        {k}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {alleRegeln.map((r) => (
                    <tr key={r.id}>
                      <th scope="row">{r.id}</th>
                      <td>{bedingung(r)}</td>
                      <td>{bausteinNachSlug.get(r.baustein)?.name}</td>
                      <td>{wirkung(r)}</td>
                      <td>
                        <Inline text={r.grund} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <h3 className="transparenz__titel">{String(t.beispiele)}</h3>
          <div className="beispiele">
            {planer.beispiele.map((b) => {
              const plan = berechnePlan(b.eingabe, stationen, planer);
              const e = b.eingabe;
              return (
                <article key={b.id} className="beispiel">
                  <h4 className="beispiel__titel">{b.titel}</h4>
                  <dl className="beispiel__eingabe">
                    <dt>{String(t.beispielEingabe)}</dt>
                    <dd>
                      {[
                        optionLabel("station", e.station),
                        optionLabel("team", e.team),
                        optionLabel("modell", e.modell),
                        e.vorhanden.length > 0 ? `${t.vorhanden}: ${e.vorhanden.map((x) => optionLabel("vorhanden", x)).join("; ")}` : null,
                      ]
                        .filter(Boolean)
                        .join(". ")}
                    </dd>
                  </dl>
                  <p className="beispiel__label">{String(t.beispielErgebnis)}</p>
                  <ol className="beispiel__ergebnis">
                    {plan.ergebnis.map((z) => (
                      <li key={z.baustein}>
                        <span className="beispiel__baustein">{bausteinNachSlug.get(z.baustein)?.kurzname}</span>
                        <StatusChip status={z.status} />
                      </li>
                    ))}
                  </ol>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
