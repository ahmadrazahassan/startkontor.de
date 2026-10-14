import type { Metadata } from "next";
import Link from "next/link";
import { Brotkrumen } from "@/components/brotkrumen";
import { KontaktFormular } from "@/components/formulare";
import { H1 } from "@/components/h1";
import { Icon } from "@/components/icons";
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
      <p>
        {vor}
        <a href={`mailto:${email}`} className="adresse">
          {email}
        </a>
        {nach}
      </p>
    );
  }
  return <p>{s.direkt}</p>;
}

export default function KontaktSeite() {
  const k = ui.kontakt;
  return (
    <>
      <Brotkrumen punkte={[{ label: s.eyebrow }]} />
      <header className="rv-kopf huelle">
        <p className="rv-eyebrow"><span className="rv-punkt" aria-hidden="true" />{s.eyebrow}</p>
        <H1 text={s.h1} className="rv-titel" />
        <div className="rv-kopf__unten">
          <p className="rv-lead">{s.einleitung}</p>
        </div>
      </header>

      <div className="huelle">
        <div className="rv-flaeche">
          <Illustration motiv="beratung" sizes="(min-width: 768px) 320px, 240px" symbolbild />
        </div>
      </div>

      <div className="huelle rv rv_kontakt">
        <aside className="rv-seite" aria-label="Direkter Kontakt">
          <div className="rv-seite__block">
            <h2 className="rv-marke rv-marke_unterstrichen">Direkt</h2>
            <div className="rv-text"><DirektZeile /></div>
          </div>
        </aside>
        <div className="rv-formular">
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
        </div>
      </div>

      <section className="rv-schluss" aria-label="Weiter">
        <div className="huelle rv-schluss__innen">
          <p className="rv-schluss__text">Noch auf der Suche nach der passenden Software? Die Auswahlhilfe führt Sie in vier Angaben zum Ziel.</p>
          <Link href="/planer" className="rv-link">
            Zur Auswahlhilfe
            <Icon name="arrowRight" groesse={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
