import { ui } from "@/lib/daten";
import { bannerSatzFuer, istLive } from "@/lib/partner";
import { sageAnzeigeFuer } from "@/lib/sage-werbemittel";
import type { BannerPlatzierung } from "@/lib/partner";
import { partner } from "@/lib/daten";

/**
 * Originalmotiv wird direkt von Impact geladen. Kein lokales Hosting und kein zusätzlicher Impression-Pixel.
 * Klicklink und Motiv-ID stammen zeichengetreu aus dem Sage-Export. Höchstens ein Banner je Seite.
 */
export function Werbebanner({ platzierung, kennung }: { platzierung: BannerPlatzierung; kennung: string }) {
  const treffer = bannerSatzFuer(platzierung, partner);
  if (!treffer || !istLive(treffer.partner)) return null;
  const satz = treffer.partner.werbemittel?.saetze[treffer.satz];
  if (!satz) return null;

  // Das einheitliche 300x250-Motiv passt in die Profilspalte und bleibt auch mobil lesbar.
  const anzeigeId = satz.anzeigen["300x250"];
  if (!anzeigeId) return null;
  const anzeige = sageAnzeigeFuer(anzeigeId);
  if (!anzeige) return null;

  return (
    <aside className="werbebanner" aria-label={ui.labels.anzeige}>
      <p className="werbebanner__label">{ui.labels.anzeige}</p>
      <a href={anzeige.trackingLink} target="_blank" rel="sponsored noopener noreferrer" className="werbebanner__link" aria-label={`Werbung: ${satz.alt} (neuer Tab)`} data-werbeplatzierung={kennung}>
        {/* Das Originalbild kommt per HTTPS direkt von Impact; die lokale Site speichert keine Bannerkopie. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={anzeige.imageUrl} alt={anzeige.alt || satz.alt} width={anzeige.width} height={anzeige.height} loading="lazy" decoding="async" referrerPolicy="no-referrer" />
        <span className="visuell_versteckt"> ({ui.barrierefreiheit.externLink})</span>
      </a>
    </aside>
  );
}
