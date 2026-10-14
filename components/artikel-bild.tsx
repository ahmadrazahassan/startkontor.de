import Image from "next/image";
import bilder from "@/data/artikelbilder.json";

export function ArtikelBild({ slug, prioritaet = false, className = "", sizes = "(min-width: 1100px) 400px, (min-width: 700px) 50vw, 100vw" }: { slug: string; prioritaet?: boolean; className?: string; sizes?: string }) {
  const bild = (bilder as Record<string, { datei: string; breite: number; hoehe: number; alt: string }>)[slug];
  if (!bild) return null;
  return <Image src={bild.datei} alt={bild.alt} width={bild.breite} height={bild.hoehe} sizes={sizes} priority={prioritaet} quality={90} className={`artikelbild ${className}`} />;
}
