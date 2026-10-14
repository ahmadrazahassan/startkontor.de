"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { Icon } from "@/components/icons";
import { Inline } from "@/components/inline";

export type CheckpunktDaten = { text: string; hinweis?: string };
export type CheckGruppe = { titel: string; punkte: CheckpunktDaten[] };

export type CheckTexte = {
  /** enthält {gesamt} */
  fortschritt: string;
  merken: string;
  zuruecksetzen: string;
  speicherHinweis: string;
  drucken: string;
  druckenHinweis: string;
  druckKopf: string;
  stand: string;
  eigeneSeite?: { href: string; label: string };
};

const SCHLUESSEL = (id: string) => `startkontor:checkliste:${id}`;

function lies(id: string): string[] | null {
  try {
    const roh = window.localStorage.getItem(SCHLUESSEL(id));
    if (!roh) return null;
    const wert = JSON.parse(roh) as unknown;
    return Array.isArray(wert) ? wert.filter((x): x is string => typeof x === "string") : null;
  } catch {
    return null;
  }
}

function schreibe(id: string, werte: string[] | null): boolean {
  try {
    if (werte === null) window.localStorage.removeItem(SCHLUESSEL(id));
    else window.localStorage.setItem(SCHLUESSEL(id), JSON.stringify(werte));
    return true;
  } catch {
    return false;
  }
}

/**
 * Interaktive Checkliste. Nichts wird gespeichert, solange die Person nicht ausdrücklich
 * "Stand auf diesem Gerät merken" wählt. Alle Speicherzugriffe sind abgesichert.
 */
export function Checkliste({
  id,
  titel,
  gruppen,
  texte,
  ueberschriftEbene = 2,
  titelSichtbar = true,
}: {
  id: string;
  titel: string;
  gruppen: CheckGruppe[];
  texte: CheckTexte;
  ueberschriftEbene?: 2 | 3;
  /** Auf der eigenen Checklistenseite steht der Titel schon als H1. Dann bleibt er nur für Screenreader. */
  titelSichtbar?: boolean;
}) {
  const basis = useId();
  const [erledigt, setErledigt] = useState<Set<string>>(new Set());
  const [gespeichert, setGespeichert] = useState(false);

  const punktId = (gi: number, pi: number) => `${gi}-${pi}`;
  const gesamt = gruppen.reduce((s, g) => s + g.punkte.length, 0);

  useEffect(() => {
    const gelesen = lies(id);
    if (gelesen) {
      setErledigt(new Set(gelesen));
      setGespeichert(true);
    }
  }, [id]);

  // Ist der Stand gemerkt, folgt jede Änderung automatisch
  useEffect(() => {
    if (gespeichert) schreibe(id, [...erledigt]);
  }, [erledigt, gespeichert, id]);

  const umschalten = (pid: string) => {
    setErledigt((alt) => {
      const neu = new Set(alt);
      if (neu.has(pid)) neu.delete(pid);
      else neu.add(pid);
      return neu;
    });
  };

  const Kopf = ueberschriftEbene === 2 ? "h2" : "h3";
  const GruppenKopf = ueberschriftEbene === 2 ? "h3" : "h4";
  const anzahl = erledigt.size;
  const text = texte.fortschritt.replace("{gesamt}", String(gesamt));

  return (
    <section className="checkliste druckbereich" aria-labelledby={`${basis}-titel`}>
      <div className="nur_druck checkliste__druckkopf">
        <p className="checkliste__druckmarke">{texte.druckKopf}</p>
        <p>{texte.stand}</p>
      </div>

      <div className="checkliste__kopf">
        <Kopf id={`${basis}-titel`} className={titelSichtbar ? "checkliste__titel" : "checkliste__titel visuell_versteckt"}>
          {titel}
        </Kopf>
        <div className="checkliste__fortschritt" role="group" aria-label={text}>
          <p className="checkliste__zaehler" aria-live="polite">
            <strong>{anzahl}</strong> {text}
          </p>
          <div className="segmentbalken" aria-hidden="true" style={{ ["--segmente" as string]: gesamt }}>
            {Array.from({ length: gesamt }, (_, i) => (
              <span key={i} className="segmentbalken__teil" data-voll={i < anzahl ? "ja" : "nein"} />
            ))}
          </div>
        </div>
      </div>

      {gruppen.map((g, gi) => (
        <fieldset key={g.titel} className="checkliste__gruppe">
          <legend>
            <GruppenKopf className="checkliste__gruppentitel">{g.titel}</GruppenKopf>
          </legend>
          <ul className="checkliste__liste liste_ohne">
            {g.punkte.map((p, pi) => {
              const pid = punktId(gi, pi);
              const feldId = `${basis}-${pid}`;
              return (
                <li key={pid} className="checkliste__punkt">
                  <label className="haken" htmlFor={feldId}>
                    <input
                      id={feldId}
                      type="checkbox"
                      className="haken__eingabe"
                      checked={erledigt.has(pid)}
                      onChange={() => umschalten(pid)}
                      aria-describedby={p.hinweis ? `${feldId}-hinweis` : undefined}
                    />
                    <span className="haken__box" aria-hidden="true">
                      <Icon name="check" groesse={18} />
                    </span>
                    <span className="haken__text checkliste__text">
                      <Inline text={p.text} />
                    </span>
                  </label>
                  {p.hinweis ? (
                    <p id={`${feldId}-hinweis`} className="checkliste__hinweis">
                      <Inline text={p.hinweis} />
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </fieldset>
      ))}

      <div className="checkliste__aktionen nur_bildschirm">
        <div className="knopf_gruppe">
          <button
            type="button"
            className="knopf knopf_primaer knopf_klein"
            onClick={() => {
              if (schreibe(id, [...erledigt])) setGespeichert(true);
            }}
            disabled={gespeichert}
            aria-disabled={gespeichert}
          >
            <span className="knopf__text">{texte.merken}</span>
          </button>
          <button
            type="button"
            className="knopf knopf_sekundaer knopf_klein"
            onClick={() => {
              setErledigt(new Set());
              schreibe(id, null);
              setGespeichert(false);
            }}
          >
            <span className="knopf__text">{texte.zuruecksetzen}</span>
          </button>
          <button
            type="button"
            className="knopf knopf_sekundaer knopf_klein druck_sichtbar"
            onClick={() => window.print()}
            aria-describedby={`${basis}-druckhinweis`}
          >
            <Icon name="print" groesse={18} />
            <span className="knopf__text">{texte.drucken}</span>
          </button>
          <span id={`${basis}-druckhinweis`} className="visuell_versteckt">
            {texte.druckenHinweis}
          </span>
        </div>
        <p className="checkliste__speicher">{texte.speicherHinweis}</p>
        {texte.eigeneSeite ? (
          <p className="checkliste__eigene">
            <Link href={texte.eigeneSeite.href} className="ohne_druckadresse">
              {texte.eigeneSeite.label}
            </Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}
