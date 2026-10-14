import Link from "next/link";
import { Icon } from "@/components/icons";

export function SoftwareEntscheidung() {
  return <div className="entscheidung">
    <div><p className="eyebrow">Ihr nächster Schritt</p><h2>Welche Software passt zu Ihrem Alltag?</h2><p>Grenzen Sie Ihren Bedarf ein und prüfen Sie Funktionen, Preise und Verträge, bevor Sie sich entscheiden.</p></div>
    <div className="entscheidung__aktionen"><Link href="/anbieter" className="knopf knopf_primaer">Software entdecken<Icon name="arrowRight" groesse={18} /></Link><Link href="/planer" className="knopf knopf_sekundaer">Auswahlhilfe starten</Link></div>
  </div>;
}
