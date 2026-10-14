import Image from "next/image";
import motive from "@/data/bildmotive.json";

export type MotivId = keyof typeof motive;

type Props = {
  motiv: MotivId;
  className?: string;
  sizes?: string;
  prioritaet?: boolean;
  symbolbild?: boolean;
  /** Originaldatei ohne verkleinerte oder verlustbehaftete Variante ausliefern. */
  original?: boolean;
};

/** Lokale Bildserie mit deutschen Alternativtexten und reserviertem Bildformat. */
export function Illustration({
  motiv,
  className = "",
  sizes = "(min-width: 1024px) 480px, 92vw",
  prioritaet = false,
  symbolbild = false,
  original = false,
}: Props) {
  const bild = motive[motiv];
  return (
    <figure className={["illustration", bild.transparent ? "" : "illustration_foto", className].filter(Boolean).join(" ")}>
      <Image
        src={bild.datei}
        alt={bild.alt}
        width={bild.breite}
        height={bild.hoehe}
        sizes={sizes}
        priority={prioritaet}
        fetchPriority={original ? "high" : undefined}
        unoptimized={original}
        className="illustration__bild"
      />
      {symbolbild ? <figcaption className="illustration__hinweis">Symbolbild</figcaption> : null}
    </figure>
  );
}

