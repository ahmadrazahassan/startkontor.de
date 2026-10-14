"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { SucheKnopf } from "@/components/kopf/suche-knopf";

export type MobilPunkt = {
  label: string;
  href: string;
  beschreibung: string;
  unterpunkte?: { nummer?: number; titel: string; href: string }[];
};

type Props = {
  markenname: string;
  startseite: string;
  punkte: MobilPunkt[];
  aktion: { label: string; href: string };
  sucheLabel: string;
  texte: { oeffnen: string; schliessen: string; beschriftung: string; aktuelleSeite: string };
};

export function MobilMenue({ markenname, startseite, punkte, aktion, sucheLabel, texte }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const pfad = usePathname();
  const [offen, setOffen] = useState(false);

  useEffect(() => {
    ref.current?.close();
  }, [pfad]);

  // Wird die Ansicht auf Desktop verbreitert, schließt sich das Vollbildmenü
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const beiAenderung = () => {
      if (mq.matches) ref.current?.close();
    };
    mq.addEventListener("change", beiAenderung);
    return () => mq.removeEventListener("change", beiAenderung);
  }, []);

  return (
    <>
      <button
        type="button"
        className="menueknopf"
        aria-haspopup="dialog"
        aria-expanded={offen}
        aria-controls={id}
        aria-label={texte.oeffnen}
        onClick={() => {
          ref.current?.showModal();
          setOffen(true);
        }}
      >
        <Icon name="menu" groesse={24} />
      </button>

      <dialog
        ref={ref}
        id={id}
        className="menue_dialog"
        aria-label={texte.beschriftung}
        onClose={() => setOffen(false)}
      >
        <div className="menue_dialog__kopf huelle">
          <Logo name={markenname} beschriftung={startseite} />
          <button
            type="button"
            className="menueknopf"
            aria-label={texte.schliessen}
            onClick={() => ref.current?.close()}
          >
            <Icon name="close" groesse={24} />
          </button>
        </div>

        <nav className="menue_dialog__nav huelle" aria-label={texte.beschriftung}>
          <ol className="menue_dialog__liste">
            {punkte.map((p, i) => (
              <li key={p.href} className="menue_dialog__punkt">
                <Link
                  href={p.href}
                  className="menue_dialog__link"
                  aria-current={pfad === p.href ? "page" : undefined}
                >
                  <span className="menue_dialog__nummer" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="menue_dialog__label">{p.label}</span>
                </Link>
                {p.unterpunkte ? (
                  <ol className="menue_dialog__stationen">
                    {p.unterpunkte.map((u) => (
                      <li key={u.href}>
                        <Link
                          href={u.href}
                          className="menue_dialog__station"
                          aria-current={pfad === u.href ? "page" : undefined}
                        >
                          {u.nummer ? <span className="menue_dialog__stationsnummer" aria-hidden="true">{u.nummer}</span> : null}
                          <span>{u.titel}</span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                ) : null}
              </li>
            ))}
          </ol>
        </nav>

        <div className="menue_dialog__leiste">
          <SucheKnopf label={sucheLabel} variante="mobil" />
          <Link href={aktion.href} className="knopf knopf_primaer knopf_breit">
            <span className="knopf__text">{aktion.label}</span>
          </Link>
        </div>
      </dialog>
    </>
  );
}
