import type { ReactNode } from "react";
import { Icon } from "@/components/icons";
import { wlStil } from "@/components/wort-stil";

/**
 * Akkordeon auf Basis von details und summary: funktioniert ohne JavaScript.
 * Das quadratische Plus Minus Zeichen zeigt den Zustand zusätzlich zur Beschriftung.
 */
export function Akkordeon({
  id,
  frage,
  children,
  ebene = 3,
  offen = false,
}: {
  id?: string;
  frage: ReactNode;
  children: ReactNode;
  ebene?: 2 | 3 | 4;
  offen?: boolean;
}) {
  const Titel = `h${ebene}` as "h2" | "h3" | "h4";
  return (
    <details id={id} className="akkordeon" open={offen}>
      <summary className="akkordeon__kopf">
        <Titel className="akkordeon__frage" style={wlStil(frage)}>{frage}</Titel>
        <span className="akkordeon__zeichen" aria-hidden="true">
          <Icon name="plus" groesse={20} className="akkordeon__plus" />
          <Icon name="minus" groesse={20} className="akkordeon__minus" />
        </span>
      </summary>
      <div className="akkordeon__inhalt">{children}</div>
    </details>
  );
}
