"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { SUCHE_EREIGNIS } from "@/components/kopf/suche-knopf";
import { gruppiere, sucheEintraege } from "@/lib/suche";
import type { SuchEintrag } from "@/lib/suche";

export type SucheTexte = {
  platzhalter: string;
  ueberschrift: string;
  keineTreffer: string;
  tastaturHinweis: string;
  schliessen: string;
};

let indexCache: SuchEintrag[] | null = null;
let indexLaeuft: Promise<SuchEintrag[]> | null = null;

export function ladeSuchindex(): Promise<SuchEintrag[]> {
  if (indexCache) return Promise.resolve(indexCache);
  if (!indexLaeuft) {
    indexLaeuft = fetch("/suche-index.json", { credentials: "same-origin" })
      .then((r) => (r.ok ? (r.json() as Promise<SuchEintrag[]>) : []))
      .catch(() => [] as SuchEintrag[])
      .then((daten) => {
        indexCache = daten;
        return daten;
      });
  }
  return indexLaeuft;
}

export function SucheDialog({ texte, gruppen }: { texte: SucheTexte; gruppen: string[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const eingabeRef = useRef<HTMLInputElement>(null);
  const listeRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const router = useRouter();
  const pfad = usePathname();
  const [index, setIndex] = useState<SuchEintrag[]>([]);
  const [anfrage, setAnfrage] = useState("");
  const [aktiv, setAktiv] = useState(0);

  const treffer = useMemo(() => gruppiere(sucheEintraege(index, anfrage), gruppen), [index, anfrage, gruppen]);
  const flach = useMemo(() => treffer.flatMap((g) => g.treffer), [treffer]);

  const oeffnen = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    ladeSuchindex().then(setIndex);
    window.requestAnimationFrame(() => eingabeRef.current?.focus());
  }, []);

  const schliessen = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  useEffect(() => {
    const beiTaste = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        oeffnen();
      }
    };
    window.addEventListener("keydown", beiTaste);
    window.addEventListener(SUCHE_EREIGNIS, oeffnen);
    return () => {
      window.removeEventListener("keydown", beiTaste);
      window.removeEventListener(SUCHE_EREIGNIS, oeffnen);
    };
  }, [oeffnen]);

  // Seitenwechsel schließt den Dialog
  useEffect(() => {
    dialogRef.current?.close();
  }, [pfad]);

  useEffect(() => {
    setAktiv(0);
  }, [anfrage]);

  useEffect(() => {
    const el = listeRef.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    el?.scrollIntoView({ block: "nearest" });
  }, [aktiv, treffer]);

  const optionId = (i: number) => `${id}-option-${i}`;

  const beiTaste = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      schliessen();
      return;
    }
    if (flach.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAktiv((a) => (a + 1) % flach.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setAktiv((a) => (a - 1 + flach.length) % flach.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const ziel = flach[aktiv];
      if (ziel) {
        schliessen();
        router.push(ziel.url);
      }
    }
  };

  let laufend = -1;

  return (
    <dialog
      ref={dialogRef}
      className="suchdialog"
      aria-labelledby={`${id}-titel`}
      onClose={() => setAnfrage("")}
      onClick={(e) => {
        if (e.target === dialogRef.current) schliessen();
      }}
    >
      <div className="suchdialog__innen">
        <div className="suchdialog__kopf">
          <h2 id={`${id}-titel`} className="visuell_versteckt">
            {texte.ueberschrift}
          </h2>
          <Icon name="search" groesse={22} className="suchdialog__lupe" />
          <input
            ref={eingabeRef}
            type="text"
            inputMode="search"
            role="combobox"
            className="suchdialog__eingabe"
            placeholder={texte.platzhalter}
            aria-label={texte.platzhalter}
            aria-expanded={flach.length > 0}
            aria-controls={`${id}-liste`}
            aria-activedescendant={flach.length > 0 ? optionId(aktiv) : undefined}
            aria-autocomplete="list"
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="go"
            value={anfrage}
            onChange={(e) => setAnfrage(e.target.value)}
            onKeyDown={beiTaste}
          />
          <button type="button" className="suchdialog__zu" onClick={schliessen} aria-label={texte.schliessen}>
            <Icon name="close" groesse={22} />
          </button>
        </div>

        <div ref={listeRef} id={`${id}-liste`} role="listbox" aria-label={texte.ueberschrift} className="suchdialog__liste">
          {treffer.map((g, gi) => (
            <div key={g.gruppe} role="group" aria-labelledby={`${id}-gruppe-${gi}`} className="suchdialog__gruppe">
              <div id={`${id}-gruppe-${gi}`} className="suchdialog__gruppentitel">
                {g.gruppe}
              </div>
              {g.treffer.map((t) => {
                laufend += 1;
                const i = laufend;
                return (
                  <Link
                    key={t.url}
                    id={optionId(i)}
                    role="option"
                    aria-selected={i === aktiv}
                    href={t.url}
                    tabIndex={-1}
                    className="suchdialog__treffer"
                    onMouseMove={() => setAktiv(i)}
                    onClick={schliessen}
                  >
                    <span className="suchdialog__trefferTitel">{t.titel}</span>
                    {t.kurz ?? t.snippet ? <span className="suchdialog__trefferText">{t.kurz ?? t.snippet}</span> : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {anfrage.trim() !== "" && flach.length === 0 ? (
          <p className="suchdialog__leer" role="status">
            {texte.keineTreffer}
          </p>
        ) : null}

        <p className="suchdialog__hinweis">{texte.tastaturHinweis}</p>
      </div>
    </dialog>
  );
}
