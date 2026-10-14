import type { Metadata } from "next";
import { Brotkrumen } from "@/components/brotkrumen";
import { Inline } from "@/components/inline";
import { Register, RegisterZeile } from "@/components/register";
import { Seitenkopf } from "@/components/seitenkopf";
import { navigation, partner, seiten } from "@/lib/daten";
import { istLive } from "@/lib/partner";
import { metaFuer } from "@/lib/seo";

const s = seiten.werbung;

export const metadata: Metadata = metaFuer({ seo: s.seo, pfad: "/redaktion/werbung" });

export default function WerbungSeite() {
  const aktive = partner.filter((p) => istLive(p));
  return (
    <>
      <Brotkrumen punkte={[{ label: navigation.kopfzeile[4].label, href: "/redaktion" }, { label: s.eyebrow }]} />
      <Seitenkopf eyebrow={s.eyebrow} titel={s.h1} einleitung={s.einleitung} />

      <section className="band_eng" aria-label={s.eyebrow}>
        <div className="huelle">
          <Register beschriftung={s.eyebrow}>
            {s.regeln.map((r, i) => (
              <RegisterZeile
                key={r.titel}
                ebene={2}
                nummer={String(i + 1).padStart(2, "0")}
                titel={<Inline text={r.titel} />}
                text={<Inline text={r.text} />}
                pfeil={false}
              />
            ))}
          </Register>
        </div>
      </section>

      <section className="band band_nebel" aria-labelledby="partner-titel">
        <div className="huelle">
          <h2 id="partner-titel" className="abschnittstitel">
            {s.partnerstatus.titel}
          </h2>
          {aktive.length === 0 ? (
            <p className="lead">
              <Inline text={s.partnerstatus.textKeine} />
            </p>
          ) : (
            <>
              <p className="lead">
                <Inline text={s.partnerstatus.textAktiv} />
              </p>
              <ul className="partnerliste">
                {aktive.map((p) => (
                  <li key={p.schluessel}>{p.name}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>
    </>
  );
}
