// Startseite: Tarife im Detail. Bereitet die Daten auf dem Server auf, damit der Client nur wählt und anzeigt.

import { Icon } from "@/components/icons";
import { TarifExplorer, type TarifEintrag } from "@/components/tarif-explorer";
import { einstiegsstufe } from "@/lib/analyse";
import { tarifeFuer } from "@/lib/analyse-daten";
import { holeLogo } from "@/lib/bilder";
import { anbieter, bausteine, partner } from "@/lib/daten";
import { linkFuer } from "@/lib/partner";
import { Werbebanner } from "@/components/werbebanner";

export function TarifExplorerBereich() {
  const eintraege: TarifEintrag[] = anbieter
    .flatMap((a) => {
      const t = tarifeFuer(a.slug);
      if (!t) return [];
      const link = linkFuer(a, `start-tarife-${a.slug}`, partner);
      const logo = holeLogo(a.slug);
      return [
        {
          slug: a.slug,
          name: a.name,
          kategorie: a.baustein,
          logo: logo ? { src: logo.src, breite: logo.breite, hoehe: logo.hoehe } : null,
          einheit: t.einheit,
          stufen: t.stufen,
          hervorgehoben: einstiegsstufe(t.stufen, a.preis.anker).name,
          cta: { href: link.href, werbung: link.werbung, label: link.werbung ? "Zum Anbieter" : "Zur Website" },
          profil: a.url,
          geprueft: a.geprueft,
        },
      ];
    })
    .sort((x, y) => x.name.localeCompare(y.name, "de"));

  return (
    <section className="band_eng" aria-labelledby="tarife-titel">
      <div className="huelle">
        <div className="tp tp_start band_nacht">
          <header className="tp-kopf">
            <p className="tp-eyebrow"><Icon name="plus" groesse={14} />Tarife</p>
            <h2 id="tarife-titel" className="tp-titel">
              <span>Tarife im Detail,</span>
              <span>Programm für Programm.</span>
            </h2>
            <p className="tp-lead">Wählen Sie ein Programm und sehen Sie alle Stufen mit Preis und Merkmalen, so wie der Hersteller sie angibt.</p>
          </header>
          <TarifExplorer eintraege={eintraege} kategorien={bausteine.map((b) => ({ slug: b.slug, label: b.kurzname }))} />
        </div>
        <Werbebanner
          platzierung={{ art: "startseite", satz: "operations" }}
          kennung="startseite-sage-operations-tarife"
          groesse="970x250"
        />
      </div>
    </section>
  );
}
