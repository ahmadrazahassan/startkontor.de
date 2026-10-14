import type { Metadata } from "next";
import { RechtsSeite } from "@/components/rechtsseite";
import { seiten, ui } from "@/lib/daten";
import { metaFuer } from "@/lib/seo";

const s = seiten.datenschutz;

export const metadata: Metadata = metaFuer({ seo: s.seo, pfad: "/datenschutz" });

export default function DatenschutzSeite() {
  return (
    <RechtsSeite
      h1={s.h1}
      stand={s.stand}
      abschnitte={s.abschnitte}
      entwurfHinweis={s.entwurfHinweis}
      inhaltLabel={ui.abschnitte.allgemein.inhalt}
    />
  );
}
