"use client";

import { useEffect } from "react";

/** Öffnet beim Laden und bei Hashwechsel den Akkordeon Eintrag, dessen id zum Hash passt. */
export function AkkordeonHash() {
  useEffect(() => {
    const oeffne = () => {
      const id = decodeURIComponent(window.location.hash.replace(/^#/, ""));
      if (!id) return;
      const el = document.getElementById(id);
      if (el instanceof HTMLDetailsElement) {
        el.open = true;
        el.scrollIntoView({ block: "start" });
      }
    };
    oeffne();
    window.addEventListener("hashchange", oeffne);
    return () => window.removeEventListener("hashchange", oeffne);
  }, []);
  return null;
}
