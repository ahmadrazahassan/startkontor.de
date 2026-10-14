import type { Metadata } from "next";
import { Suspense } from "react";
import { AnbieterVerzeichnis, AnbieterVerzeichnisStatisch } from "@/components/anbieter-verzeichnis";
import type { VerzeichnisTexte, VerzeichnisZeile } from "@/components/anbieter-verzeichnis";
import { Brotkrumen } from "@/components/brotkrumen";
import { Inline } from "@/components/inline";
import { Seitenkopf } from "@/components/seitenkopf";
import { anbieterAlphabetisch, bausteine, navigation, seiten, ui } from "@/lib/daten";
import { metaFuer } from "@/lib/seo";
import { softwareKarte, softwareKarteTexte } from "@/lib/software-ansicht";

const s = seiten.anbieter;

export const metadata: Metadata = metaFuer({ seo: s.seo, pfad: "/anbieter" });

export default function AnbieterIndex() {
  const zeilen: VerzeichnisZeile[] = anbieterAlphabetisch.map((a) => ({
    ...softwareKarte(a),
    baustein: a.baustein,
    preisStatus: a.preis.status,
    monatlichKuendbar: a.monatlichKuendbar === true,
  }));
  const f = ui.anbieterFilter;
  const texte: VerzeichnisTexte = {
    baustein: f.baustein,
    alle: f.preisOptionen[0],
    preis: f.preis,
    preisOptionen: [f.preisOptionen[0], f.preisOptionen[1], f.preisOptionen[2]],
    vertrag: f.vertrag,
    sortierung: f.sortierung,
    sortierOptionen: [f.sortierOptionen[0], f.sortierOptionen[1]],
    zuruecksetzen: f.zuruecksetzen,
    trefferEinzahl: f.trefferEinzahl,
    trefferMehrzahl: f.trefferMehrzahl,
    hinweis: f.hinweis,
    anbieter: ui.labels.anbieter,
  };

  return (
    <>
      <Brotkrumen punkte={[{ label: navigation.kopfzeile[2].label }]} />
      <div className="softwareportal-kopf">
      <Seitenkopf
        eyebrow={s.eyebrow}
        titel={s.h1}
        einleitung="Entdecken Sie Programme für Ihr Unternehmen. Filtern Sie nach Kategorie, Preisangabe und Vertragsmodell und vergleichen Sie die Profile."
      />
      </div>

      <section className="band_eng" aria-label={ui.labels.anbieter}>
        <div className="huelle">
          <Suspense
            fallback={<AnbieterVerzeichnisStatisch zeilen={zeilen} texte={texte} karteTexte={softwareKarteTexte} />}
          >
            <AnbieterVerzeichnis
              zeilen={zeilen}
              bausteine={bausteine.map((b) => ({ slug: b.slug, name: b.name }))}
              texte={texte}
              karteTexte={softwareKarteTexte}
            />
          </Suspense>
        </div>
      </section>

      <section className="band band_weiss" aria-labelledby="auswahl-titel">
        <div className="huelle">
          <div className="auswahl">
            <h2 id="auswahl-titel">
              <Inline text={s.auswahl.titel} />
            </h2>
            <p>
              <Inline text={s.auswahl.text} />
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
