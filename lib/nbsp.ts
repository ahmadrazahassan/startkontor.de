// Geschützte Leerzeichen (U+00A0) zwischen Zahl und Einheit, nach Paragrafenzeichen usw.
// Reine Funktion, wird vom Inline Renderer angewendet.

const NBSP = " ";

const MONATE =
  "Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember";

const REGELN: [RegExp, string][] = [
  [
    /(\d+) (?=(?:Euro|Prozent|Tage|Tagen|Monate|Monaten|Jahre|Jahren|Minuten|Beschäftigte|Nutzer)(?!\p{L}))/gu,
    `$1${NBSP}`,
  ],
  [/(§§?) (?=\d)/gu, `$1${NBSP}`],
  [/\b(Artikel|Absatz|Nummer|Satz) (?=\d)/gu, `$1${NBSP}`],
  [new RegExp(`(\\d+\\.) (?=(?:${MONATE})(?!\\p{L}))`, "gu"), `$1${NBSP}`],
];

export function nbsp(text: string): string {
  let ergebnis = text;
  for (const [muster, ersatz] of REGELN) {
    ergebnis = ergebnis.replace(muster, ersatz);
  }
  return ergebnis;
}
