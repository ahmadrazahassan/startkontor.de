"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useId, useMemo } from "react";
import { FristChipRein, Stationsmarken } from "@/components/chips-rein";
import { Inline } from "@/components/inline";
import { wlStil } from "@/components/wort-stil";
import { filtereFristen, leseFristFilter, nachJahrGruppiert } from "@/lib/fristen";
import type { FristFilter } from "@/lib/fristen";
import { nbsp } from "@/lib/nbsp";
import type { FristStatus } from "@/lib/typen";

export type RegisterFrist = {
  id: string;
  titel: string;
  art: string;
  datum: string | null;
  anzeige: string;
  status: FristStatus;
  text: string;
  stationen: string[];
  baustein: string;
  quelle: { titel: string; url: string };
  stand: string;
  leitfaden: { slug: string; titel: string };
};

export type RegisterTexte = {
  filterStation: string;
  filterBaustein: string;
  filterStatus: string;
  filterAlle: string;
  art: string;
  datum: string;
  ohneDatum: string;
  leitfaden: string;
  quellenZeitpunkt: string;
  station: string;
  statusLabels: Record<FristStatus, string>;
  extern: string;
  stationenBeschriftung: string;
  treffer: string;
  keine: string;
};

type Props = {
  fristen: RegisterFrist[];
  stationen: { slug: string; nummer: number; name: string }[];
  bausteine: { slug: string; name: string }[];
  texte: RegisterTexte;
};

function Eintrag({ f, texte, stationen }: { f: RegisterFrist; texte: RegisterTexte; stationen: Props["stationen"] }) {
  const nummern = stationen.filter((s) => f.stationen.includes(s.slug)).map((s) => s.nummer).join(", ");
  return (
    <li id={f.id} className="fristeintrag sprung_ziel" data-frist={f.status}>
      <span className="fristeintrag__knoten" aria-hidden="true" />
      <div className="fristeintrag__kopf">
        <p className="fristeintrag__datum">
          {f.datum ? <time dateTime={f.datum}>{nbsp(f.anzeige)}</time> : <span>{texte.ohneDatum}</span>}
        </p>
        <FristChipRein status={f.status} label={texte.statusLabels[f.status]} />
        <span className="fristeintrag__art">
          {texte.art}: {f.art}
        </span>
      </div>
      <h3 className="fristeintrag__titel" style={wlStil(f.titel)}>{nbsp(f.titel)}</h3>
      <p className="fristeintrag__text">
        <Inline text={f.text} />
      </p>
      <p className="fristeintrag__quelle">
        <a href={f.quelle.url} target="_blank" rel="noopener noreferrer" className="adresse">
          {f.quelle.titel}
          <span className="visuell_versteckt"> ({texte.extern})</span>
        </a>
        <span className="fristeintrag__stand">
          {texte.quellenZeitpunkt} {nbsp(f.stand)}
        </span>
      </p>
      <div className="fristeintrag__fuss">
        <Stationsmarken
          stationen={f.stationen}
          alleStationen={stationen}
          beschriftung={`${texte.stationenBeschriftung}: ${nummern}`}
        />
        <Link href={`/wissen/leitfaeden/${f.leitfaden.slug}`} className="fristeintrag__leitfaden">
          {texte.leitfaden}: <Inline text={f.leitfaden.titel} />
        </Link>
      </div>
    </li>
  );
}

function FristenGruppen({
  fristen,
  stationen,
  texte,
  idBasis,
}: {
  fristen: RegisterFrist[];
  stationen: Props["stationen"];
  texte: RegisterTexte;
  idBasis: string;
}) {
  const id = idBasis;
  const wiederkehrend = fristen.filter((f) => f.datum === null);
  const jahre = nachJahrGruppiert(fristen);
  return (
    <>
      {wiederkehrend.length > 0 ? (
        <section className="fristgruppe" aria-labelledby={`${id}-wiederkehrend`}>
          <h2 id={`${id}-wiederkehrend`} className="fristgruppe__titel">
            {texte.statusLabels.wiederkehrend}
          </h2>
          <ol className="fristenstrecke fristenstrecke_wiederkehrend">
            {wiederkehrend.map((f) => (
              <Eintrag key={f.id} f={f} texte={texte} stationen={stationen} />
            ))}
          </ol>
        </section>
      ) : null}

      {jahre.map((j) => (
        <section key={j.jahr} className="fristgruppe" aria-labelledby={`${id}-jahr-${j.jahr}`}>
          <h2 id={`${id}-jahr-${j.jahr}`} className="fristgruppe__titel">
            {j.jahr}
          </h2>
          <ol className="fristenstrecke">
            {j.fristen.map((f) => (
              <Eintrag key={f.id} f={f} texte={texte} stationen={stationen} />
            ))}
          </ol>
        </section>
      ))}
    </>
  );
}

/** Vollständige Liste ohne Filter: für den Server und für den Fall ohne JavaScript. */
export function FristenRegisterStatisch({ fristen, stationen, texte }: Omit<Props, "bausteine">) {
  return (
    <div className="fristenregister">
      <FristenGruppen fristen={fristen} stationen={stationen} texte={texte} idBasis="statisch" />
    </div>
  );
}

export function FristenRegister({ fristen, stationen, bausteine, texte }: Props) {
  const router = useRouter();
  const pfad = usePathname();
  const params = useSearchParams();
  const id = useId();

  const filter = useMemo(() => leseFristFilter(Object.fromEntries(params.entries())), [params]);
  const gefiltert = useMemo(() => filtereFristen(fristen, filter), [fristen, filter]);

  const setze = useCallback(
    (teil: Partial<FristFilter>) => {
      const neu = { ...filter, ...teil };
      const q = new URLSearchParams();
      if (neu.station) q.set("station", neu.station);
      if (neu.baustein) q.set("baustein", neu.baustein);
      if (neu.status) q.set("status", neu.status);
      const s = q.toString();
      router.replace(`${pfad}${s ? `?${s}` : ""}`, { scroll: false });
    },
    [filter, pfad, router],
  );

  const statusWerte = Object.keys(texte.statusLabels) as FristStatus[];

  return (
    <div className="fristenregister">
      <form className="filterleiste filterleiste_klein" onSubmit={(e) => e.preventDefault()}>
        <div className="filterleiste__zeile filterleiste__zeile_drei">
          <div className="feld">
            <label className="feld__label" htmlFor={`${id}-station`}>
              {texte.filterStation}
            </label>
            <select id={`${id}-station`} className="feld__eingabe" value={filter.station} onChange={(e) => setze({ station: e.target.value })}>
              <option value="">{texte.filterAlle}</option>
              {stationen.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {texte.station} {s.nummer}: {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="feld">
            <label className="feld__label" htmlFor={`${id}-baustein`}>
              {texte.filterBaustein}
            </label>
            <select id={`${id}-baustein`} className="feld__eingabe" value={filter.baustein} onChange={(e) => setze({ baustein: e.target.value })}>
              <option value="">{texte.filterAlle}</option>
              {bausteine.map((b) => (
                <option key={b.slug} value={b.slug}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div className="feld">
            <label className="feld__label" htmlFor={`${id}-status`}>
              {texte.filterStatus}
            </label>
            <select id={`${id}-status`} className="feld__eingabe" value={filter.status} onChange={(e) => setze({ status: e.target.value as FristStatus | "" })}>
              <option value="">{texte.filterAlle}</option>
              {statusWerte.map((s) => (
                <option key={s} value={s}>
                  {texte.statusLabels[s]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="filterleiste__treffer" role="status" aria-live="polite">
          {gefiltert.length} {texte.treffer}
        </p>
      </form>

      {gefiltert.length === 0 ? <p className="fristenregister__leer">{texte.keine}</p> : null}

      <FristenGruppen fristen={gefiltert} stationen={stationen} texte={texte} idBasis={id} />
    </div>
  );
}
