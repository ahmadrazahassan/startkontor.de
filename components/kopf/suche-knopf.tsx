"use client";

import { Icon } from "@/components/icons";

export const SUCHE_EREIGNIS = "startkontor:suche-oeffnen";

type Props = {
  label: string;
  kuerzel?: string;
  variante: "streifen" | "leiste" | "mobil";
};

export function SucheKnopf({ label, kuerzel, variante }: Props) {
  return (
    <button
      type="button"
      className={`sucheknopf sucheknopf_${variante}`}
      aria-haspopup="dialog"
      onClick={() => window.dispatchEvent(new Event(SUCHE_EREIGNIS))}
    >
      <Icon name="search" groesse={variante === "streifen" ? 16 : 20} />
      <span>{label}</span>
      {kuerzel ? <kbd className="sucheknopf__kuerzel">{kuerzel}</kbd> : null}
    </button>
  );
}
