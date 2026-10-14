import { Illustration } from "@/components/illustration";
import Link from "next/link";
import { Icon } from "@/components/icons";

export function AuswahlhilfeKarte() {
  return (
    <div className="auswahlhilfekarte">
      <Illustration motiv="software-planung" sizes="180px" />
      <h3>Welche Software passt zu Ihnen?</h3>
      <p>Vier Angaben zu Ihrem Unternehmen helfen Ihnen, die nächsten Schritte einzuordnen.</p>
      <Link href="/planer" className="knopf knopf_primaer knopf_breit"><span className="knopf__text">Auswahlhilfe starten</span><Icon name="arrowRight" groesse={18} /></Link>
    </div>
  );
}
