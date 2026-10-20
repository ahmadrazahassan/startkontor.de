import type { NextRequest } from "next/server";
import { seiteAusReferer, weiterleitungFuerBanner } from "@/lib/weiterleitung";
import { antwortFuer } from "@/lib/weiterleitung-http";

export const dynamic = "force-dynamic";

type Kontext = { params: Promise<{ id: string }> };

/** Werbebanner: zählt den Klick und leitet sofort an den Trackinglink der Anzeige weiter (302). */
export async function GET(req: NextRequest, { params }: Kontext) {
  const { id } = await params;
  return antwortFuer(
    weiterleitungFuerBanner(id, {
      platzierung: req.nextUrl.searchParams.get("p"),
      seite: seiteAusReferer(req.headers.get("referer"), req.headers.get("host") ?? req.nextUrl.host),
      userAgent: req.headers.get("user-agent"),
      zaehlen: true,
    }),
  );
}

export async function HEAD(req: NextRequest, { params }: Kontext) {
  const { id } = await params;
  return antwortFuer(weiterleitungFuerBanner(id, { platzierung: null, userAgent: req.headers.get("user-agent"), zaehlen: false }));
}
