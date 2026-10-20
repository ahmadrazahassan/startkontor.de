// HTTP Antwort der Partner-Weiterleitung. Dünne Hülle um lib/weiterleitung.ts.
// Referrer-Policy kommt aus next.config.ts (strict-origin-when-cross-origin): Beim Sprung zum Partner geht nur die Domain
// startkontor.de als Herkunft mit, nie die besuchte Seitenadresse.

import type { WeiterleitungsErgebnis } from "./weiterleitung.ts";

const KOEPFE = {
  // Nie zwischenspeichern: jeder Klick muss beim Partner ankommen, sonst zählt er dort nicht.
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
} as const;

export function antwortFuer(ergebnis: WeiterleitungsErgebnis): Response {
  if (ergebnis.status === 404) {
    return new Response("Nicht gefunden", { status: 404, headers: { ...KOEPFE, "Content-Type": "text/plain; charset=utf-8" } });
  }
  if (ergebnis.protokoll) {
    // Eine Zeile je Klick im Serverprotokoll des Hosters. Ohne IP Adresse, ohne Browserkennung, ohne Cookie.
    console.info(JSON.stringify({ ...ergebnis.protokoll, zeit: new Date().toISOString() }));
  }
  return new Response(null, { status: ergebnis.status, headers: { ...KOEPFE, Location: ergebnis.ort } });
}
