import type { Metadata } from "next";
import { H1 } from "@/components/h1";
import Link from "next/link";
import { Inline } from "@/components/inline";
import { Icon } from "@/components/icons";
import { seiten } from "@/lib/daten";
import { metaFuer } from "@/lib/seo";

const s = seiten.notfound;

export const metadata: Metadata = metaFuer({ seo: s.seo, pfad: "/404" });

export default function NichtGefunden() {
  return (
    <section className="band">
      <div className="huelle nichtgefunden">
        <span className="nichtgefunden__ziffer" data-ziffer="404" aria-hidden="true" />
        <H1 text={s.h1} />
        <p className="lead">
          <Inline text={s.text} />
        </p>
        <ul className="nichtgefunden__links liste_ohne">
          {s.links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="bausteinmarke">
                {l.label}
                <Icon name="arrowRight" groesse={16} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
