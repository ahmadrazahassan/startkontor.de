import type { Metadata } from "next";
import { H1 } from "@/components/h1";
import { Brotkrumen } from "@/components/brotkrumen";
import { Icon } from "@/components/icons";
import { Inline } from "@/components/inline";
import { KnopfLink } from "@/components/knopf";
import { navigation, seiten, ui } from "@/lib/daten";
import { metaFuer } from "@/lib/seo";

export const metadata: Metadata = metaFuer({
  seo: {
    titel: ui.newsletter.bestaetigtTitel,
    beschreibung: ui.newsletter.bestaetigtText,
    robots: "noindex, follow",
  },
  pfad: "/brief/bestaetigt",
});

export default function BriefBestaetigt() {
  return (
    <>
      <Brotkrumen punkte={[{ label: seiten.brief.eyebrow, href: "/brief" }, { label: ui.newsletter.bestaetigtTitel }]} />
      <section className="band_eng">
        <div className="huelle_schmal bestaetigung">
          <span className="bestaetigung__zeichen" aria-hidden="true">
            <Icon name="check" groesse={32} />
          </span>
          <H1 text={ui.newsletter.bestaetigtTitel} />
          <p className="lead">
            <Inline text={ui.newsletter.bestaetigtText} />
          </p>
          <p>
            <KnopfLink href="/" variante="sekundaer" icon="arrowLeft" iconLinks>
              {navigation.brotkrumen.start}
            </KnopfLink>
          </p>
        </div>
      </section>
    </>
  );
}
