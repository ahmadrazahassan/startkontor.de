// Aufbereitung der Anbieterdaten für Anzeigen.

import { ui } from "./daten.ts";
import type { Anbieter } from "./typen.ts";

export function preisText(a: Anbieter): string {
  switch (a.preis.status) {
    case "veroeffentlicht":
      return ui.anbieterFilter.preisOptionen[1];
    case "anfrage":
      return ui.labels.preisAufAnfrage;
    case "nichtVerifiziert":
      return ui.labels.preisNichtVerifiziert;
  }
}
