import Link from "next/link";
import { Logo } from "@/components/logo";
import { Deutschland } from "@/components/deutschland";
import { Icon } from "@/components/icons";
import { bausteine, marke, navigation, partner, ui } from "@/lib/daten";
import { istLive } from "@/lib/partner";
import { nbsp } from "@/lib/nbsp";

export function Fuss() {
  const f = navigation.fusszeile;
  const aktivePartner = partner.filter(istLive);
  return (
    <footer className="fuss">
      <div className="huelle fuss__oben">
        <div className="fuss__marke">
          <Logo name={marke.name} hell beschriftung={`${marke.name}, ${navigation.brotkrumen.start}`} />
          <p className="fuss__beschreibung">{nbsp(marke.kurzbeschreibung)}</p>
          <Deutschland className="fuss__land" />
          <Link href="/anbieter" className="fuss__cta">Software entdecken<Icon name="arrowRight" groesse={18} /></Link>
        </div>

        <nav className="fuss__spalten" aria-label={ui.barrierefreiheit.fussnavigation}>
          <div className="fuss__spalte fuss__spalte_haupt">
            <h2 className="fuss__titel">Entdecken</h2>
            <ul className="liste_ohne">
              {[
                { label: "Software", href: "/anbieter" },
                { label: "Kategorien", href: "/bausteine" },
                { label: "Ratgeber", href: "/wissen" },
                { label: "Auswahlhilfe", href: "/planer" },
                { label: "Fahrplan", href: "/fahrplan" },
              ].map((l) => <li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}
            </ul>
          </div>
          <div className="fuss__spalte">
            <h2 className="fuss__titel">Softwarebereiche</h2>
            <ul className="liste_ohne">
              {bausteine.map((b) => <li key={b.slug}><Link href={`/bausteine/${b.slug}`}>{b.name}</Link></li>)}
            </ul>
          </div>
          <div className="fuss__spalte fuss__spalte_kontakt">
              <h2 className="fuss__titel">Startkontor</h2>
              <ul className="liste_ohne">
                {(f.spalten.find((spalte) => spalte.titel === "Startkontor")?.links ?? []).filter((l) => l.href !== "/brief").map((l) => <li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}
              </ul>
              <div className="fuss__brief">
                <p className="fuss__briefTitel">Der Monatsbrief</p>
                <p>Softwarewissen, geprüfte Preisänderungen und Fristen. Einmal im Monat.</p>
                <Link href="/brief" className="fuss__brieflink">Zum Monatsbrief<Icon name="arrowRight" groesse={16} /></Link>
              </div>
          </div>
        </nav>
      </div>

      <div className="huelle fuss__abschluss">
        <p className="fuss__claim">{nbsp(marke.claim)}</p>
        <div className="fuss__haltung"><p>Fakten mit Quelle.<br />Klar eingeordnet.</p><Link href="/redaktion/arbeitsweise">Unsere Arbeitsweise<Icon name="arrowRight" groesse={16} /></Link></div>
      </div>

      <div className="fuss__unten">
        <div className="huelle"><p className="fuss__werbehinweis">{nbsp(f.werbehinweis)}</p>{aktivePartner.length ? <p className="fuss__partner">Affiliatepartner: {aktivePartner.map((p) => p.name).join(", ")}. <Link href="/redaktion/werbung">Mehr zu Werbung und Partnerschaften</Link></p> : null}</div>
        <div className="huelle fuss__untenInnen">
          <p>{nbsp(f.copyright)}</p>
          <ul className="liste_ohne fuss__recht">
            {f.rechtlich.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
