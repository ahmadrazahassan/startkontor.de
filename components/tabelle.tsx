"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

/**
 * Scrollcontainer für breite Tabellen. Zeigt Randverläufe, solange links oder rechts noch Inhalt liegt.
 * Ohne JavaScript scrollt die Tabelle trotzdem, nur ohne die Verläufe.
 */
export function TabelleHuelle({ children, beschriftung }: { children: ReactNode; beschriftung?: string }) {
  const aussen = useRef<HTMLDivElement>(null);
  const innen = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const a = aussen.current;
    const i = innen.current;
    if (!a || !i) return;
    const pruefe = () => {
      const max = i.scrollWidth - i.clientWidth;
      a.dataset.links = i.scrollLeft > 2 ? "ja" : "nein";
      a.dataset.rechts = max > 2 && i.scrollLeft < max - 2 ? "ja" : "nein";
      // Tastaturbedienung nur nötig, wenn überhaupt gescrollt werden kann
      if (max > 2) i.setAttribute("tabindex", "0");
      else i.removeAttribute("tabindex");
    };
    pruefe();
    i.addEventListener("scroll", pruefe, { passive: true });
    const beobachter = new ResizeObserver(pruefe);
    beobachter.observe(i);
    return () => {
      i.removeEventListener("scroll", pruefe);
      beobachter.disconnect();
    };
  }, []);

  return (
    <div ref={aussen} className="tabelle">
      <div ref={innen} className="tabelle__huelle" role="region" aria-label={beschriftung}>
        {children}
      </div>
    </div>
  );
}
