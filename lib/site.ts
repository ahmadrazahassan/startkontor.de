// Adressen und Metadaten. SITE_URL kommt aus der Umgebung.

export const SITE_URL = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

export function absolut(pfad: string): string {
  return `${SITE_URL}${pfad.startsWith("/") ? pfad : `/${pfad}`}`;
}
