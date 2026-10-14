import { NewsletterFormular } from "@/components/formulare";
import { ui } from "@/lib/daten";

/** Der Monatsbrief Block mit allen Texten aus ui.newsletter. Wird auf der Startseite und auf /brief gezeigt. */
export function NewsletterBlock() {
  const n = ui.newsletter;
  return (
    <div className="newsletterblock">
      <NewsletterFormular
        datenschutzHref="/datenschutz"
        texte={{
          label: n.label,
          platzhalter: n.platzhalter,
          einwilligung: n.einwilligung,
          erfolg: n.erfolg,
          fehlerUngueltig: n.fehlerUngueltig,
          fehlerEinwilligung: n.fehlerEinwilligung,
          fehlerServer: n.fehlerServer,
          absenden: ui.knoepfe.abonnieren,
        }}
      />
    </div>
  );
}
