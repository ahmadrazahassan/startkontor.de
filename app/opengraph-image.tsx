import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { marke } from "@/lib/daten";
import { MARKENZEICHEN } from "@/lib/markenzeichen";

export const alt = `${marke.name}: ${marke.claim}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const HALTE = [0, 1, 2, 3, 4];

/**
 * Standard Open Graph Bild, beim Build erzeugt: Grundfarbe, Wortmarke und Claim in DM Sans, Strecke mit fünf Haltepunkten.
 * Satori liest kein WOFF2, deshalb kommt die WOFF Datei aus public/fonts/dmsans.
 */
export default async function Bild() {
  const schwarz = await readFile(join(process.cwd(), "public/fonts/dmsans/dm-sans-latin-900-normal.woff"));
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f1f1f1",
          padding: "72px 80px",
          fontFamily: "DM Sans",
          color: "#0f2438",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg viewBox="0 0 40 40" width={64} height={64}><path d={MARKENZEICHEN.haupt} fill="#095fbb" /><path d={MARKENZEICHEN.neben} fill="#7aacdc" /></svg>
          <div style={{ fontSize: 52, fontWeight: 900, letterSpacing: -1 }}>{marke.name}</div>
        </div>

        <div style={{ display: "flex", fontSize: 92, lineHeight: 1.04, fontWeight: 900, letterSpacing: -2, maxWidth: 980 }}>
          {marke.claim}
        </div>

        <div style={{ display: "flex", position: "relative", height: 36, alignItems: "center" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 16, height: 5, background: "#7aacdc", display: "flex" }} />
          <div style={{ display: "flex", width: "100%", justifyContent: "space-between" }}>
            {HALTE.map((i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  width: 36,
                  height: 36,
                  background: i === 4 ? "#095fbb" : "#7aacdc",
                  borderRadius: 4,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "DM Sans", data: schwarz, weight: 900, style: "normal" }] },
  );
}
