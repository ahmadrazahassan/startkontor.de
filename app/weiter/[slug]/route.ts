import type { NextRequest } from "next/server";
import { seiteAusReferer, weiterleitungFuerAnbieter } from "@/lib/weiterleitung";
import { antwortFuer } from "@/lib/weiterleitung-http";

export const dynamic = "force-dynamic";

type Kontext = { params: Promise<{ slug: string }> };

/** Gekennzeichneter Partnerlink: zählt den Klick und leitet sofort an den Partner weiter (302). */
export async function GET(req: NextRequest, { params }: Kontext) {
  const { slug } = await params;
  return antwortFuer(
    weiterleitungFuerAnbieter(slug, {
      platzierung: req.nextUrl.searchParams.get("p"),
      seite: seiteAusReferer(req.headers.get("referer"), req.headers.get("host") ?? req.nextUrl.host),
      userAgent: req.headers.get("user-agent"),
      zaehlen: true,
    }),
  );
}

/** Linkprüfer: gleiche Zieladresse wie bei GET, aber ohne Zählung und ohne Partneradresse. */
export async function HEAD(req: NextRequest, { params }: Kontext) {
  const { slug } = await params;
  return antwortFuer(weiterleitungFuerAnbieter(slug, { platzierung: null, userAgent: req.headers.get("user-agent"), zaehlen: false }));
}
