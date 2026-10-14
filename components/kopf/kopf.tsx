import Link from "next/link";
import { HauptNav } from "@/components/kopf/haupt-nav";
import type { NavPunktDaten } from "@/components/kopf/haupt-nav";
import { MobilMenue } from "@/components/kopf/mobil-menue";
import type { MobilPunkt } from "@/components/kopf/mobil-menue";
import { SucheKnopf } from "@/components/kopf/suche-knopf";
import { SucheDialog } from "@/components/kopf/suche-dialog";
import { Logo } from "@/components/logo";
import { Icon } from "@/components/icons";
import { bausteine, kennzahlen, marke, navigation, ui } from "@/lib/daten";

function baueNavPunkte(): NavPunktDaten[] {
  return [
    {
      label: "Software", href: "/anbieter", aktivePfade: ["/anbieter", "/bausteine", "/planer"], art: "bausteine",
      beschreibung: `${kennzahlen.anbieter} Programme. Preise, Funktionen und Eignung im Überblick.`,
      kinder: [
        ...bausteine.map((b) => ({ titel: b.name, text: navigation.kopfzeile.find((p) => p.href === "/bausteine")?.kinder?.find((k) => k.href === `/bausteine/${b.slug}`)?.beschreibung ?? b.teaser, href: `/bausteine/${b.slug}` })),
        { titel: "Alle Programme", text: "Softwareprofile durchsuchen und nach Ihrem Bedarf filtern.", href: "/anbieter" },
        { titel: "Auswahlhilfe", text: "In vier Angaben den nächsten Softwarebedarf bestimmen.", href: "/planer" },
        { titel: "Alle Kategorien", text: "Die fünf Softwarebereiche auf einen Blick.", href: "/bausteine" },
      ],
    },
    {
      label: "Ratgeber", href: "/wissen", aktivePfade: ["/wissen", "/fahrplan"], art: "wissen",
      beschreibung: "Wissen für eine fundierte Softwareentscheidung.",
      kinder: [
        ...(navigation.kopfzeile.find((p) => p.href === "/wissen")?.kinder ?? []).map((k) => ({ titel: k.label, text: k.beschreibung, href: k.href })),
        { titel: "Fahrplan für Ihr Unternehmen", text: "Von der Gründung bis zum Ausbau: Was jetzt wichtig wird.", href: "/fahrplan" },
      ],
    },
    {
      label: "Über uns", href: "/redaktion", art: "redaktion",
      beschreibung: "Wie Startkontor recherchiert und Software einordnet.",
      kinder: [
        { titel: "Über Startkontor", text: "Unser Auftrag und unsere Haltung.", href: "/redaktion" },
        { titel: "Unsere Arbeitsweise", text: "Quellen, Prüfung und redaktionelle Einschätzung.", href: "/redaktion/arbeitsweise" },
        { titel: "Werbung und Partner", text: "Transparenz über die Finanzierung.", href: "/redaktion/werbung" },
        { titel: "Erfahrung teilen", text: "Hinweise und Erfahrungen an die Redaktion senden.", href: "/kontakt" },
      ],
    },
  ];
}

function baueMobilPunkte(): MobilPunkt[] {
  return [...baueNavPunkte().map((p) => ({
    label: p.label, href: p.href, beschreibung: p.beschreibung,
    unterpunkte: p.kinder.map((k) => ({ titel: k.titel, href: k.href })),
  })), { label: "Für Hersteller", href: "/kontakt", beschreibung: "Software für das Verzeichnis vorschlagen." }];
}

export function Kopf() {
  const start = navigation.brotkrumen.start;
  return (
    <>
      <header className="kopf">
        <div className="huelle kopf__innen">
          <Logo name={marke.name} beschriftung={`${marke.name}, ${start}`} />
          <div className="kopf__haupt">
            <HauptNav
              punkte={baueNavPunkte()}
              fahrplanOeffnen={ui.knoepfe.fahrplanOeffnen}
              beschriftung={ui.barrierefreiheit.hauptnavigation}
              aktuelleSeite={ui.barrierefreiheit.aktuelleSeite}
            />
            <div className="kopf__aktionen">
              <Link href="/kontakt" className="kopf__hersteller">Für Hersteller</Link>
              <SucheKnopf label={navigation.suche.label} kuerzel={navigation.suche.kuerzel} variante="leiste" />
              <Link href={navigation.kopfzeileAktion.href} className="knopf knopf_primaer knopf_klein">
                <span className="knopf__text">{navigation.kopfzeileAktion.label}</span>
              </Link>
            </div>
          </div>
          <div className="kopf__mobil">
            <MobilMenue
              markenname={marke.name}
              startseite={`${marke.name}, ${start}`}
              punkte={baueMobilPunkte()}
              aktion={navigation.kopfzeileAktion}
              sucheLabel={navigation.suche.label}
              texte={{
                oeffnen: ui.knoepfe.menueOeffnen,
                schliessen: ui.knoepfe.menueSchliessen,
                beschriftung: ui.barrierefreiheit.menue,
                aktuelleSeite: ui.barrierefreiheit.aktuelleSeite,
              }}
            />
          </div>
        </div>
      </header>

      <SucheDialog
        gruppen={ui.suche.gruppen}
        texte={{
          platzhalter: ui.suche.platzhalter,
          ueberschrift: ui.suche.ueberschrift,
          keineTreffer: ui.suche.keineTreffer,
          tastaturHinweis: ui.suche.tastaturHinweis,
          schliessen: ui.knoepfe.sucheSchliessen,
        }}
      />
    </>
  );
}

export function Mobilleiste() {
  return (
    <div className="mobilleiste" role="group" aria-label={ui.barrierefreiheit.schnellzugriff}>
      <SucheKnopf label={navigation.suche.label} variante="mobil" />
      <Link href={navigation.kopfzeileAktion.href} className="knopf knopf_primaer knopf_breit">
        <span className="knopf__text">{navigation.kopfzeileAktion.label}</span>
        <Icon name="arrowRight" groesse={18} />
      </Link>
    </div>
  );
}
