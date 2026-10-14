import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/icons";
import type { IconName } from "@/components/icons";
import type { FristStatus, StatusKey } from "@/lib/typen";

// Rein präsentationale Chips ohne Datenzugriff. Texte kommen als Props, damit Client Komponenten
// diese Bausteine nutzen können, ohne die Datendatei in den Browser zu laden.

function StatusGlyph({ status }: { status: StatusKey }) {
  return (
    <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false" className="chip__glyph">
      {status === "jetzt" && <rect x="1" y="1" width="10" height="10" fill="currentColor" />}
      {status === "alsNaechstes" && (
        <>
          <rect x="1.75" y="1.75" width="8.5" height="8.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="1" y="1" width="5" height="10" fill="currentColor" />
        </>
      )}
      {status === "spaeter" && (
        <rect x="1.75" y="1.75" width="8.5" height="8.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      )}
      {status === "nichtNoetig" && (
        <rect
          x="1.75"
          y="1.75"
          width="8.5"
          height="8.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="2.2 1.8"
        />
      )}
    </svg>
  );
}

export function StatusChipRein({ status, label, kurz }: { status: StatusKey; label: string; kurz?: string }) {
  return (
    <span className="chip chip_status" data-status={status}>
      <StatusGlyph status={status} />
      <span>{label}</span>
      {kurz ? <span className="visuell_versteckt">: {kurz}</span> : null}
    </span>
  );
}

const FRIST_ICON: Record<FristStatus, IconName> = {
  gilt: "check",
  kommt: "arrowRight",
  entwurf: "pencil",
  wiederkehrend: "cycle",
};

export function FristChipRein({ status, label }: { status: FristStatus; label: string }) {
  return (
    <span className="chip chip_frist" data-frist={status}>
      <Icon name={FRIST_ICON[status]} groesse={14} />
      <span>{label}</span>
    </span>
  );
}

export function Chip({ children, ton }: { children: ReactNode; ton?: "nebel" | "ok" | "warn" | "primaer" }) {
  return <span className={ton ? `chip chip_${ton}` : "chip"}>{children}</span>;
}

/** Fünf quadratische Marken 1 bis 5. Zutreffende sind gefüllt. Die Beschriftung nennt die Nummern im Text. */
export function Stationsmarken({
  stationen,
  alleStationen,
  beschriftung,
  verlinkt = false,
  stationLabel,
}: {
  stationen: string[];
  alleStationen: { slug: string; nummer: number; name: string }[];
  beschriftung: string;
  verlinkt?: boolean;
  /** z. B. "Station", nur für verlinkte Marken nötig */
  stationLabel?: string;
}) {
  return (
    <span className="stationsmarken" role="group" aria-label={beschriftung}>
      {alleStationen.map((s) => {
        const aktiv = stationen.includes(s.slug);
        if (verlinkt && aktiv) {
          const text = `${stationLabel ?? ""} ${s.nummer}: ${s.name}`.trim();
          return (
            <Link
              key={s.slug}
              href={`/fahrplan/${s.slug}`}
              className="stationsmarke"
              data-aktiv="ja"
              aria-label={text}
              title={text}
            >
              {s.nummer}
            </Link>
          );
        }
        return (
          <span key={s.slug} className="stationsmarke" data-aktiv={aktiv ? "ja" : "nein"} aria-hidden="true">
            {s.nummer}
          </span>
        );
      })}
    </span>
  );
}
