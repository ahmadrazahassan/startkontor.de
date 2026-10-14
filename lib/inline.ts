// Inline Markup der Daten: nur **fett** und [Linktext](/interner/pfad).
// Der Parser liefert einen kleinen Baum. React Rendering liegt in components/inline.tsx.

export type InlineKnoten =
  | { typ: "text"; text: string }
  | { typ: "fett"; kinder: InlineKnoten[] }
  | { typ: "link"; href: string; kinder: InlineKnoten[] };

export function parseInline(eingabe: string): InlineKnoten[] {
  const knoten: InlineKnoten[] = [];
  let puffer = "";
  let i = 0;

  const leere = () => {
    if (puffer) {
      knoten.push({ typ: "text", text: puffer });
      puffer = "";
    }
  };

  while (i < eingabe.length) {
    if (eingabe.startsWith("**", i)) {
      const ende = eingabe.indexOf("**", i + 2);
      if (ende > i + 2) {
        leere();
        knoten.push({ typ: "fett", kinder: parseInline(eingabe.slice(i + 2, ende)) });
        i = ende + 2;
        continue;
      }
    }
    if (eingabe[i] === "[") {
      const mitte = eingabe.indexOf("](", i + 1);
      const ende = mitte === -1 ? -1 : eingabe.indexOf(")", mitte + 2);
      const text = mitte === -1 ? "" : eingabe.slice(i + 1, mitte);
      if (mitte > i && ende > mitte && !text.includes("[")) {
        const href = eingabe.slice(mitte + 2, ende);
        if (!href.startsWith("/") || href.startsWith("//")) {
          throw new Error(`Inline Link muss mit / beginnen und intern sein: "${href}" in "${eingabe.slice(0, 80)}"`);
        }
        leere();
        knoten.push({ typ: "link", href, kinder: parseInline(text) });
        i = ende + 1;
        continue;
      }
    }
    puffer += eingabe[i];
    i += 1;
  }
  leere();
  return knoten;
}

export function sammleLinks(knoten: InlineKnoten[]): string[] {
  const links: string[] = [];
  for (const k of knoten) {
    if (k.typ === "link") {
      links.push(k.href, ...sammleLinks(k.kinder));
    } else if (k.typ === "fett") {
      links.push(...sammleLinks(k.kinder));
    }
  }
  return links;
}

export function inlineZuText(eingabe: string): string {
  const flach = (k: InlineKnoten[]): string =>
    k.map((n) => (n.typ === "text" ? n.text : flach(n.kinder))).join("");
  return flach(parseInline(eingabe));
}

export function enthaeltInlineMarkup(eingabe: string): boolean {
  return eingabe.includes("**") || /\[[^\]]*\]\(\//.test(eingabe);
}
