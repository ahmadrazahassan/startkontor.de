"use client";

import { useSearchParams } from "next/navigation";
import { Icon } from "@/components/icons";

/** Zeigt über dem Formular den Hinweis, wenn der Bestätigungslink ungültig oder abgelaufen war (?link=ungueltig). */
export function LinkUngueltig({ titel, text }: { titel: string; text: string }) {
  const params = useSearchParams();
  if (params.get("link") !== "ungueltig") return null;
  return (
    <div className="meldung meldung_fehler" role="alert">
      <Icon name="warning" groesse={22} />
      <div>
        <p className="meldung__titel">{titel}</p>
        <p>{text}</p>
      </div>
    </div>
  );
}
