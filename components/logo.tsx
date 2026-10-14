import Link from "next/link";
import { MARKENZEICHEN } from "@/lib/markenzeichen";

/**
 * Die einzige Stelle, an der Wortmarke und Zeichen zusammengesetzt werden.
 * Das Zeichen entspricht marke.logo.zeichenSvg. Der Betreiber kann beide später durch ein eigenes Logo ersetzen.
 * Rein präsentational (kein Datenzugriff), damit Client Komponenten die Daten nicht mitladen.
 */
export function LogoZeichen({ groesse = 32 }: { groesse?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      width={groesse}
      height={groesse}
      aria-hidden="true"
      focusable="false"
      className="logo__zeichen"
    >
      <path className="logo__form_haupt" d={MARKENZEICHEN.haupt} fill="#095fbb" />
      <path className="logo__form_neben" d={MARKENZEICHEN.neben} fill="#7aacdc" />
    </svg>
  );
}

export function Logo({
  name,
  hell = false,
  ohneLink = false,
  beschriftung,
}: {
  name: string;
  hell?: boolean;
  ohneLink?: boolean;
  beschriftung?: string;
}) {
  const klasse = hell ? "logo logo_hell" : "logo";
  const inhalt = (
    <>
      <LogoZeichen />
      <span className="logo__wortmarke">{name}</span>
    </>
  );
  if (ohneLink) return <span className={klasse}>{inhalt}</span>;
  return (
    <Link href="/" className={klasse} aria-label={beschriftung ?? name}>
      {inhalt}
    </Link>
  );
}
