import type { MetadataRoute } from "next";
import { absolut } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/suche", "/brief/bestaetigt", "/brief/abgemeldet"] }],
    sitemap: absolut("/sitemap.xml"),
  };
}
