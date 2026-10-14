import Link from "next/link";
import { ArtikelBild } from "@/components/artikel-bild";
import { Icon } from "@/components/icons";
import { Inline } from "@/components/inline";
import { getBaustein } from "@/lib/daten";
import { parseDeutschesDatum } from "@/lib/datum";
import type { Leitfaden } from "@/lib/typen";

export function ArtikelKarte({ artikel, ebene = 3 }: { artikel: Leitfaden; ebene?: 2 | 3 | 4 }) {
  const Titel = `h${ebene}` as "h2" | "h3" | "h4";
  return (
    <article className="artikelkarte">
      <Link href={`/wissen/leitfaeden/${artikel.slug}`} className="artikelkarte__bildlink" tabIndex={-1} aria-hidden="true"><ArtikelBild slug={artikel.slug} /></Link>
      <div className="artikelkarte__inhalt">
        <p className="artikelkarte__meta">{getBaustein(artikel.baustein).kurzname}<span aria-hidden="true">·</span>{artikel.lesezeit} Min. Lesezeit</p>
        <Titel><Link href={`/wissen/leitfaeden/${artikel.slug}`}><Inline text={artikel.titel} /></Link></Titel>
        <p className="artikelkarte__text"><Inline text={artikel.untertitel} /></p>
        <div className="artikelkarte__fuss"><span>Stand: <time dateTime={parseDeutschesDatum(artikel.rechtsstand) ?? undefined}>{artikel.rechtsstand}</time></span><Link href={`/wissen/leitfaeden/${artikel.slug}`} className="textlink" aria-label={`Artikel lesen: ${artikel.titel}`}>Artikel lesen<Icon name="arrowRight" groesse={16} /></Link></div>
      </div>
    </article>
  );
}
