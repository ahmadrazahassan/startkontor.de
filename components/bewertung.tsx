import type { CSSProperties } from "react";

const STERN = "12,2.2 15.1,8.7 22,9.5 16.9,14.2 18.3,21.2 12,17.7 5.7,21.2 7.1,14.2 2,9.5 8.9,8.7";

/** Fünf Sterne mit Teilfüllung. Rein darstellend, die Zahl steht daneben als Text. */
export function Sterne({ wert, groesse = 18 }: { wert: number; groesse?: number }) {
  const anteil = Math.max(0, Math.min(5, wert)) / 5;
  const stil = { "--anteil": `${anteil * 100}%`, width: groesse * 5, height: groesse } as CSSProperties;
  const sterne = (klasse: string) => (
    <svg viewBox="0 0 120 24" width="100%" height="100%" aria-hidden="true" focusable="false" className={klasse}>
      {[0, 1, 2, 3, 4].map((i) => (
        <polygon key={i} points={STERN} transform={`translate(${i * 24} 0)`} />
      ))}
    </svg>
  );
  return (
    <span className="sterne" style={stil} aria-hidden="true">
      {sterne("sterne__leer")}
      <span className="sterne__voll">{sterne("sterne__fuell")}</span>
    </span>
  );
}

/** Teilbewertungen als Balken. Jeder Wert steht zusätzlich als Text daneben. */
export function Kriterienbalken({ kriterien, von }: { kriterien: { label: string; wert: number }[]; von: string }) {
  return (
    <ul className="kriterienbalken liste_ohne">
      {kriterien.map((k) => (
        <li key={k.label} className="kriterienbalken__zeile">
          <span className="kriterienbalken__label">{k.label}</span>
          <span className="kriterienbalken__spur" aria-hidden="true">
            <span className="kriterienbalken__fuell" style={{ width: `${(Math.max(0, Math.min(5, k.wert)) / 5) * 100}%` }} />
          </span>
          <span className="kriterienbalken__wert">
            {k.wert.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} {von}
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Zeigt die redaktionelle Bewertung: Zahl, Sterne und der Text "von 5".
 * Wird nur gerendert, wenn die Redaktion einen Wert in data/bewertungen.json eingetragen hat.
 */
export function Bewertungsanzeige({
  wert,
  von,
  groesse = "normal",
}: {
  wert: number;
  von: string;
  groesse?: "klein" | "normal" | "gross";
}) {
  const text = wert.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return (
    <span className={`bewertung bewertung_${groesse}`}>
      <span className="bewertung__zahl">{text}</span>
      <Sterne wert={wert} groesse={groesse === "gross" ? 24 : groesse === "klein" ? 14 : 18} />
      <span className="bewertung__von">{von}</span>
    </span>
  );
}
