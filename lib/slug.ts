// Ids für Überschriften und Anker. Nicht sichtbar, daher sind Bindestriche hier erlaubt.

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Vergibt eindeutige ids, wenn derselbe Text mehrfach vorkommt. */
export function eindeutigeSlugs(texte: string[]): string[] {
  const gesehen = new Map<string, number>();
  return texte.map((t) => {
    const basis = slugify(t) || "abschnitt";
    const anzahl = gesehen.get(basis) ?? 0;
    gesehen.set(basis, anzahl + 1);
    return anzahl === 0 ? basis : `${basis}-${anzahl + 1}`;
  });
}
