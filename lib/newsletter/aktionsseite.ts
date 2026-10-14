import { mailRahmen } from "./mail.ts";
import { escapeHtml } from "./api.ts";
import { ui } from "../daten.ts";

/** GET zeigt eine Aktion; erst POST ändert den Newsletterstatus. Mail-Linkscanner lösen nichts aus. */
export function aktionsseite(aktion: "bestaetigen" | "abmelden", token: string, ursprung: string): Response {
  const bestaetigen = aktion === "bestaetigen";
  const titel = bestaetigen ? "Nur noch ein Klick." : "Möchten Sie den Monatsbrief abbestellen?";
  const text = bestaetigen ? ui.newsletter.einwilligung : "Nach der Bestätigung erhalten Sie keine weiteren Ausgaben des Startkontor Monatsbriefs. Sie können sich jederzeit erneut anmelden.";
  const label = bestaetigen ? "Anmeldung bestätigen" : "Vom Monatsbrief abmelden";
  const inhalt = `<p style="font-size:16px;line-height:1.7;color:#425468;">${escapeHtml(text)}</p><form action="/api/newsletter/${aktion}" method="post"><input type="hidden" name="token" value="${escapeHtml(token)}"><button type="submit" style="margin:20px 0;background:#095fbb;border:0;border-radius:8px;padding:16px 24px;font:700 16px Arial,sans-serif;color:#ffffff;cursor:pointer;">${label}</button></form><p style="font-size:13px;line-height:1.7;"><a href="/datenschutz">Datenschutzerklärung</a></p>`;
  const html = mailRahmen({ betreff: label, vorschau: text, rubrik: "Startkontor Monatsbrief", titel, inhalt, fussHinweis: "Ihre Newsletter-Einstellungen können Sie jederzeit ändern." })
    .replace("cid:startkontor-logo", `${ursprung}/marke/startkontor-email-logo.png`)
    .replace("<meta charset=\"utf-8\">", "<meta charset=\"utf-8\"><meta name=\"robots\" content=\"noindex,nofollow\">");
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } });
}
