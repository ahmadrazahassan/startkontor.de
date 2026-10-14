import Link from "next/link";
import type { ReactNode } from "react";
import { parseInline } from "@/lib/inline";
import type { InlineKnoten } from "@/lib/inline";
import { nbsp } from "@/lib/nbsp";

function rendere(knoten: InlineKnoten[]): ReactNode[] {
  return knoten.map((k, i) => {
    if (k.typ === "text") return nbsp(k.text);
    if (k.typ === "fett") return <strong key={i}>{rendere(k.kinder)}</strong>;
    return (
      <Link key={i} href={k.href}>
        {rendere(k.kinder)}
      </Link>
    );
  });
}

/** Rendert Datenstrings mit **fett** und [Link](/pfad) und setzt geschützte Leerzeichen. Nie als HTML. */
export function Inline({ text }: { text: string }) {
  return <>{rendere(parseInline(text))}</>;
}
