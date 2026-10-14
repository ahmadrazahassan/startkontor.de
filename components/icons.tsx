// Handgezeichnete Icons: 24 Pixel Raster, 1,75 Pixel Linie, eckige Enden und Ecken. Keine Icon Bibliothek.

const PFADE = {
  arrowRight: "M4 12h15M13 6l6 6-6 6",
  arrowLeft: "M20 12H5M11 6l-6 6 6 6",
  arrowUp: "M12 20V5M6 11l6-6 6 6",
  arrowDown: "M12 4v15M6 13l6 6 6-6",
  chevronDown: "M6 9l6 6 6-6",
  external: "M14 4h6v6M20 4l-9 9M18 14v6H4V6h6",
  search: "M18 10a8 8 0 1 1-16 0a8 8 0 0 1 16 0M16 16l5 5",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M5 5l14 14M19 5L5 19",
  check: "M4 12.5l5 5L20 6.5",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  print: "M7 8V3h10v5M7 17H3V8h18v9h-4M7 14h10v7H7z",
  link: "M9 8H5v8h4M15 8h4v8h-4M8 12h8",
  calendar: "M4 6h16v14H4zM4 10h16M8 3v5M16 3v5",
  file: "M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6",
  clock: "M4 4h16v16H4zM12 7v5l3 3",
  warning: "M12 4l9 16H3zM12 10v4M12 17v1",
  info: "M4 4h16v16H4zM12 11v6M12 7v1",
  source: "M6 3h12v18l-6-4-6 4z",
  pencil: "M4 20l1-5L16 4l4 4L9 19zM14 6l4 4",
  cycle: "M5 12V8h14M16 5l3 3-3 3M19 12v4H5M8 13l-3 3 3 3",
  // Kategorien: Finanzen (Beleg), Lohn (Abrechnung), Personal (Team), Vertrieb (Trichter), Betrieb (Lager)
  katFinanzen: "M6 3h9l4 4v14H6zM15 3v4h4M9 11h7M9 15h7M9 18h4",
  katLohn: "M2 6h20v12H2zM2 10a4 4 0 0 0 4-4M18 6a4 4 0 0 0 4 4M2 14a4 4 0 0 1 4 4M18 18a4 4 0 0 1 4-4M15 12a3 3 0 1 1-6 0a3 3 0 0 1 6 0",
  katPersonal: "M11 7a3 3 0 1 1-6 0a3 3 0 0 1 6 0M2 20v-2a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v2M19 9a3 3 0 1 1-6 0a3 3 0 0 1 6 0M17 14h1a4 4 0 0 1 4 4v2",
  katVertrieb: "M3 4h18l-7 8v7l-4 2v-9z",
  katBetrieb: "M3 9l9-5 9 5v12H3zM7 21v-9h10v9M7 16h10M7 18h10",
} as const;

export type IconName = keyof typeof PFADE;

export function Icon({
  name,
  titel,
  groesse = 20,
  className,
}: {
  name: IconName;
  /** Nur setzen, wenn das Icon allein Bedeutung trägt. Sonst bleibt es dekorativ. */
  titel?: string;
  groesse?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={groesse}
      height={groesse}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={className ? `icon ${className}` : "icon"}
      aria-hidden={titel ? undefined : true}
      role={titel ? "img" : undefined}
      focusable="false"
    >
      {titel ? <title>{titel}</title> : null}
      <path d={PFADE[name]} />
    </svg>
  );
}
