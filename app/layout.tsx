import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { schriftKlassen } from "./fonts";
import "./styles/reset.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/components/knoepfe.css";
import "./styles/components/chips.css";
import "./styles/components/logo.css";
import "./styles/components/strecke.css";
import "./styles/components/kopf.css";
import "./styles/components/suche.css";
import "./styles/components/fuss.css";
import "./styles/components/bild.css";
import "./styles/components/akte.css";
import "./styles/components/register.css";
import "./styles/components/akkordeon.css";
import "./styles/components/formulare.css";
import "./styles/components/tabelle.css";
import "./styles/components/software.css";
import "./styles/components/software-medien.css";
import "./styles/components/affiliate-partner.css";
import "./styles/pages/start.css";
import "./styles/pages/seiten.css";
import "./styles/pages/anbieter.css";
import "./styles/pages/wissen.css";
import "./styles/pages/planer.css";
import "./styles/pages/sonstiges.css";
import "./styles/pages/anpassung.css";
import "./styles/components/illustration.css";
import "./styles/pages/portal.css";
import "./styles/pages/portal-erweiterungen.css";
import "./styles/pages/zahlen.css";
import "./styles/pages/recht.css";
import "./styles/pages/knoepfe-glanz.css";
import "./styles/pages/kat.css";
import "./styles/pages/grafiken.css";
import "./styles/utilities.css";
import "./styles/print.css";
import { Analytics } from "@vercel/analytics/react";
import { Fuss } from "@/components/fuss";
import { Kopf, Mobilleiste } from "@/components/kopf/kopf";
import { marke, seo, ui } from "@/lib/daten";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: seo.startTitel, template: seo.titelMuster },
  description: marke.metaStandardBeschreibung,
  applicationName: marke.name,
  robots: { index: true, follow: true },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f1f1f1",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={seo.sprache} className={schriftKlassen}>
      <body>
        <a href="#inhalt" className="springlink">
          {ui.knoepfe.springeZumInhalt}
        </a>
        <Kopf />
        <main id="inhalt" tabIndex={-1}>
          {children}
        </main>
        <Fuss />
        <Mobilleiste />
        <Analytics />
      </body>
    </html>
  );
}
