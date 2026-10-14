import type { NextRequest } from "next/server";
import { ui } from "@/lib/daten";
import { SITE_URL } from "@/lib/site";
import { antwort, EMAIL_MUSTER, gleicherUrsprung, ipVon, leseJson, text, zuViele } from "@/lib/newsletter/api";
import { bestaetigungsMail } from "@/lib/newsletter/mail";
import { resendVersand, umgebungVollstaendig } from "@/lib/newsletter/store";
import { erzeugeBestaetigungsToken } from "@/lib/newsletter/token";

export const dynamic = "force-dynamic";

const NOETIG = ["RESEND_API_KEY", "MAIL_FROM", "NEWSLETTER_SECRET", "NEWSLETTER_AUDIENCE_ID", "SITE_URL"];
const MINDESTZEIT_MS = 3000;

/**
 * Anmeldung zum Monatsbrief, erster Schritt des Double Opt in.
 * Die Adresse wird hier nicht gespeichert, sondern nur per Mail zur Bestätigung angeboten.
 * Die Antwort ist immer dieselbe, ob die Adresse schon bekannt ist oder nicht.
 */
export async function POST(req: NextRequest) {
  if (!gleicherUrsprung(req)) return antwort({ fehler: ui.newsletter.fehlerServer }, 403);

  const daten = await leseJson(req);
  if (!daten) return antwort({ fehler: ui.newsletter.fehlerServer }, 400);

  const email = text(daten.email, 254).toLowerCase();
  if (!EMAIL_MUSTER.test(email)) return antwort({ feld: "email", fehler: ui.newsletter.fehlerUngueltig }, 400);
  if (daten.einwilligung !== true) return antwort({ feld: "einwilligung", fehler: ui.newsletter.fehlerEinwilligung }, 400);

  // Honigtopf und Mindestausfüllzeit
  if (text(daten.hp, 200) !== "") return antwort({ fehler: ui.newsletter.fehlerServer }, 422);
  const ts = typeof daten.ts === "number" ? daten.ts : 0;
  if (!ts || Date.now() - ts < MINDESTZEIT_MS) return antwort({ fehler: ui.newsletter.fehlerServer }, 422);

  if (zuViele(`newsletter:${ipVon(req)}`)) return antwort({ fehler: ui.newsletter.fehlerServer }, 429);

  if (!umgebungVollstaendig(NOETIG)) return antwort({ fehler: ui.newsletter.fehlerServer }, 500);

  try {
    const token = erzeugeBestaetigungsToken(email, process.env.NEWSLETTER_SECRET as string);
    const link = `${SITE_URL}/api/newsletter/bestaetigen?token=${encodeURIComponent(token)}`;
    const mail = bestaetigungsMail(link);
    await resendVersand.senden({ an: email, betreff: mail.betreff, text: mail.text, html: mail.html });
    return antwort({ ok: true, meldung: ui.newsletter.erfolg });
  } catch {
    return antwort({ fehler: ui.newsletter.fehlerServer }, 500);
  }
}
