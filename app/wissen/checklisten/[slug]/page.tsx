import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Brotkrumen } from "@/components/brotkrumen";
import { StationenMarken } from "@/components/chips";
import { Checkliste } from "@/components/checkliste";
import { Inline } from "@/components/inline";
import { KnopfLink } from "@/components/knopf";
import { Seitenkopf } from "@/components/seitenkopf";
import { checkTexteFuer } from "@/lib/checkliste-texte";
import { checklisten, leitfaedenMitCheckliste, navigation, seiten, ui } from "@/lib/daten";
import { metaFuer } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return checklisten.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = checklisten.find((x) => x.slug === slug);
  if (!c) return {};
  return metaFuer({ seo: c.seo, pfad: `/wissen/checklisten/${c.slug}` });
}

export default async function ChecklistenSeite({ params }: Props) {
  const { slug } = await params;
  const c = checklisten.find((x) => x.slug === slug);
  if (!c) notFound();
  const leitfaeden = leitfaedenMitCheckliste(c.id);

  return (
    <>
      <Brotkrumen
        punkte={[
          { label: navigation.kopfzeile[3].label, href: "/wissen" },
          { label: seiten.checklisten.eyebrow, href: "/wissen/checklisten" },
          { label: c.titel },
        ]}
      />
      <Seitenkopf eyebrow={seiten.checklisten.eyebrow} titel={c.titel} einleitung={c.einleitung}>
        <p className="seitenkopf__stationen">
          <StationenMarken stationen={c.stationen} verlinkt />
        </p>
      </Seitenkopf>

      <section className="band_eng">
        <div className="huelle checklistenseite">
          <Checkliste id={c.id} titel={c.titel} gruppen={c.gruppen} texte={checkTexteFuer(c.slug, false)} titelSichtbar={false} />

          <aside className="checklistenseite__rand nur_bildschirm">
            {leitfaeden.length > 0 ? (
              <>
                <h2 className="verwandt__titel">{ui.abschnitte.leitfaden.checklisteZumLeitfaden}</h2>
                <ul className="verwandt__liste liste_ohne">
                  {leitfaeden.map((l) => (
                    <li key={l.slug}>
                      <Link href={`/wissen/leitfaeden/${l.slug}`}>
                        <Inline text={l.titel} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
            <p className="rueckweg">
              <KnopfLink href="/wissen/checklisten" variante="sekundaer" icon="arrowLeft" iconLinks>
                {ui.knoepfe.alleChecklisten}
              </KnopfLink>
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
