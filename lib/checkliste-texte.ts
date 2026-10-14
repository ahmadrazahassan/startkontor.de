// Texte der interaktiven Checkliste aus den Daten. Server Seite, wird als Props an die Client Komponente gereicht.

import type { CheckTexte } from "../components/checkliste.tsx";
import { marke, ui } from "./daten.ts";

export function checkTexteFuer(slug: string, mitLinkZurEigenenSeite: boolean): CheckTexte {
  return {
    fortschritt: ui.checkliste.fortschritt,
    merken: ui.knoepfe.merken,
    zuruecksetzen: ui.knoepfe.zuruecksetzen,
    speicherHinweis: ui.checkliste.speicherHinweis,
    drucken: ui.knoepfe.checklisteDrucken,
    druckenHinweis: ui.barrierefreiheit.druckenHinweis,
    druckKopf: ui.checkliste.druckKopf,
    stand: marke.stand.statusleiste,
    eigeneSeite: mitLinkZurEigenenSeite
      ? { href: `/wissen/checklisten/${slug}`, label: ui.knoepfe.checklisteOeffnen }
      : undefined,
  };
}
