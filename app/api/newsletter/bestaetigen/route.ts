import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SITE_URL } from "@/lib/site";
import { KEINE_ZWISCHENSPEICHERUNG, gleicherUrsprung } from "@/lib/newsletter/api";
import { mailSchluessel, resendSpeicher, resendVersand, umgebungVollstaendig } from "@/lib/newsletter/store";
import { erzeugeAbmeldeToken, leseBestaetigungsToken } from "@/lib/newsletter/token";
import { willkommenMail } from "@/lib/newsletter/mail";
import { aktionsseite } from "@/lib/newsletter/aktionsseite";

export const dynamic = "force-dynamic";

function weiter(pfad: string): NextResponse {
  return NextResponse.redirect(`${SITE_URL}${pfad}`, { status: 303, headers: KEINE_ZWISCHENSPEICHERUNG });
}

/** Ein GET alleine bestätigt nicht: automatisierte Mail-Linkscanner dürfen niemanden anmelden. */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  if (!umgebungVollstaendig(["RESEND_API_KEY", "NEWSLETTER_SECRET", "NEWSLETTER_AUDIENCE_ID"])) {
    return weiter("/brief?link=ungueltig");
  }
  if (!leseBestaetigungsToken(token, process.env.NEWSLETTER_SECRET as string)) return weiter("/brief?link=ungueltig");
  return aktionsseite("bestaetigen", token, req.nextUrl.origin);
}

export async function POST(req: NextRequest) {
  if (!gleicherUrsprung(req)) return new Response(null, { status: 403 });
  if (!umgebungVollstaendig(["RESEND_API_KEY", "NEWSLETTER_SECRET", "NEWSLETTER_AUDIENCE_ID", "MAIL_FROM", "MAIL_TO"])) return weiter("/brief?link=ungueltig");
  const body = await req.text();
  if (body.length > 4000) return new Response(null, { status: 400 });
  const token = new URLSearchParams(body).get("token") ?? "";
  const anmeldung = leseBestaetigungsToken(token, process.env.NEWSLETTER_SECRET as string);
  if (!anmeldung) return weiter("/brief?link=ungueltig");

  try {
    const status = await resendSpeicher.bestaetigen({ ...anmeldung, bestaetigtAm: new Date().toISOString() });
    if (status.willkommenSenden) {
      const abmeldeToken = erzeugeAbmeldeToken(anmeldung.email, process.env.NEWSLETTER_SECRET as string);
      const abmeldeLink = `${SITE_URL}/api/newsletter/abmelden?token=${encodeURIComponent(abmeldeToken)}`;
      try {
        const mail = willkommenMail(abmeldeLink);
        await resendVersand.senden({ an: anmeldung.email, ...mail, abmeldeLink, idempotenz: mailSchluessel("newsletter-welcome", anmeldung.email, anmeldung.angemeldetAm), kategorie: "newsletter_welcome" });
        await resendSpeicher.willkommenGesendet(anmeldung.email);
      } catch {
        // Ein erfolgreicher Double Opt in bleibt gültig, falls die zusätzliche Willkommensmail ausfällt.
        console.error("Newsletter: Willkommensmail konnte nicht abgeschlossen werden.");
      }
    }
  } catch {
    return weiter("/brief?link=ungueltig");
  }
  return weiter("/brief/bestaetigt");
}
