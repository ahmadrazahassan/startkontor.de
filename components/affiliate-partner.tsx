import Link from "next/link";
import { Icon } from "@/components/icons";
import { KnopfLink } from "@/components/knopf";
import { holeLogo } from "@/lib/bilder";
import { anbieterNachSlug, partner } from "@/lib/daten";
import { istLive, linkFuer } from "@/lib/partner";

export function AffiliatePartner() {
  const aktive = partner.filter(istLive);
  if (!aktive.length) return null;
  return <section id="affiliatepartner" className="affiliatepartner" aria-labelledby="affiliatepartner-titel"><div className="huelle">
    <div className="affiliatepartner__kopf"><div><p className="eyebrow">Werbung & Transparenz</p><h2 id="affiliatepartner-titel">Unsere Affiliatepartner</h2><p>Unsere Teilnahme an den Partnerprogrammen von Sage, Pipedrive, weclapp und Odoo ist freigegeben. Über gekennzeichnete Links können wir eine Provision erhalten. Unsere redaktionellen Einschätzungen bleiben unabhängig.</p></div><Link href="/redaktion/werbung" className="textlink">So finanzieren wir Startkontor<Icon name="arrowRight" groesse={16} /></Link></div>
    <ul className="affiliatepartner__liste liste_ohne">{aktive.map((p) => {
      const a = anbieterNachSlug.get(p.produkte[0]);
      if (!a) return null;
      const logo = holeLogo(a.slug);
      const link = linkFuer(a, "start-affiliatepartner", partner);
      return <li key={p.schluessel} className="affiliatepartner__karte"><div className="affiliatepartner__identitaet">{logo ? <img src={logo.src} width={Math.round(44 * logo.breite / logo.hoehe)} height={44} alt="" loading="lazy" /> : null}<div><h3>{p.name}</h3><p>Freigegebenes Partnerprogramm</p></div></div><div className="affiliatepartner__aktionen"><KnopfLink href={link.href} extern werbung={link.werbung} klein ariaLabel={`Werbung: Zur Website von ${p.name}, öffnet in neuem Tab`}>Zur Website</KnopfLink><Link href={a.url} className="affiliatepartner__profil">Profil ansehen<Icon name="arrowRight" groesse={15} /></Link></div></li>;
    })}</ul>
  </div></section>;
}
