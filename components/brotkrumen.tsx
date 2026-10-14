import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { navigation, ui } from "@/lib/daten";
import { absolut } from "@/lib/site";

export type Krume = { label: string; href?: string };

/** Brotkrumen auf allen Seiten außer der Startseite. Die letzte Krume ist nicht verlinkt. */
export function Brotkrumen({ punkte }: { punkte: Krume[] }) {
  const alle: Krume[] = [{ label: navigation.brotkrumen.start, href: "/" }, ...punkte];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: alle.map((k, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: k.label,
      ...(k.href ? { item: absolut(k.href) } : {}),
    })),
  };
  return (
    <>
      <nav className="brotkrumen huelle" aria-label={ui.barrierefreiheit.brotkrumen}>
        <ol className="brotkrumen__liste">
          {alle.map((k, i) => {
            const letzte = i === alle.length - 1;
            return (
              <li key={`${k.label}-${i}`} className="brotkrumen__punkt">
                {letzte || !k.href ? (
                  <span aria-current="page">{k.label}</span>
                ) : (
                  <Link href={k.href}>{k.label}</Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd daten={jsonLd} />
    </>
  );
}
