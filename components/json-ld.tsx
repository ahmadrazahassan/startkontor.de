/** Strukturierte Daten. Der Inhalt stammt aus unseren eigenen Daten, "<" wird maskiert. */
export function JsonLd({ daten }: { daten: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(daten).replace(/</g, "\\u003c") }}
    />
  );
}
