"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { Strecke } from "@/components/strecke";

export type PanelEintrag = { nummer?: number; titel: string; text: string; href: string };

export type NavPunktDaten = {
  label: string;
  href: string;
  aktivePfade?: string[];
  beschreibung: string;
  art: "fahrplan" | "bausteine" | "wissen" | "redaktion" | "direkt";
  kinder: PanelEintrag[];
};

type Props = {
  punkte: NavPunktDaten[];
  /** Beschriftung des Links unter der Strecke im Fahrplan Panel */
  fahrplanOeffnen: string;
  beschriftung: string;
  aktuelleSeite: string;
};

function istAktuell(pfad: string, href: string): boolean {
  return pfad === href || pfad.startsWith(`${href}/`);
}

export function HauptNav({ punkte, fahrplanOeffnen, beschriftung, aktuelleSeite }: Props) {
  const pfad = usePathname();
  const basisId = useId();
  const [offen, setOffen] = useState<string | null>(null);
  const herkunft = useRef<"hover" | "klick" | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const navRef = useRef<HTMLElement>(null);

  const schliesse = useCallback(() => {
    window.clearTimeout(timer.current);
    herkunft.current = null;
    setOffen(null);
  }, []);

  useEffect(() => {
    schliesse();
  }, [pfad, schliesse]);

  useEffect(() => {
    const beiZeiger = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) schliesse();
    };
    document.addEventListener("pointerdown", beiZeiger);
    return () => document.removeEventListener("pointerdown", beiZeiger);
  }, [schliesse]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const planeOeffnen = (id: string) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      herkunft.current = "hover";
      setOffen(id);
    }, 120);
  };

  const planeSchliessen = () => {
    window.clearTimeout(timer.current);
    if (herkunft.current === "klick") return;
    timer.current = window.setTimeout(() => {
      herkunft.current = null;
      setOffen(null);
    }, 200);
  };

  const beiTaste = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && offen) {
      const knopf = navRef.current?.querySelector<HTMLElement>(`[data-knopf="${offen}"]`);
      schliesse();
      knopf?.focus();
    }
  };

  const beiFokusVerlust = (e: React.FocusEvent) => {
    if (offen && herkunft.current !== "hover" && !navRef.current?.contains(e.relatedTarget as Node | null)) {
      schliesse();
    }
  };

  return (
    <nav
      ref={navRef}
      className="hauptnav"
      aria-label={beschriftung}
      onKeyDown={beiTaste}
      onBlur={beiFokusVerlust}
    >
      <ul className="hauptnav__liste">
        {punkte.map((p, index) => {
          const id = `${basisId}-punkt-${index}`;
          const panelId = `${id}-panel`;
          const aktuell = (p.aktivePfade ?? [p.href]).some((href) => istAktuell(pfad, href));
          const istOffen = offen === p.label;

          if (p.art === "direkt") {
            return (
              <li key={p.label} className="hauptnav__punkt" data-aktuell={aktuell ? "ja" : undefined}>
                <Link
                  href={p.href}
                  className="hauptnav__link"
                  aria-current={pfad === p.href ? "page" : undefined}
                >
                  {p.label}
                </Link>
              </li>
            );
          }

          return (
            <li
              key={p.label}
              className="hauptnav__punkt"
              data-aktuell={aktuell ? "ja" : undefined}
              onPointerEnter={(e) => e.pointerType === "mouse" && planeOeffnen(p.label)}
              onPointerLeave={(e) => e.pointerType === "mouse" && planeSchliessen()}
            >
              <button
                type="button"
                id={id}
                data-knopf={p.label}
                className="hauptnav__knopf"
                aria-expanded={istOffen}
                aria-controls={panelId}
                onClick={() => {
                  window.clearTimeout(timer.current);
                  if (istOffen && herkunft.current === "klick") {
                    schliesse();
                  } else {
                    herkunft.current = "klick";
                    setOffen(p.label);
                  }
                }}
              >
                <span>{p.label}</span>
                <Icon name="chevronDown" groesse={16} className="hauptnav__pfeil" />
                {aktuell ? <span className="visuell_versteckt"> ({aktuelleSeite})</span> : null}
              </button>

              <div
                id={panelId}
                role="region"
                aria-labelledby={id}
                className="hauptnav__panel"
                data-art={p.art}
                data-offen={istOffen ? "ja" : "nein"}
              >
                <div className="huelle hauptnav__panelinnen">
                  {p.art === "fahrplan" ? (
                    <>
                      <Strecke
                        variante="menue"
                        vertikalMobil={false}
                        beschriftung={p.label}
                        halte={p.kinder.map((k) => ({
                          schluessel: k.href,
                          nummer: k.nummer,
                          titel: k.titel,
                          text: k.text,
                          href: k.href,
                          zustand: "neutral" as const,
                        }))}
                      />
                      <div className="hauptnav__fuss">
                        <p className="hauptnav__beschreibung">{p.beschreibung}</p>
                        <Link href={p.href} className="knopf knopf_sekundaer knopf_klein">
                          <span className="knopf__text">{fahrplanOeffnen}</span>
                          <Icon name="arrowRight" groesse={18} />
                        </Link>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="hauptnav__kopf">
                        <Link
                          href={p.href}
                          className="hauptnav__sektion"
                          aria-current={pfad === p.href ? "page" : undefined}
                        >
                          <span>{p.label}</span>
                          <Icon name="arrowRight" groesse={18} />
                        </Link>
                        <p className="hauptnav__beschreibung">{p.beschreibung}</p>
                      </div>
                      <ul className="hauptnav__eintraege" data-anzahl={p.kinder.length}>
                        {p.kinder.map((k) => (
                          <li key={k.href}>
                            <Link
                              href={k.href}
                              className="hauptnav__eintrag"
                              aria-current={pfad === k.href ? "page" : undefined}
                            >
                              {k.nummer !== undefined ? (
                                <span className="hauptnav__nummer" data-ziffer={k.nummer} aria-hidden="true" />
                              ) : null}
                              <span className="hauptnav__eintragTitel">{k.titel}</span>
                              <span className="hauptnav__eintragText">{k.text}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
