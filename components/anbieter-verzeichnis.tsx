"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useId, useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { AuswahlhilfeKarte } from "@/components/auswahlhilfe-karte";
import { SoftwareKarte } from "@/components/software-karte";
import type { SoftwareKarteDaten, SoftwareKarteTexte } from "@/components/software-karte";
import { anbieterFilterZuQuery, leseAnbieterFilter, sortiereAlphabetisch, STANDARD_ANBIETER_FILTER } from "@/lib/filter";
import type { AnbieterFilter, PreisFilter, Sortierung } from "@/lib/filter";
import { parseDeutschesDatum } from "@/lib/datum";
import type { PreisStatus } from "@/lib/typen";

export type VerzeichnisZeile = SoftwareKarteDaten & { baustein: string; preisStatus: PreisStatus; monatlichKuendbar: boolean };

export type VerzeichnisTexte = {
  baustein: string;
  alle: string;
  preis: string;
  preisOptionen: [string, string, string];
  vertrag: string;
  sortierung: string;
  sortierOptionen: [string, string];
  zuruecksetzen: string;
  trefferEinzahl: string;
  trefferMehrzahl: string;
  hinweis: string;
  anbieter: string;
};

type Props = {
  zeilen: VerzeichnisZeile[];
  bausteine: { slug: string; name: string }[];
  texte: VerzeichnisTexte;
  karteTexte: SoftwareKarteTexte;
};

function filtere(zeilen: VerzeichnisZeile[], f: AnbieterFilter): VerzeichnisZeile[] {
  let liste = zeilen.filter((z) => {
    if (f.baustein && z.baustein !== f.baustein) return false;
    if (f.preis === "veroeffentlicht" && z.preisStatus !== "veroeffentlicht") return false;
    if (f.preis === "anfrage" && z.preisStatus === "veroeffentlicht") return false;
    if (f.monatlich && !z.monatlichKuendbar) return false;
    return true;
  });
  liste = sortiereAlphabetisch(liste);
  if (f.sort === "geprueft") {
    const iso = (z: VerzeichnisZeile) => parseDeutschesDatum(z.geprueft) ?? "";
    liste = liste
      .map((z, i) => ({ z, i }))
      .sort((a, b) => iso(b.z).localeCompare(iso(a.z)) || a.i - b.i)
      .map((x) => x.z);
  }
  return liste;
}

function Karten({ liste, texte, karteTexte }: { liste: VerzeichnisZeile[]; texte: VerzeichnisTexte; karteTexte: SoftwareKarteTexte }) {
  return (
    <>
      <h2 className="visuell_versteckt">{texte.anbieter}</h2>
      <ul className="softwareliste liste_ohne" aria-label={texte.anbieter}>
        {liste.map((z) => (
          <li key={z.slug} id={`anbieter-${z.slug}`} className="kartenraster__eintrag">
            <SoftwareKarte karte={z} texte={karteTexte} variante="liste" ebene={3} />
          </li>
        ))}
      </ul>
    </>
  );
}

export function AnbieterVerzeichnis({ zeilen, bausteine, texte, karteTexte }: Props) {
  const router = useRouter();
  const pfad = usePathname();
  const params = useSearchParams();
  const id = useId();
  const [filterOffen, setFilterOffen] = useState(false);

  const filter = useMemo(
    () => leseAnbieterFilter(Object.fromEntries(params.entries()), bausteine.map((b) => b.slug)),
    [params, bausteine],
  );
  const liste = useMemo(() => filtere(zeilen, filter), [zeilen, filter]);
  const istStandard = JSON.stringify(filter) === JSON.stringify(STANDARD_ANBIETER_FILTER);

  const setze = useCallback(
    (teil: Partial<AnbieterFilter>) => {
      const neu = { ...filter, ...teil };
      router.replace(`${pfad}${anbieterFilterZuQuery(neu)}`, { scroll: false });
    },
    [filter, pfad, router],
  );

  const preisWerte: PreisFilter[] = ["alle", "veroeffentlicht", "anfrage"];
  const sortWerte: Sortierung[] = ["alphabetisch", "geprueft"];
  const treffer = `${liste.length} ${liste.length === 1 ? texte.trefferEinzahl : texte.trefferMehrzahl}`;

  return (
    <div className="verzeichnis" data-filteroffen={filterOffen ? "ja" : "nein"}>
      <button className="verzeichnis__filterknopf knopf knopf_sekundaer" type="button" aria-expanded={filterOffen} aria-controls={`${id}-filter`} onClick={() => setFilterOffen(!filterOffen)}>
        <span>{filterOffen ? "Filter ausblenden" : "Filter anzeigen"}</span><Icon name="arrowDown" groesse={18} />
      </button>
      <aside id={`${id}-filter`} className="verzeichnis__rand" aria-label="Software filtern">
      <form className="filterleiste" onSubmit={(e) => e.preventDefault()} aria-label={texte.baustein}>
        <h2 className="filterleiste__titel">Software filtern</h2>
        <fieldset className="segmente">
          <legend className="feld__label">{texte.baustein}</legend>
          <div className="segmente__reihe">
            {[{ slug: "", name: texte.alle }, ...bausteine].map((b) => (
              <label key={b.slug || "alle"} className="segment">
                <input
                  type="radio"
                  name={`${id}-baustein`}
                  className="segment__eingabe"
                  checked={filter.baustein === b.slug}
                  onChange={() => setze({ baustein: b.slug })}
                />
                <span className="segment__text">{b.name}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="filterleiste__zeile">
          <fieldset className="segmente">
            <legend className="feld__label">{texte.preis}</legend>
            <div className="segmente__reihe">
              {preisWerte.map((w, i) => (
                <label key={w} className="segment">
                  <input
                    type="radio"
                    name={`${id}-preis`}
                    className="segment__eingabe"
                    checked={filter.preis === w}
                    onChange={() => setze({ preis: w })}
                  />
                  <span className="segment__text">{texte.preisOptionen[i]}</span>
                </label>
              ))}
            </div>
          </fieldset>

        </div>

        <div className="filterleiste__fuss">
          <label className="haken" htmlFor={`${id}-monatlich`}>
            <input
              id={`${id}-monatlich`}
              type="checkbox"
              className="haken__eingabe"
              checked={filter.monatlich}
              onChange={(e) => setze({ monatlich: e.target.checked })}
            />
            <span className="haken__box" aria-hidden="true">
              <Icon name="check" groesse={18} />
            </span>
            <span className="haken__text">{texte.vertrag}</span>
          </label>

            {!istStandard ? (
              <button
                type="button"
                className="knopf knopf_sekundaer knopf_klein"
                onClick={() => router.replace(pfad, { scroll: false })}
              >
                <span className="knopf__text">{texte.zuruecksetzen}</span>
              </button>
            ) : null}
        </div>
      </form>
      <AuswahlhilfeKarte />
      </aside>
      <div className="verzeichnis__resultate">
        <div className="verzeichnis__kopf">
          <div>
            <p className="filterleiste__treffer" role="status" aria-live="polite">{treffer}</p>
            <p className="filterhinweis">{filter.sort === "geprueft" ? "Nach Prüfdatum sortiert. Die Reihenfolge enthält keine Wertung." : texte.hinweis}</p>
          </div>
          <label className="verzeichnis__sortierung">
            <span>{texte.sortierung}</span>
            <select value={filter.sort} onChange={(e) => setze({ sort: e.target.value as Sortierung })}>
              {sortWerte.map((w, i) => <option key={w} value={w}>{texte.sortierOptionen[i]}</option>)}
            </select>
          </label>
        </div>
        {liste.length === 0 ? (
          <div className="verzeichnis__leer"><h2>Keine Programme gefunden</h2><p>Ändern Sie die Filter, um weitere Programme zu sehen.</p></div>
        ) : <Karten liste={liste} texte={texte} karteTexte={karteTexte} />}
      </div>
    </div>
  );
}

/** Statische Fassung für den Server und für den Fall ohne JavaScript: komplette Liste, alphabetisch. */
export function AnbieterVerzeichnisStatisch({ zeilen, texte, karteTexte }: Omit<Props, "bausteine">) {
  return (
    <div className="verzeichnis" data-filteroffen="nein">
      <aside className="verzeichnis__rand" aria-label="Software filtern">
        <div className="filterleiste filterleiste_laden"><h2 className="filterleiste__titel">Software filtern</h2><p>Filter werden geladen.</p></div>
        <AuswahlhilfeKarte />
      </aside>
    <div className="verzeichnis__resultate">
      <div className="verzeichnis__kopf"><div><p className="filterleiste__treffer">{zeilen.length} {texte.trefferMehrzahl}</p><p className="filterhinweis">{texte.hinweis}</p></div></div>
      <Karten liste={sortiereAlphabetisch(zeilen)} texte={texte} karteTexte={karteTexte} />
    </div>
    </div>
  );
}
