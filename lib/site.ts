// Adressen und Metadaten. SITE_URL kommt aus der Umgebung.

const standard = process.env.NODE_ENV === "production" ? "https://startkontor.de" : "http://localhost:3000";
const konfiguriert = process.env.SITE_URL?.trim() || standard;
const adresse = /^https?:\/\//i.test(konfiguriert) ? konfiguriert : `https://${konfiguriert}`;
export const SITE_URL = new URL(adresse).origin;

export function absolut(pfad: string): string {
  return `${SITE_URL}${pfad.startsWith("/") ? pfad : `/${pfad}`}`;
}
