import type { Metadata } from "next";
import { marke, seo as seoGlobal } from "@/lib/daten";
import { absolut } from "@/lib/site";
import type { Seo } from "@/lib/typen";

type Optionen = {
  seo: Seo;
  /** Pfad ohne Query, z. B. /fahrplan/gruendung */
  pfad: string;
  /** Titel ohne Muster verwenden (Startseite) */
  absoluterTitel?: boolean;
  typ?: "website" | "article";
  /** ISO Datum für Artikel */
  geaendert?: string;
};

function robotsAus(wert: string | undefined): Metadata["robots"] {
  if (!wert) return undefined;
  const index = !/noindex/i.test(wert);
  const follow = !/nofollow/i.test(wert);
  return { index, follow };
}

export function metaFuer({ seo, pfad, absoluterTitel = false, typ = "website", geaendert }: Optionen): Metadata {
  const url = absolut(pfad);
  const titel = absoluterTitel ? seo.titel : seoGlobal.titelMuster.replace("%s", seo.titel);
  const bild = {
    url: absolut("/opengraph-image"),
    width: 1200,
    height: 630,
    alt: `${marke.name}: ${marke.claim}`,
  };
  return {
    title: absoluterTitel ? { absolute: seo.titel } : seo.titel,
    description: seo.beschreibung,
    alternates: { canonical: url },
    robots: robotsAus(seo.robots ?? seoGlobal.robots),
    openGraph: {
      type: typ,
      locale: seoGlobal.locale,
      siteName: marke.name,
      title: titel,
      description: seo.beschreibung,
      url,
      images: [bild],
      ...(typ === "article" && geaendert ? { modifiedTime: geaendert } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: titel,
      description: seo.beschreibung,
      images: [bild.url],
    },
  };
}
