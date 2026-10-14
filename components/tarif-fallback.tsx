// Preiskarte für Programme ohne Tarifstufen: Einstiegspreis, Hinweise des Herstellers und Knopf im gleichen Stil.

import { Icon } from "@/components/icons";

type Props = {
  name: string;
  status: "veroeffentlicht" | "anfrage" | "nichtVerifiziert";
  statusText: string;
  anker?: string;
  zeilen: string[];
  cta: { href: string; werbung: boolean; label: string };
};

const ANKER = /^(.*?)(ab\s+)?(\d{1,3}(?:\.\d{3})*(?:,\d+)?)\s*Euro\b(.*)$/;

/** Zerlegt einen Preisanker in Betrag und Einheit, wenn das eindeutig geht. */
export function zerlegeAnker(anker: string | undefined): { ab: boolean; betrag: string; einheit: string } | null {
  if (!anker) return null;
  const m = anker.match(ANKER);
  if (!m || m[1].trim().split(/\s+/).filter(Boolean).length > 2) return null;
  return { ab: Boolean(m[2]) || /^ab\b/i.test(anker.trim()), betrag: `${m[3]} €`, einheit: m[4].trim().replace(/^[,:;]\s*/, "") };
}

export function TarifFallback({ name, status, statusText, anker, zeilen: alleZeilen, cta }: Props) {
  const zeilen = alleZeilen.filter((z) => z !== statusText && z !== anker);
  const teile = status === "veroeffentlicht" ? zerlegeAnker(anker) : null;
  const chip = status === "veroeffentlicht" ? "Einstieg" : status === "anfrage" ? "Auf Anfrage" : "Nicht verifiziert";
  return (
    <div className="tp-inhalt">
      <article className="tp-karte tp-karte_hervor tp-karte_einzeln">
        <div className="tp-einzeln__links">
          <header className="tp-karte__kopf">
            <h3 className="tp-karte__name">Preismodell</h3>
            <span className="tp-chip">{chip}</span>
          </header>
          <p className="tp-preis">
            {teile ? (
              <>
                {teile.ab ? <span className="tp-preis__ab">ab</span> : null}
                <span className="tp-preis__zahl">{teile.betrag}</span>
                {teile.einheit ? <span className="tp-preis__einheit">{teile.einheit}</span> : null}
              </>
            ) : (
              <span className="tp-preis__zahl tp-preis__zahl_text">{status === "veroeffentlicht" && anker ? anker : statusText}</span>
            )}
          </p>
          <div className="tp-knopf">
            <a
              href={cta.href}
              target="_blank"
              rel={cta.werbung ? "sponsored noopener noreferrer" : "noopener noreferrer"}
              className="knopf knopf_primaer knopf_breit"
              aria-label={`${cta.werbung ? "Werbung: " : ""}${name}: ${cta.label} (neuer Tab)`}
            >
              <span className="knopf__text">{cta.label}</span>
              <Icon name="external" groesse={16} />
            </a>
            <span className="tp-knopf__werbung">{cta.werbung ? "Werbung" : " "}</span>
          </div>
        </div>
        {zeilen.length > 0 ? (
          <ul className="tp-liste liste_ohne">
            {zeilen.slice(0, 6).map((z) => (
              <li key={z}>
                <Icon name="check" groesse={18} />
                <span>{z}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </article>
    </div>
  );
}
