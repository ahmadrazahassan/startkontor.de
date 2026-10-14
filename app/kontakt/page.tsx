import type { Metadata } from "next";
import { Brotkrumen } from "@/components/brotkrumen";
import { KontaktFormular } from "@/components/formulare";
import { Seitenkopf } from "@/components/seitenkopf";
import { Illustration } from "@/components/illustration";
import { betreiber, seiten, ui } from "@/lib/daten";
import { metaFuer } from "@/lib/seo";

const s = seiten.kontakt;

export const metadata: Metadata = metaFuer({ seo: s.seo, pfad: "/kontakt" });

/** Die Adresse im Satz "… direkt unter {{KONTAKT_EMAIL}}." wird als mailto Link gesetzt, sobald sie gefüllt ist. */
function DirektZeile() {
  const email = (betreiber.KONTAKT_EMAIL ?? "").trim();
  if (email && s.direkt.includes(email)) {
    const [vor, nach] = s.direkt.split(email);
    return (
      <p className="kontaktdirekt">
        {vor}
        <a href={`mailto:${email}`} className="adresse">
          {email}
        </a>
        {nach}
      </p>
    );
  }
  return <p className="kontaktdirekt">{s.direkt}</p>;
}

export default function KontaktSeite() {
  const k = ui.kontakt;
  return (
    <>
      <Brotkrumen punkte={[{ label: s.eyebrow }]} />
      <Seitenkopf
        eyebrow={s.eyebrow}
        titel={s.h1}
        einleitung={s.einleitung}
        rechts={<Illustration motiv="beratung" sizes="(min-width: 768px) 340px, 260px" symbolbild />}
      />
      <section className="band_eng" aria-label={s.eyebrow}>
        <div className="huelle kontaktseite">
          <KontaktFormular
            datenschutzHref="/datenschutz"
            texte={{
              name: k.name,
              email: k.email,
              betreff: k.betreff,
              nachricht: k.nachricht,
              einwilligung: k.einwilligung,
              erfolg: k.erfolg,
              fehlerPflicht: k.fehlerPflicht,
              fehlerUngueltig: ui.newsletter.fehlerUngueltig,
              fehlerServer: k.fehlerServer,
              hinweisFehler: s.hinweisFehler,
              absenden: ui.knoepfe.absenden,
            }}
          />
          <DirektZeile />
        </div>
      </section>
    </>
  );
}
