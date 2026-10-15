import werbemittel from "../data/sage-werbemittel.json" with { type: "json" };
import type { SageWerbeanzeige } from "./typen.ts";

const anzeigen = werbemittel.ads as SageWerbeanzeige[];
export const sageAnzeigenNachId = new Map(anzeigen.map((anzeige) => [anzeige.adId, anzeige]));

/** Liefert ausschließlich aktive, von Impact gehostete Sage-Creatives samt CSV-Trackinglink. */
export function sageAnzeigeFuer(id: number): SageWerbeanzeige | null {
  const anzeige = sageAnzeigenNachId.get(id);
  if (!anzeige || anzeige.status !== "ACTIVE" || anzeige.hostedBy !== "IR") return null;

  const klick = new URL(anzeige.trackingLink);
  const bild = new URL(anzeige.imageUrl);
  if (
    klick.protocol !== "https:" ||
    klick.hostname !== "sagegmbh.sjv.io" ||
    klick.pathname !== `/c/7969203/${id}/27498` ||
    bild.protocol !== "https:" ||
    bild.hostname !== "a.impactradius-go.com" ||
    bild.pathname !== `/display-ad/27498-${id}`
  ) {
    throw new Error(`Ungültiges Sage-Werbemittel: ${id}`);
  }
  return anzeige;
}
