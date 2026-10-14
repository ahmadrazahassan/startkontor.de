"use client";

import { useEffect, useRef, useState } from "react";

export type Produktpunkt = { id: string; titel: string };

/**
 * Tab Leiste der Review Seite: klebt unter dem Kopf, springt per Anker zu den Abschnitten und markiert den
 * Abschnitt, der gerade im Blick ist. Ohne JavaScript bleiben es normale Ankerlinks.
 */
export function Produktnavigation({ punkte, beschriftung }: { punkte: Produktpunkt[]; beschriftung: string }) {
  const [aktiv, setAktiv] = useState(punkte[0]?.id ?? "");
  const liste = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const elemente = punkte.map((p) => document.getElementById(p.id)).filter((e): e is HTMLElement => !!e);
    if (elemente.length === 0 || typeof IntersectionObserver === "undefined") return;
    const sichtbar = new Map<string, number>();
    const beobachter = new IntersectionObserver(
      (eintraege) => {
        for (const e of eintraege) {
          if (e.isIntersecting) sichtbar.set(e.target.id, e.boundingClientRect.top);
          else sichtbar.delete(e.target.id);
        }
        if (sichtbar.size > 0) {
          const [naechster] = [...sichtbar.entries()].sort((a, b) => a[1] - b[1])[0];
          setAktiv(naechster);
        }
      },
      { rootMargin: "-140px 0px -60% 0px", threshold: 0 },
    );
    elemente.forEach((e) => beobachter.observe(e));
    return () => beobachter.disconnect();
  }, [punkte]);

  // Den aktiven Reiter in der Leiste in die Mitte rücken, ohne die Seite zu bewegen
  useEffect(() => {
    const behaelter = liste.current;
    const reiter = behaelter?.querySelector<HTMLElement>(`[data-id="${aktiv}"]`);
    if (!behaelter || !reiter) return;
    const ziel = reiter.offsetLeft - (behaelter.clientWidth - reiter.clientWidth) / 2;
    behaelter.scrollTo({ left: Math.max(0, ziel), behavior: "smooth" });
  }, [aktiv]);

  return (
    <nav className="produktnav" aria-label={beschriftung}>
      <div className="huelle">
        <ul ref={liste} className="produktnav__liste liste_ohne">
          {punkte.map((p) => (
            <li key={p.id}>
              <a
                href={`#${p.id}`}
                data-id={p.id}
                className="produktnav__link"
                aria-current={aktiv === p.id ? "location" : undefined}
                onClick={() => setAktiv(p.id)}
              >
                {p.titel}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
