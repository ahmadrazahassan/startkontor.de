import type { Metadata } from "next";
import { Abschnitt } from "@/components/abschnitt";
import { Brotkrumen } from "@/components/brotkrumen";
import { Inline } from "@/components/inline";
import { Seitenkopf } from "@/components/seitenkopf";
import { navigation, seiten } from "@/lib/daten";
import { metaFuer } from "@/lib/seo";
import { slugify } from "@/lib/slug";

const s = seiten.arbeitsweise;

export const metadata: Metadata = metaFuer({ seo: s.seo, pfad: "/redaktion/arbeitsweise" });

export default function ArbeitsweiseSeite() {
  return (
    <>
      <Brotkrumen
        punkte={[{ label: navigation.kopfzeile[4].label, href: "/redaktion" }, { label: s.eyebrow }]}
      />
      <Seitenkopf eyebrow={s.eyebrow} titel={s.h1} einleitung={s.einleitung} />

      <div className="huelle">
        {s.abschnitte.map((a) => (
          <Abschnitt key={a.nummer} nummer={a.nummer} id={`abschnitt-${slugify(a.titel)}`} titel={<Inline text={a.titel} />}>
            <div className="fliesstext stapel">
              {a.absaetze.map((p, i) => (
                <p key={i}>
                  <Inline text={p} />
                </p>
              ))}
            </div>
          </Abschnitt>
        ))}

        <section className="grenzenbox" aria-labelledby="grenzen-titel">
          <h2 id="grenzen-titel">
            <Inline text={s.grenzen.titel} />
          </h2>
          <ul className="fliesstext">
            {s.grenzen.punkte.map((p) => (
              <li key={p}>
                <Inline text={p} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
