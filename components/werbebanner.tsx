import { existsSync } from "node:fs";
import { join } from "node:path";
import { ui } from "@/lib/daten";
import { bannerLink, bannerSatzFuer, istLive } from "@/lib/partner";
import type { BannerPlatzierung } from "@/lib/partner";
import { partner } from "@/lib/daten";

const ENDUNGEN = ["png", "jpg", "webp", "gif"];

function finde(satz: string, groesse: string): string | null {
  for (const e of ENDUNGEN) {
    const web = `/werbung/sage/${satz}-${groesse}.${e}`;
    if (existsSync(join(process.cwd(), "public", web))) return web;
  }
  return null;
}

/**
 * Werbebanner. Erscheint nur, wenn der Partner live ist, die Bilddatei im Ordner public/werbung/sage liegt
 * und die Platzierung laut werbemittel.einsatz erlaubt ist. Standard: nichts.
 * Dateinamen: {satz}-{Breite}x{Höhe}.png, zum Beispiel erp-728x90.png. Nie im Leitfaden, nie auf Rechtsseiten,
 * nie im Planer, höchstens ein Banner je Seite.
 */
export function Werbebanner({ platzierung, kennung }: { platzierung: BannerPlatzierung; kennung: string }) {
  const treffer = bannerSatzFuer(platzierung, partner);
  if (!treffer || !istLive(treffer.partner)) return null;
  const satz = treffer.partner.werbemittel?.saetze[treffer.satz];
  if (!satz) return null;

  const gross = Object.keys(satz.anzeigen).includes("728x90") ? "728x90" : "300x250";
  const datei = finde(treffer.satz, gross);
  if (!datei) return null;
  const klein = Object.keys(satz.anzeigen).includes("320x50") ? finde(treffer.satz, "320x50") : null;
  const [breite, hoehe] = gross.split("x").map(Number);
  const href = bannerLink(treffer.partner, satz.landing, `banner-${kennung}`);

  return (
    <aside className="werbebanner" aria-label={ui.labels.anzeige}>
      <p className="werbebanner__label">{ui.labels.anzeige}</p>
      <a href={href} target="_blank" rel="sponsored noopener noreferrer" className="werbebanner__link">
        <picture>
          {klein ? <source media="(max-width: 767px)" srcSet={klein} width={320} height={50} /> : null}
          {/* Offizielle Werbemittel, unverändert. Feste Maße verhindern Layoutsprünge. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={datei} alt={satz.alt} width={breite} height={hoehe} loading="lazy" />
        </picture>
        <span className="visuell_versteckt"> ({ui.barrierefreiheit.externLink})</span>
      </a>
    </aside>
  );
}
