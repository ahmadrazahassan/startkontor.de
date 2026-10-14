"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { ladeSuchindex } from "@/components/kopf/suche-dialog";
import { gruppiere, sucheEintraege } from "@/lib/suche";
import type { SuchEintrag } from "@/lib/suche";

type Props = {
  platzhalter: string;
  absenden: string;
  keineTreffer: string;
  gruppen: string[];
};

/** Suchseite: gleiche Logik wie der Dialog, Anfrage in ?q=. Ohne JavaScript sendet das Formular die Anfrage nur zurück an dieselbe Adresse. */
export function SuchSeite({ platzhalter, absenden, keineTreffer, gruppen }: Props) {
  const params = useSearchParams();
  const router = useRouter();
  const id = useId();
  const q = params.get("q") ?? "";
  const [eingabe, setEingabe] = useState(q);
  const [index, setIndex] = useState<SuchEintrag[]>([]);

  useEffect(() => {
    ladeSuchindex().then(setIndex);
  }, []);
  useEffect(() => setEingabe(q), [q]);

  const treffer = useMemo(() => gruppiere(sucheEintraege(index, q), gruppen), [index, q, gruppen]);

  return (
    <div className="suchseite">
      <form
        action="/suche"
        method="get"
        role="search"
        className="suchseite__formular"
        onSubmit={(e) => {
          e.preventDefault();
          router.replace(eingabe.trim() ? `/suche?q=${encodeURIComponent(eingabe.trim())}` : "/suche");
        }}
      >
        <div className="feld suchseite__feld">
          <label htmlFor={`${id}-q`} className="visuell_versteckt">
            {platzhalter}
          </label>
          <input
            id={`${id}-q`}
            name="q"
            type="search"
            className="feld__eingabe"
            placeholder={platzhalter}
            value={eingabe}
            onChange={(e) => setEingabe(e.target.value)}
            autoComplete="off"
          />
        </div>
        <button type="submit" className="knopf knopf_primaer">
          <Icon name="search" groesse={18} />
          <span className="knopf__text">{absenden}</span>
        </button>
      </form>

      <div aria-live="polite">
        {q.trim() !== "" && treffer.length === 0 && index.length > 0 ? <p className="suchseite__leer">{keineTreffer}</p> : null}
        {treffer.map((g) => (
          <section key={g.gruppe} className="suchseite__gruppe" aria-label={g.gruppe}>
            <h2>{g.gruppe}</h2>
            <ul className="register liste_ohne">
              {g.treffer.map((t) => (
                <li key={t.url} className="glossarregister__zeile">
                  <h3 className="register__titel">
                    <Link href={t.url} className="register__link">
                      {t.titel}
                    </Link>
                  </h3>
                  {t.kurz ?? t.snippet ? <p className="register__text">{t.kurz ?? t.snippet}</p> : null}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
