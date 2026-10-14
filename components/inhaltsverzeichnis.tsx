"use client";

import { useEffect, useRef, useState } from "react";

export type Verzeichnispunkt = { id: string; titel: string; nummer: string };

/**
 * Inhaltsverzeichnis mit Scroll Spy. Ab 1024 Pixel als feste Spalte links, darunter als einklappbarer Block.
 */
export function Inhaltsverzeichnis({ punkte, titel }: { punkte: Verzeichnispunkt[]; titel: string }) {
  const [aktiv, setAktiv] = useState<string>(punkte[0]?.id ?? "");
  const detailRef = useRef<HTMLDetailsElement>(null);

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
      { rootMargin: "-90px 0px -65% 0px", threshold: 0 },
    );
    elemente.forEach((e) => beobachter.observe(e));
    return () => beobachter.disconnect();
  }, [punkte]);

  // Auf großen Bildschirmen immer offen, auf kleinen eingeklappt
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const setze = () => {
      if (detailRef.current) detailRef.current.open = mq.matches;
    };
    setze();
    mq.addEventListener("change", setze);
    return () => mq.removeEventListener("change", setze);
  }, []);

  return (
    <nav className="verzeichnisrail" aria-label={titel}>
      <details ref={detailRef} className="verzeichnisrail__details" open>
        <summary className="verzeichnisrail__titel">{titel}</summary>
        <ol className="verzeichnisrail__liste">
          {punkte.map((p) => (
            <li key={p.id}>
              <a href={`#${p.id}`} aria-current={aktiv === p.id ? "location" : undefined} onClick={() => setAktiv(p.id)}>
                <span className="verzeichnisrail__nr" data-ziffer={p.nummer} aria-hidden="true" />
                <span>{p.titel}</span>
              </a>
            </li>
          ))}
        </ol>
      </details>
    </nav>
  );
}
