import type { Metadata } from "next";
import { RechtsSeite } from "@/components/rechtsseite";
import { seiten, ui } from "@/lib/daten";
import { metaFuer } from "@/lib/seo";

const s = seiten.impressum;

export const metadata: Metadata = metaFuer({ seo: s.seo, pfad: "/impressum" });

export default function ImpressumSeite() {
  return (
    <RechtsSeite
      h1={s.h1}
      abschnitte={s.abschnitte}
      entwurfHinweis={s.entwurfHinweis}
      inhaltLabel={ui.abschnitte.allgemein.inhalt}
      eyebrow="Rechtliches"
      lead="Wer hinter Startkontor steht, wie Sie uns erreichen und was für unsere Inhalte, Links und Logos gilt."
      motiv="vertragscheck"
      schluss="Haben Sie Fragen zu diesen Angaben, schreiben Sie uns."
    />
  );
}
