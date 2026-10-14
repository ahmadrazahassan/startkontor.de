import type { MetadataRoute } from "next";
import { anbieterNachSlug, leitfadenNachSlug, routen } from "@/lib/daten";
import { parseDeutschesDatum } from "@/lib/datum";
import { absolut } from "@/lib/site";

// Seiten, die nicht in die Sitemap gehören (noindex)
const OHNE = new Set(["/suche", "/brief/bestaetigt", "/brief/abgemeldet"]);

function zuletzt(route: string): Date | undefined {
  let datum: string | null = null;
  if (route.startsWith("/wissen/leitfaeden/")) {
    datum = parseDeutschesDatum(leitfadenNachSlug.get(route.split("/").pop() ?? "")?.rechtsstand ?? "");
  } else if (route.startsWith("/anbieter/")) {
    datum = parseDeutschesDatum(anbieterNachSlug.get(route.split("/").pop() ?? "")?.geprueft ?? "");
  }
  return datum ? new Date(`${datum}T00:00:00Z`) : undefined;
}

export default function sitemap(): MetadataRoute.Sitemap {
  return routen
    .filter((r) => !OHNE.has(r))
    .map((r) => {
      const geaendert = zuletzt(r);
      return { url: absolut(r), ...(geaendert ? { lastModified: geaendert } : {}) };
    });
}
