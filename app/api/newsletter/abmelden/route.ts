import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SITE_URL } from "@/lib/site";
import { KEINE_ZWISCHENSPEICHERUNG } from "@/lib/newsletter/api";
import { resendSpeicher, umgebungVollstaendig } from "@/lib/newsletter/store";
import { pruefeAbmeldeToken } from "@/lib/newsletter/token";
import { aktionsseite } from "@/lib/newsletter/aktionsseite";

export const dynamic = "force-dynamic";

function weiter(pfad: string): NextResponse {
  return NextResponse.redirect(`${SITE_URL}${pfad}`, { status: 303, headers: KEINE_ZWISCHENSPEICHERUNG });
}

/** GET zeigt eine Bestätigung, damit Linkscanner niemanden unbeabsichtigt abmelden. */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  if (!umgebungVollstaendig(["RESEND_API_KEY", "NEWSLETTER_SECRET", "NEWSLETTER_AUDIENCE_ID"])) {
    return weiter("/brief?link=ungueltig");
  }
  const email = pruefeAbmeldeToken(token, process.env.NEWSLETTER_SECRET as string);
  if (!email) return weiter("/brief?link=ungueltig");
  return aktionsseite("abmelden", token, req.nextUrl.origin);
}

/** RFC 8058 One Click per POST, sowie die ausdrückliche Bestätigung im Browser. */
export async function POST(req: NextRequest) {
  if (!umgebungVollstaendig(["RESEND_API_KEY", "NEWSLETTER_SECRET", "NEWSLETTER_AUDIENCE_ID"])) return new Response(null, { status: 503 });
  const body = await req.text();
  if (body.length > 4000) return new Response(null, { status: 400 });
  const form = new URLSearchParams(body);
  const token = req.nextUrl.searchParams.get("token") ?? form.get("token") ?? "";
  const email = pruefeAbmeldeToken(token, process.env.NEWSLETTER_SECRET as string);
  if (!email) return new Response(null, { status: 400 });
  try {
    await resendSpeicher.abmelden(email);
  } catch {
    return new Response(null, { status: 503, headers: KEINE_ZWISCHENSPEICHERUNG });
  }
  if (form.get("List-Unsubscribe") === "One-Click") return new Response(null, { status: 200, headers: KEINE_ZWISCHENSPEICHERUNG });
  return weiter("/brief/abgemeldet");
}
