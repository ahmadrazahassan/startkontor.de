// Gemeinsame Hilfen der API Routen: Herkunftsprüfung, Begrenzung, Eingabegrenzen, Antworten.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SITE_URL } from "../site.ts";

export const KEINE_ZWISCHENSPEICHERUNG = { "Cache-Control": "no-store" } as const;

export function antwort(daten: unknown, status = 200): NextResponse {
  return NextResponse.json(daten, { status, headers: KEINE_ZWISCHENSPEICHERUNG });
}

/** POST nur von der eigenen Seite. Origin oder Referer muss zum Host der Seite oder zu SITE_URL passen. */
export function gleicherUrsprung(req: NextRequest): boolean {
  const herkunft = req.headers.get("origin") ?? req.headers.get("referer");
  if (!herkunft) return false;
  try {
    const host = new URL(herkunft).host;
    const erlaubt = new Set<string>([new URL(SITE_URL).host, req.headers.get("host") ?? ""]);
    return erlaubt.has(host);
  } catch {
    return false;
  }
}

export function ipVon(req: NextRequest): string {
  return (req.headers.get("x-forwarded-for") ?? "unbekannt").split(",")[0].trim();
}

// Begrenzung im Speicher. Auf Serverless Plattformen gilt sie je Instanz und ist nur eine Best Effort Bremse.
const fenster = new Map<string, number[]>();

export function zuViele(schluessel: string, maximal = 5, fensterMs = 10 * 60 * 1000, jetzt = Date.now()): boolean {
  const liste = (fenster.get(schluessel) ?? []).filter((t) => jetzt - t < fensterMs);
  liste.push(jetzt);
  fenster.set(schluessel, liste);
  if (fenster.size > 5000) {
    for (const [k, v] of fenster) if (v.every((t) => jetzt - t >= fensterMs)) fenster.delete(k);
  }
  return liste.length > maximal;
}

export const EMAIL_MUSTER = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;

export async function leseJson(req: NextRequest, maxBytes = 20_000): Promise<Record<string, unknown> | null> {
  try {
    const text = await req.text();
    if (text.length > maxBytes) return null;
    const wert = JSON.parse(text) as unknown;
    return wert && typeof wert === "object" && !Array.isArray(wert) ? (wert as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function text(wert: unknown, maxLaenge: number): string {
  return typeof wert === "string" ? wert.trim().slice(0, maxLaenge) : "";
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
