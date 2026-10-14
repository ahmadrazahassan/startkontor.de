import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SITE_URL } from "@/lib/site";
import { KEINE_ZWISCHENSPEICHERUNG } from "@/lib/newsletter/api";
import { EINWILLIGUNG_VERSION, resendSpeicher, umgebungVollstaendig } from "@/lib/newsletter/store";
import { pruefeBestaetigungsToken } from "@/lib/newsletter/token";

export const dynamic = "force-dynamic";

function weiter(pfad: string): NextResponse {
  return NextResponse.redirect(`${SITE_URL}${pfad}`, { status: 303, headers: KEINE_ZWISCHENSPEICHERUNG });
}

/** Bestätigungslink aus der Mail. Erst hier wird die Adresse als Abonnent angelegt. */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  if (!umgebungVollstaendig(["RESEND_API_KEY", "NEWSLETTER_SECRET", "NEWSLETTER_AUDIENCE_ID"])) {
    return weiter("/brief?link=ungueltig");
  }
  const email = pruefeBestaetigungsToken(token, process.env.NEWSLETTER_SECRET as string);
  if (!email) return weiter("/brief?link=ungueltig");

  try {
    const jetzt = new Date().toISOString();
    await resendSpeicher.bestaetigen({
      email,
      angemeldetAm: jetzt,
      bestaetigtAm: jetzt,
      einwilligung: EINWILLIGUNG_VERSION,
    });
  } catch {
    return weiter("/brief?link=ungueltig");
  }
  return weiter("/brief/bestaetigt");
}
