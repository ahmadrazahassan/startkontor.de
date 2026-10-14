import type { NextRequest } from "next/server";
import { ui } from "@/lib/daten";
import { antwort, EMAIL_MUSTER, gleicherUrsprung, ipVon, leseJson, text, zuViele } from "@/lib/newsletter/api";
import { kontaktMail } from "@/lib/newsletter/mail";
import { resendVersand, umgebungVollstaendig } from "@/lib/newsletter/store";

export const dynamic = "force-dynamic";

const NOETIG = ["RESEND_API_KEY", "MAIL_FROM", "MAIL_TO"];
const MINDESTZEIT_MS = 3000;

/** Kontaktformular: eine Mail an die Redaktion. Keine automatische Antwort, keine Speicherung. */
export async function POST(req: NextRequest) {
  if (!gleicherUrsprung(req)) return antwort({ fehler: ui.kontakt.fehlerServer }, 403);

  const daten = await leseJson(req, 30_000);
  if (!daten) return antwort({ fehler: ui.kontakt.fehlerServer }, 400);

  const name = text(daten.name, 120);
  const email = text(daten.email, 254).toLowerCase();
  const betreff = text(daten.betreff, 160);
  const nachricht = text(daten.nachricht, 5000);
  if (!name || !betreff || !nachricht) return antwort({ fehler: ui.kontakt.fehlerPflicht }, 400);
  if (!EMAIL_MUSTER.test(email)) return antwort({ feld: "email", fehler: ui.newsletter.fehlerUngueltig }, 400);
  if (daten.einwilligung !== true) return antwort({ feld: "einwilligung", fehler: ui.kontakt.fehlerPflicht }, 400);

  if (text(daten.hp, 200) !== "") return antwort({ fehler: ui.kontakt.fehlerServer }, 422);
  const ts = typeof daten.ts === "number" ? daten.ts : 0;
  if (!ts || Date.now() - ts < MINDESTZEIT_MS) return antwort({ fehler: ui.kontakt.fehlerServer }, 422);

  if (zuViele(`kontakt:${ipVon(req)}`)) return antwort({ fehler: ui.kontakt.fehlerServer }, 429);
  if (!umgebungVollstaendig(NOETIG)) return antwort({ fehler: ui.kontakt.fehlerServer }, 500);

  try {
    const mail = kontaktMail({ name, email, betreff, nachricht, seite: text(daten.seite, 300) });
    await resendVersand.senden({
      an: process.env.MAIL_TO as string,
      betreff: mail.betreff,
      text: mail.text,
      html: mail.html,
      antwortAn: email,
    });
    return antwort({ ok: true, meldung: ui.kontakt.erfolg });
  } catch {
    return antwort({ fehler: ui.kontakt.fehlerServer }, 500);
  }
}
