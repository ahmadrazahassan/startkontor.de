import type { CSSProperties, ReactNode } from "react";
import { wortStil } from "@/lib/typografie";

/** H1 mit Wortlängen Variable: Die Schrift wird nur so weit verkleinert, dass das längste Wort in die Spalte passt. */
export function H1({ text, children, className }: { text: string; children?: ReactNode; className?: string }) {
  return (
    <h1 className={className} style={wortStil(text) as CSSProperties}>
      {children ?? text}
    </h1>
  );
}
