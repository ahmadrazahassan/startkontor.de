import { FristChipRein, StatusChipRein, Stationsmarken } from "@/components/chips-rein";
import { planer, stationen, ui } from "@/lib/daten";
import type { FristStatus, StatusKey } from "@/lib/typen";

// Server Komfort Wrapper um die reinen Chips. Hier werden die Texte aus den Daten geholt.

export { Chip } from "@/components/chips-rein";

export function StatusChip({ status, mitKurz = false }: { status: StatusKey; mitKurz?: boolean }) {
  const a = planer.statusAnzeige[status];
  return <StatusChipRein status={status} label={a.label} kurz={mitKurz ? a.kurz : undefined} />;
}

const FRIST_LABEL: Record<FristStatus, string> = {
  gilt: ui.labels.gilt,
  kommt: ui.labels.kommt,
  entwurf: ui.labels.entwurf,
  wiederkehrend: ui.labels.wiederkehrend,
};

export function fristLabel(status: FristStatus): string {
  return FRIST_LABEL[status];
}

export function FristChip({ status }: { status: FristStatus }) {
  return <FristChipRein status={status} label={FRIST_LABEL[status]} />;
}

export const alleStationenKurz = stationen.map((s) => ({ slug: s.slug, nummer: s.nummer, name: s.name }));

export function StationenMarken({ stationen: slugs, verlinkt = false }: { stationen: string[]; verlinkt?: boolean }) {
  const nummern = alleStationenKurz.filter((s) => slugs.includes(s.slug)).map((s) => s.nummer);
  return (
    <Stationsmarken
      stationen={slugs}
      alleStationen={alleStationenKurz}
      verlinkt={verlinkt}
      stationLabel={ui.labels.station}
      beschriftung={`${ui.abschnitte.anbieter.stationen}: ${nummern.join(", ")}`}
    />
  );
}
