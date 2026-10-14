import Link from "next/link";
import { Akte } from "@/components/akte";
import { SoftwareKarte } from "@/components/software-karte";
import { FristChip, StatusChip } from "@/components/chips";
import { StationenMarken } from "@/components/chips";
import { Inline } from "@/components/inline";
import { wlStil } from "@/components/wort-stil";
import { Register, RegisterZeile } from "@/components/register";
import { checklisteNachSlug, fristNachId, getBaustein, getCheckliste, getLeitfaden, planer, ui } from "@/lib/daten";
import { softwareKarte, softwareKarteTexte } from "@/lib/software-ansicht";
import type { Anbieter } from "@/lib/typen";

/** Kompakter Frist Eintrag, verweist auf das Fristenregister. */
export function FristKompakt({ id }: { id: string }) {
  const f = fristNachId.get(id);
  if (!f) throw new Error(`Unbekannte Frist ${id}`);
  return (
    <li className="fristkompakt" data-frist={f.status}>
      <div className="fristkompakt__kopf">
        <span className="fristkompakt__datum">{f.datum ? <time dateTime={f.datum}>{f.anzeige}</time> : ui.labels.wiederkehrend}</span>
        <FristChip status={f.status} />
      </div>
      <h3 className="fristkompakt__titel" style={wlStil(f.titel)}>
        <Link href={`/wissen/fristen#${f.id}`}>{f.titel}</Link>
      </h3>
      <p className="fristkompakt__text">
        <Inline text={f.text} />
      </p>
    </li>
  );
}

export function FristenKompaktListe({ ids }: { ids: string[] }) {
  return (
    <ul className="fristkompakt_liste liste_ohne">
      {ids.map((id) => (
        <FristKompakt key={id} id={id} />
      ))}
    </ul>
  );
}

export function LeitfadenRegister({ slugs, beschriftung }: { slugs: string[]; beschriftung: string }) {
  return (
    <Register beschriftung={beschriftung}>
      {slugs.map((slug, i) => {
        const l = getLeitfaden(slug);
        return (
          <RegisterZeile
            key={slug}
            nummer={String(i + 1).padStart(2, "0")}
            titel={<Inline text={l.titel} />}
            text={<Inline text={l.untertitel} />}
            href={`/wissen/leitfaeden/${slug}`}
            meta={
              <>
                <span>
                  {ui.labels.lesezeit} {l.lesezeit} {ui.labels.minuten}
                </span>
                <span>
                  {ui.labels.rechtsstand}: {l.rechtsstand}
                </span>
              </>
            }
          />
        );
      })}
    </Register>
  );
}

export function anzahlPunkte(slug: string): number {
  return getCheckliste(slug).gruppen.reduce((s, g) => s + g.punkte.length, 0);
}

export function ChecklistenAkten({ slugs }: { slugs: string[] }) {
  return (
    <div className="akten akten_zwei">
      {slugs.map((slug) => {
        const c = checklisteNachSlug.get(slug);
        if (!c) throw new Error(`Unbekannte Checkliste ${slug}`);
        return (
          <Akte
            key={slug}
            titel={<Inline text={c.titel} />}
            href={`/wissen/checklisten/${slug}`}
            linkText={ui.knoepfe.checklisteOeffnen}
            text={<Inline text={c.einleitung} />}
          >
            <p className="akte__meta">
              {anzahlPunkte(slug)} {ui.labels.punkte}
            </p>
            <StationenMarken stationen={c.stationen} />
          </Akte>
        );
      })}
    </div>
  );
}

export function AnbieterZeilen({ liste, hinweis = false }: { liste: Anbieter[]; hinweis?: boolean }) {
  return (
    <>
      {hinweis ? <p className="alphabetisch_hinweis">{ui.labels.alphabetisch}</p> : null}
      <ul className="kartenraster liste_ohne" aria-label={ui.labels.anbieter}>
        {liste.map((a) => (
          <li key={a.slug} className="kartenraster__eintrag">
            <SoftwareKarte karte={softwareKarte(a)} texte={softwareKarteTexte} />
          </li>
        ))}
      </ul>
    </>
  );
}

export function BausteinLink({ slug }: { slug: string }) {
  const b = getBaustein(slug);
  return <Link href={`/bausteine/${b.slug}`}>{b.name}</Link>;
}

/** Erklärt die vier Status in der Reihenfolge Jetzt bis Noch nicht nötig. */
export function StatusLegende() {
  return (
    <ul className="statuslegende liste_ohne">
      {planer.statusReihenfolge
        .slice()
        .reverse()
        .map((k) => (
          <li key={k}>
            <StatusChip status={k} />
            <span>{planer.statusAnzeige[k].kurz}</span>
          </li>
        ))}
    </ul>
  );
}
