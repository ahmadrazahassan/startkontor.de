"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { Icon } from "@/components/icons";
import { ladeSuchindex } from "@/components/kopf/suche-dialog";
import { sucheEintraege } from "@/lib/suche";
import type { SuchEintrag } from "@/lib/suche";

type Props = {
  platzhalter: string;
  label: string;
  knopf: string;
  keineTreffer: string;
  haeufigLabel: string;
  suchbegriffe: string[];
  /** Reihenfolge der Gruppen, damit Anbieter vor Wissen erscheinen */
  gruppen: string[];
};

/**
 * Suche im Mittelpunkt der Startseite. Ohne JavaScript sendet das Formular die Anfrage an /suche.
 * Mit JavaScript erscheinen beim Tippen Vorschläge aus dem lokalen Suchindex (kein Netzwerkaufruf je Tastendruck).
 */
export function HeroSuche({ platzhalter, label, knopf, keineTreffer, haeufigLabel, suchbegriffe, gruppen }: Props) {
  const id = useId();
  const router = useRouter();
  const eingabeRef = useRef<HTMLInputElement>(null);
  const [anfrage, setAnfrage] = useState("");
  const [offen, setOffen] = useState(false);
  const [aktiv, setAktiv] = useState(-1);
  const [index, setIndex] = useState<SuchEintrag[]>([]);

  useEffect(() => {
    const beiKlick = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest(`[data-herosuche="${id}"]`)) setOffen(false);
    };
    document.addEventListener("pointerdown", beiKlick);
    return () => document.removeEventListener("pointerdown", beiKlick);
  }, [id]);

  const vorschlaege = useMemo(() => {
    const treffer = sucheEintraege(index, anfrage);
    const rang = (g: string) => {
      const i = gruppen.indexOf(g);
      return i === -1 ? 99 : i;
    };
    return [...treffer].sort((a, b) => rang(a.gruppe) - rang(b.gruppe) || b.score - a.score).slice(0, 7);
  }, [index, anfrage, gruppen]);

  useEffect(() => setAktiv(-1), [anfrage]);

  const absenden = (e: FormEvent) => {
    e.preventDefault();
    const gewaehlt = aktiv >= 0 ? vorschlaege[aktiv] : undefined;
    setOffen(false);
    if (gewaehlt) router.push(gewaehlt.url);
    else if (anfrage.trim()) router.push(`/suche?q=${encodeURIComponent(anfrage.trim())}`);
  };

  const beiTaste = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOffen(false);
      return;
    }
    if (vorschlaege.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOffen(true);
      setAktiv((a) => (a + 1) % vorschlaege.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setAktiv((a) => (a <= 0 ? vorschlaege.length - 1 : a - 1));
    }
  };

  const zeigeListe = offen && anfrage.trim().length > 0;
  const optionId = (i: number) => `${id}-opt-${i}`;

  return (
    <div className="herosuche" data-herosuche={id}>
      <form action="/suche" method="get" role="search" className="herosuche__form" onSubmit={absenden}>
        <div className="herosuche__feld">
          <Icon name="search" groesse={24} className="herosuche__lupe" />
          <label htmlFor={`${id}-q`} className="visuell_versteckt">
            {label}
          </label>
          <input
            ref={eingabeRef}
            id={`${id}-q`}
            name="q"
            type="text"
            inputMode="search"
            enterKeyHint="search"
            role="combobox"
            aria-expanded={zeigeListe && vorschlaege.length > 0}
            aria-controls={`${id}-liste`}
            aria-activedescendant={aktiv >= 0 ? optionId(aktiv) : undefined}
            aria-autocomplete="list"
            autoComplete="off"
            spellCheck={false}
            className="herosuche__eingabe"
            placeholder={platzhalter}
            value={anfrage}
            onFocus={() => {
              ladeSuchindex().then(setIndex);
              setOffen(true);
            }}
            onChange={(e) => {
              setAnfrage(e.target.value);
              setOffen(true);
            }}
            onKeyDown={beiTaste}
          />
          <button type="submit" className="knopf knopf_primaer herosuche__knopf">
            <span className="knopf__text">{knopf}</span>
          </button>
        </div>

        {zeigeListe ? (
          <div id={`${id}-liste`} role="listbox" aria-label={label} className="herosuche__liste">
            {vorschlaege.map((v, i) => (
              <Link
                key={v.url}
                id={optionId(i)}
                role="option"
                aria-selected={i === aktiv}
                href={v.url}
                tabIndex={-1}
                className="herosuche__vorschlag"
                onMouseMove={() => setAktiv(i)}
                onClick={() => setOffen(false)}
              >
                <span className="herosuche__titel">{v.titel}</span>
                <span className="herosuche__gruppe">{v.gruppe}</span>
              </Link>
            ))}
            {vorschlaege.length === 0 && index.length > 0 ? <p className="herosuche__leer">{keineTreffer}</p> : null}
          </div>
        ) : null}
      </form>

      <p className="herosuche__haeufig">
        <span className="herosuche__haeufigLabel">{haeufigLabel}</span>
        {suchbegriffe.map((b) => (
          <Link key={b} href={`/suche?q=${encodeURIComponent(b)}`} className="herosuche__chip">
            {b}
          </Link>
        ))}
      </p>
    </div>
  );
}
