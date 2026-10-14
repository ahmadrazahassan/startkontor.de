import { isValidElement } from "react";
import type { CSSProperties, ReactNode } from "react";
import { laengstesWort } from "@/lib/typografie";

/** Längstes Wort in einem Knoten (Text oder <Inline text="…">), für die wortabhängige Schriftgröße. */
function wl(knoten: ReactNode): number {
  if (typeof knoten === "string") return laengstesWort(knoten);
  if (typeof knoten === "number") return String(knoten).length;
  if (Array.isArray(knoten)) return knoten.reduce<number>((m, k) => Math.max(m, wl(k as ReactNode)), 0);
  if (isValidElement(knoten)) {
    const props = knoten.props as { text?: unknown; children?: ReactNode };
    if (typeof props.text === "string") return laengstesWort(props.text);
    return wl(props.children);
  }
  return 0;
}

/** Style mit --wl, wenn der Knoten ein langes Wort enthält. Wörter werden nie getrennt, die Schrift passt sich an. */
export function wlStil(knoten: ReactNode): CSSProperties | undefined {
  const n = wl(knoten);
  return n >= 14 ? ({ "--wl": n } as CSSProperties) : undefined;
}
