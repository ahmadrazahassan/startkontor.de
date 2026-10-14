"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { StatusChipRein } from "@/components/chips-rein";
import { Icon } from "@/components/icons";
import { Inline } from "@/components/inline";
import { berechnePlan, eingabeZuHash, hashZuEingabe } from "@/lib/planer";
import type { PlanerKern, StationKern } from "@/lib/planer";
import type { PlanerEingabe, StatusKey } from "@/lib/typen";

export type PlanerTexte = {
  fortschritt: string; // "Schritt {aktuell} von {gesamt}"
  weiter: string;
  zurueck: string;
  ergebnisUeberschrift: string;
  ergebnisHinweis: string;
  stationLabel: string;
  drucken: string;
  druckenHinweis: string;
  linkKopieren: string;
  linkKopiert: string;
  neuStarten: string;
  vorhandenHinweis: string;
  vorhandenLabel: string;
  bausteinLink: string;
  leitfadenLink: string;
  stationLink: string;
  datenschutz: string;
  statusLabels: Record<StatusKey, string>;
  statusKurz: Record<StatusKey, string>;
};

type Props = {
  planer: PlanerKern;
  stationen: (StationKern & { nummer: number; name: string })[];
  bausteine: { slug: string; name: string; leitfaden: string | null }[];
  texte: PlanerTexte;
};

type Schrittart = "station" | "team" | "rechnungen" | "modell" | "vorhanden";

const LEER: PlanerEingabe = { station: "", team: "", modell: "", vorhanden: [], rechnungen: undefined };

export function Planer({ planer, stationen, bausteine, texte }: Props) {
  const id = useId();
  const [eingabe, setEingabe] = useState<PlanerEingabe>(LEER);
  const [schritt, setSchritt] = useState(0);
  const [ergebnis, setErgebnis] = useState(false);
  const [kopiert, setKopiert] = useState(false);
  const ueberschriftRef = useRef<HTMLHeadingElement>(null);
  const ersterLauf = useRef(true);
  const ausAdresse = useRef(false);

  const reihenfolge: Schrittart[] = useMemo(
    () =>
      eingabe.station === "unsicher"
        ? ["station", "team", "rechnungen", "modell", "vorhanden"]
        : ["station", "team", "modell", "vorhanden"],
    [eingabe.station],
  );
  const aktuelleArt = reihenfolge[Math.min(schritt, reihenfolge.length - 1)];
  const gesamt = reihenfolge.length;

  // Gültiger Hash in der Adresse springt direkt zum Ergebnis
  useEffect(() => {
    const aus = hashZuEingabe(window.location.hash, planer);
    if (aus) {
      ausAdresse.current = true;
      setEingabe({ ...aus });
      setErgebnis(true);
    }
    const beiHash = () => {
      const neu = hashZuEingabe(window.location.hash, planer);
      if (neu) {
        setEingabe({ ...neu });
        setErgebnis(true);
      }
    };
    window.addEventListener("hashchange", beiHash);
    return () => window.removeEventListener("hashchange", beiHash);
  }, [planer]);

  // Fokus auf die neue Frage, wenn sich der Schritt ändert
  useEffect(() => {
    if (ersterLauf.current) {
      ersterLauf.current = false;
      return;
    }
    // Beim Aufruf mit Ergebnis in der Adresse bleibt der Fokus am Seitenanfang
    if (ausAdresse.current) {
      ausAdresse.current = false;
      return;
    }
    ueberschriftRef.current?.focus();
  }, [schritt, ergebnis]);

  const schrittDaten = planer.schritte.find((s) => s.id === aktuelleArt);
  const optionen =
    aktuelleArt === "rechnungen"
      ? planer.stationErmitteln.zusatzfrage.optionen
      : (schrittDaten?.optionen ?? []);
  const frage = aktuelleArt === "rechnungen" ? planer.stationErmitteln.zusatzfrage.frage : schrittDaten?.frage;
  const hilfe = aktuelleArt === "rechnungen" ? undefined : schrittDaten?.hilfe;
  const mehrfach = aktuelleArt === "vorhanden";

  const wert = (art: Schrittart): string | string[] | undefined => {
    switch (art) {
      case "station":
        return eingabe.station;
      case "team":
        return eingabe.team;
      case "modell":
        return eingabe.modell;
      case "rechnungen":
        return eingabe.rechnungen;
      case "vorhanden":
        return eingabe.vorhanden;
    }
  };
  const aktuellerWert = wert(aktuelleArt);
  const gewaehlt = mehrfach ? true : typeof aktuellerWert === "string" && aktuellerWert !== "";

  const setzeWert = (art: Schrittart, v: string) => {
    setEingabe((alt) => {
      if (art === "station") return { ...alt, station: v, rechnungen: v === "unsicher" ? alt.rechnungen : undefined };
      if (art === "team") return { ...alt, team: v };
      if (art === "modell") return { ...alt, modell: v };
      if (art === "rechnungen") return { ...alt, rechnungen: v };
      return alt;
    });
  };

  const schalteVorhanden = (v: string) =>
    setEingabe((alt) => ({
      ...alt,
      vorhanden: alt.vorhanden.includes(v) ? alt.vorhanden.filter((x) => x !== v) : [...alt.vorhanden, v],
    }));

  const weiter = () => {
    if (!gewaehlt) return;
    if (schritt >= gesamt - 1) {
      const hash = eingabeZuHash(eingabe);
      window.history.replaceState(null, "", `#${hash}`);
      setErgebnis(true);
    } else {
      setSchritt(schritt + 1);
    }
  };

  const zurueck = () => setSchritt(Math.max(0, schritt - 1));

  const neuStarten = () => {
    setEingabe(LEER);
    setSchritt(0);
    setErgebnis(false);
    setKopiert(false);
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  };

  const plan = useMemo(() => {
    if (!ergebnis) return null;
    try {
      return berechnePlan(eingabe, stationen, planer);
    } catch {
      return null;
    }
  }, [ergebnis, eingabe, stationen, planer]);

  const kopiere = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#${eingabeZuHash(eingabe)}`);
      setKopiert(true);
      window.setTimeout(() => setKopiert(false), 3000);
    } catch {
      setKopiert(false);
    }
  }, [eingabe]);

  const pfeilTasten = (e: KeyboardEvent<HTMLFieldSetElement>) => {
    if (!mehrfach) return; // Radiogruppen bringen die Pfeiltasten selbst mit
    const felder = Array.from(e.currentTarget.querySelectorAll<HTMLInputElement>("input[type=checkbox]"));
    const i = felder.indexOf(document.activeElement as HTMLInputElement);
    if (i === -1) return;
    let ziel = -1;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") ziel = (i + 1) % felder.length;
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") ziel = (i - 1 + felder.length) % felder.length;
    if (ziel >= 0) {
      e.preventDefault();
      felder[ziel].focus();
    }
  };

  // Ergebnisansicht
  if (ergebnis && plan) {
    const station = stationen.find((s) => s.slug === plan.station);
    const gruppen = (planer.statusReihenfolge.slice().reverse() as StatusKey[])
      .map((status) => ({ status, zeilen: plan.ergebnis.filter((z) => z.status === status) }))
      .filter((g) => g.zeilen.length > 0);
    return (
      <section className="planer planer__ergebnis druckbereich" aria-labelledby={`${id}-ergebnis`}>
        <h2 id={`${id}-ergebnis`} ref={ueberschriftRef} tabIndex={-1} className="planer__ueberschrift">
          {texte.ergebnisUeberschrift}
        </h2>
        <p className="planer__station">
          <span className="planer__stationlabel">{texte.stationLabel}</span>{" "}
          <strong>
            {station?.nummer} {station?.name}
          </strong>
        </p>

        {gruppen.map((g) => (
          <section key={g.status} className="planer__gruppe" aria-labelledby={`${id}-g-${g.status}`}>
            <div className="planer__gruppenkopf">
              <h3 id={`${id}-g-${g.status}`} className="planer__gruppentitel">
                {texte.statusLabels[g.status]}
              </h3>
              <p className="planer__gruppenkurz">{texte.statusKurz[g.status]}</p>
            </div>
            <ul className="planer__liste liste_ohne">
              {g.zeilen.map((z) => {
                const b = bausteine.find((x) => x.slug === z.baustein);
                return (
                  <li key={z.baustein} className="planer__eintrag" data-status={z.status}>
                    <div className="planer__eintragkopf">
                      <h4 className="planer__baustein">{b?.name}</h4>
                      <StatusChipRein status={z.status} label={texte.statusLabels[z.status]} />
                    </div>
                    <p className="planer__grund">
                      <Inline text={plan.gruende[z.baustein]} />
                    </p>
                    {z.vorhanden ? (
                      <p className="planer__vorhanden">
                        <strong>{texte.vorhandenLabel}.</strong> <Inline text={texte.vorhandenHinweis} />
                      </p>
                    ) : null}
                    <ul className="planer__links liste_ohne">
                      <li>
                        <Link href={`/bausteine/${z.baustein}`}>{texte.bausteinLink}</Link>
                      </li>
                      {b?.leitfaden ? (
                        <li>
                          <Link href={`/wissen/leitfaeden/${b.leitfaden}`}>{texte.leitfadenLink}</Link>
                        </li>
                      ) : null}
                      <li>
                        <Link href={`/fahrplan/${plan.station}#${z.baustein}`}>{texte.stationLink}</Link>
                      </li>
                    </ul>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        <p className="planer__hinweis">
          <Inline text={texte.ergebnisHinweis} />
        </p>

        <div className="knopf_gruppe nur_bildschirm">
          <button type="button" className="knopf knopf_primaer" onClick={() => window.print()} aria-describedby={`${id}-druck`}>
            <Icon name="print" groesse={18} />
            <span className="knopf__text">{texte.drucken}</span>
          </button>
          <span id={`${id}-druck`} className="visuell_versteckt">
            {texte.druckenHinweis}
          </span>
          <button type="button" className="knopf knopf_sekundaer" onClick={kopiere}>
            <Icon name="link" groesse={18} />
            <span className="knopf__text">{kopiert ? texte.linkKopiert : texte.linkKopieren}</span>
          </button>
          <button type="button" className="knopf knopf_tertiaer" onClick={neuStarten}>
            <span className="knopf__text">{texte.neuStarten}</span>
          </button>
        </div>
        <p className="visuell_versteckt" role="status" aria-live="polite">
          {kopiert ? texte.linkKopiert : ""}
        </p>
      </section>
    );
  }

  // Eingabeschritte
  const fortschritt = texte.fortschritt.replace("{aktuell}", String(schritt + 1)).replace("{gesamt}", String(gesamt));

  return (
    <section className="planer" aria-label={texte.ergebnisUeberschrift}>
      <div className="planer__fortschritt">
        <p className="planer__schritt">{fortschritt}</p>
        <div className="segmentbalken segmentbalken_planer" aria-hidden="true">
          {Array.from({ length: gesamt }, (_, i) => (
            <span key={i} className="segmentbalken__teil" data-voll={i <= schritt ? "ja" : "nein"} />
          ))}
        </div>
      </div>

      <p className="visuell_versteckt" role="status" aria-live="polite">
        {fortschritt}
      </p>

      <fieldset className="planer__frage" onKeyDown={pfeilTasten}>
        <legend className="planer__legende">
          <h2 ref={ueberschriftRef} tabIndex={-1} className="planer__ueberschrift">
            {frage}
          </h2>
        </legend>
        {hilfe ? <p className="planer__hilfe">{hilfe}</p> : null}

        <div className="kacheln">
          {optionen.map((o) => {
            const inputId = `${id}-${aktuelleArt}-${o.id}`;
            const aktiv = mehrfach ? eingabe.vorhanden.includes(o.id) : aktuellerWert === o.id;
            return (
              <label key={o.id} className="kachel" htmlFor={inputId}>
                <input
                  id={inputId}
                  className="kachel__eingabe"
                  type={mehrfach ? "checkbox" : "radio"}
                  name={`${id}-${aktuelleArt}`}
                  value={o.id}
                  checked={aktiv}
                  onChange={() => (mehrfach ? schalteVorhanden(o.id) : setzeWert(aktuelleArt, o.id))}
                />
                <span className="kachel__inhalt">
                  <span className="kachel__titel">{o.label}</span>
                  {o.text ? <span className="kachel__text">{o.text}</span> : null}
                </span>
                <span className="kachel__marke" aria-hidden="true">
                  <Icon name="check" groesse={16} />
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="planer__aktionen">
        <button type="button" className="knopf knopf_sekundaer" onClick={zurueck} disabled={schritt === 0} aria-disabled={schritt === 0}>
          <Icon name="arrowLeft" groesse={18} />
          <span className="knopf__text">{texte.zurueck}</span>
        </button>
        <button type="button" className="knopf knopf_primaer" onClick={weiter} disabled={!gewaehlt} aria-disabled={!gewaehlt}>
          <span className="knopf__text">{texte.weiter}</span>
          <Icon name="arrowRight" groesse={18} />
        </button>
      </div>

      <p className="planer__datenschutz">
        <Inline text={texte.datenschutz} />
      </p>
    </section>
  );
}

