// Tabellen und Inline CSS für Gmail, Outlook und Apple Mail. Das echte Zeichen wird per CID eingebettet.
import { betreiber, ui } from "../daten.ts";
import { SITE_URL, absolut } from "../site.ts";
import texte from "../../data/newsletter-texte.json" with { type: "json" };
import { escapeHtml } from "./api.ts";

export type MailInhalt = { betreff: string; text: string; html: string };
const font = "'DM Sans',Arial,Helvetica,sans-serif";

function sichereUrl(link: string): string {
  const url = new URL(link, SITE_URL);
  if (!["https:", "http:"].includes(url.protocol)) throw new Error("Ungültiger Maillink");
  return escapeHtml(url.href);
}
function absatz(text: string): string {
  return `<p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#425468;">${escapeHtml(text)}</p>`;
}
function knopf(text: string, link: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0;"><tr><td bgcolor="#095fbb" style="border-radius:8px;"><a href="${sichereUrl(link)}" style="background:#095fbb;border:1px solid #095fbb;border-radius:8px;color:#ffffff;display:inline-block;font-family:${font};font-size:16px;font-weight:700;line-height:24px;padding:15px 25px;text-decoration:none;text-align:center;mso-padding-alt:0;"><!--[if mso]><i style="letter-spacing:25px;mso-font-width:-100%;mso-text-raise:22pt;">&nbsp;</i><![endif]--><span style="mso-text-raise:11pt;">${escapeHtml(text)}</span><!--[if mso]><i style="letter-spacing:25px;mso-font-width:-100%;">&nbsp;</i><![endif]--></a></td></tr></table>`;
}

export function mailRahmen({ betreff, vorschau, rubrik, titel, inhalt, abmeldeLink, fussHinweis }: {
  betreff: string; vorschau: string; rubrik: string; titel: string; inhalt: string; abmeldeLink?: string; fussHinweis?: string;
}): string {
  const f = texte.fuss;
  const adresse = [betreiber.BETREIBER_NAME, betreiber.STRASSE_UND_HAUSNUMMER, [betreiber.POSTLEITZAHL, betreiber.ORT].filter(Boolean).join(" ")].filter(Boolean).join(" · ");
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"><title>${escapeHtml(betreff)}</title>
<style>@media only screen and (max-width:620px){.email-aussen{padding:16px 10px!important}.email-inhalt{padding:30px 22px!important}.email-titel{font-size:28px!important;line-height:1.2!important}.email-fuss{padding:26px 22px!important}}a{color:#095fbb}body,table,td{font-family:${font}}</style></head>
<body style="margin:0;padding:0;width:100%;background:#e9f3f8;color:#0f2438;font-family:${font};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<div style="display:none;font-size:1px;line-height:1px;color:#e9f3f8;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${escapeHtml(vorschau)}${"&zwnj;&nbsp;".repeat(40)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#e9f3f8"><tr><td align="center" class="email-aussen" style="padding:36px 20px;">
<!--[if mso]><table role="presentation" width="600"><tr><td><![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;">
<tr><td style="padding:2px 0 28px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="52" valign="middle"><a href="${sichereUrl(SITE_URL)}"><img src="cid:startkontor-logo" width="40" height="40" alt="Startkontor" style="display:block;border:0;width:40px;height:40px;"></a></td><td valign="middle"><a href="${sichereUrl(SITE_URL)}" style="font-size:26px;line-height:32px;font-weight:700;letter-spacing:-.8px;color:#0f2438;text-decoration:none;">Startkontor</a></td></tr></table></td></tr>
<tr><td bgcolor="#ffffff" class="email-inhalt" style="border-top:4px solid #095fbb;border-radius:12px 12px 0 0;padding:42px 42px 36px;">
<p style="margin:0 0 15px;font-size:11px;font-weight:700;line-height:18px;letter-spacing:1.6px;text-transform:uppercase;color:#095fbb;">${escapeHtml(rubrik)}</p>
<h1 class="email-titel" style="margin:0 0 26px;font-size:34px;line-height:1.2;letter-spacing:-1px;font-weight:700;color:#0f2438;">${escapeHtml(titel)}</h1>
${inhalt}
</td></tr>
<tr><td bgcolor="#0a2540" class="email-fuss" style="border-radius:0 0 12px 12px;padding:30px 42px;color:#ffffff;">
<p style="margin:0 0 8px;font-size:18px;line-height:1.4;font-weight:600;color:#ffffff;">${escapeHtml(f.claim)}</p>
<p style="margin:0 0 22px;font-size:13px;line-height:1.6;color:#c6d7e8;">${escapeHtml(f.beschreibung)}</p>
<p style="margin:0 0 15px;font-size:12px;line-height:1.7;color:#c6d7e8;">${escapeHtml(f.kontakt)}</p>
<p style="margin:0 0 16px;font-size:12px;line-height:1.8;"><a href="${sichereUrl(absolut("/impressum"))}" style="color:#ffffff;text-decoration:underline;">${f.impressum}</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="${sichereUrl(absolut("/datenschutz"))}" style="color:#ffffff;text-decoration:underline;">${f.datenschutz}</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="${sichereUrl(absolut("/redaktion/werbung"))}" style="color:#ffffff;text-decoration:underline;">${f.werbung}</a></p>
<p style="margin:0;font-size:11px;line-height:1.7;color:#c6d7e8;">${escapeHtml(fussHinweis ?? (abmeldeLink ? ui.mails.monatsbrief.abmeldeSatz : f.bestaetigung))}${adresse ? `<br>${escapeHtml(adresse)}` : ""}</p>
${abmeldeLink ? `<p style="margin:14px 0 0;font-size:12px;line-height:1.7;"><a href="${sichereUrl(abmeldeLink)}" style="color:#ffffff;text-decoration:underline;">${escapeHtml(ui.mails.monatsbrief.abmeldeLink)}</a></p>` : ""}
</td></tr></table><!--[if mso]></td></tr></table><![endif]-->
</td></tr></table></body></html>`;
}

export function bestaetigungsMail(link: string): MailInhalt {
  const m = ui.mails.bestaetigung, t = texte.bestaetigung;
  const text = [m.anrede, "", ...m.absaetze.flatMap(a => [a, ""]), `${m.knopf}: ${link}`, "", m.gueltigkeit, "", m.gruss, m.absender].join("\n");
  const inhalt = absatz(m.anrede) + absatz(m.absaetze[0]) + knopf(m.knopf, link) +
    `<p style="margin:0 0 24px;font-size:13px;line-height:1.6;color:#425468;">${escapeHtml(m.gueltigkeit)}</p>` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td bgcolor="#e9f3f8" style="border-left:3px solid #7aacdc;padding:18px 20px;font-size:14px;line-height:1.6;color:#425468;">${escapeHtml(t.hinweis)}</td></tr></table>` +
    `<p style="margin:24px 0 14px;font-size:13px;line-height:1.6;color:#425468;">${escapeHtml(m.absaetze[1])}</p>` +
    `<p style="margin:0 0 24px;font-size:12px;line-height:1.6;color:#425468;overflow-wrap:anywhere;word-break:break-all;">Falls der Knopf nicht funktioniert, öffnen Sie diesen Link:<br><a href="${sichereUrl(link)}">${escapeHtml(link)}</a></p>` +
    absatz(`${m.gruss} · ${m.absender}`);
  return { betreff: m.betreff, text, html: mailRahmen({ betreff: m.betreff, vorschau: t.vorschau, rubrik: t.rubrik, titel: t.titel, inhalt }) };
}

export function willkommenMail(abmeldeLink: string): MailInhalt {
  const m = texte.willkommen;
  const schritte = m.schritte.map((s, i) => `<tr><td width="40" valign="top" style="padding:20px 0;border-top:1px solid #e0e7ee;font-size:13px;font-weight:700;color:#095fbb;">0${i + 1}</td><td style="padding:20px 0;border-top:1px solid #e0e7ee;"><h2 style="margin:0 0 7px;font-size:17px;line-height:1.4;color:#0f2438;">${escapeHtml(s.titel)}</h2><p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#425468;">${escapeHtml(s.text)}</p><a href="${sichereUrl(absolut(s.link))}" style="font-size:13px;font-weight:700;text-decoration:none;">${escapeHtml(s.knopf)} &rarr;</a></td></tr>`).join("");
  const text = [m.titel, "", m.einleitung, "", `${m.knopf}: ${absolut("/anbieter")}`, ...m.schritte.flatMap(s => ["", s.titel, s.text, absolut(s.link)]), "", `${ui.mails.monatsbrief.abmeldeLink}: ${abmeldeLink}`].join("\n");
  return { betreff: m.betreff, text, html: mailRahmen({ betreff: m.betreff, vorschau: m.vorschau, rubrik: m.rubrik, titel: m.titel, abmeldeLink, inhalt: absatz(m.einleitung) + knopf(m.knopf, absolut("/anbieter")) + `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${schritte}</table>` }) };
}

export type MonatsbriefAusgabe = { schluessel: string; betreff: string; vorschau: string; titel: string; einleitung: string; artikel: { rubrik: string; titel: string; text: string; pfad: string }[] };
export function monatsbriefMail(a: MonatsbriefAusgabe, abmeldeLink: string): MailInhalt {
  const karten = a.artikel.map(p => `<tr><td style="padding:22px 0;border-top:1px solid #e0e7ee;"><p style="margin:0 0 8px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#095fbb;">${escapeHtml(p.rubrik)}</p><h2 style="margin:0 0 10px;font-size:21px;line-height:1.35;color:#0f2438;">${escapeHtml(p.titel)}</h2><p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#425468;">${escapeHtml(p.text)}</p><a href="${sichereUrl(absolut(p.pfad))}" style="font-size:14px;font-weight:700;text-decoration:none;">Ratgeber lesen &rarr;</a></td></tr>`).join("");
  const text = [a.titel, "", a.einleitung, ...a.artikel.flatMap(p => ["", p.titel, p.text, absolut(p.pfad)]), "", `Software entdecken: ${absolut("/anbieter")}`, "", `${ui.mails.monatsbrief.abmeldeLink}: ${abmeldeLink}`].join("\n");
  return { betreff: a.betreff, text, html: mailRahmen({ betreff: a.betreff, vorschau: a.vorschau, rubrik: "Der Startkontor Monatsbrief", titel: a.titel, abmeldeLink, inhalt: absatz(a.einleitung) + `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${karten}</table>` + knopf("Software entdecken", absolut("/anbieter")) }) };
}

export function kontaktMail(daten: { name: string; email: string; betreff: string; nachricht: string; seite: string }): MailInhalt {
  const f = ui.mails.kontakt.feldNamen;
  const betreff = ui.mails.kontakt.betreffMuster.replace("{betreff}", daten.betreff);
  const zeilen: [string, string][] = [[f.name, daten.name], [f.email, daten.email], [f.nachricht, daten.nachricht], [f.seite, daten.seite]];
  const text = zeilen.map(([k, v]) => `${k}: ${v}`).join("\n\n");
  const inhalt = zeilen.map(([k, v]) => `<p style="margin:0 0 22px;font-size:15px;line-height:1.7;color:#425468;"><strong style="color:#0f2438;">${escapeHtml(k)}</strong><br>${escapeHtml(v).replace(/\n/g, "<br>")}</p>`).join("");
  // Interne Kontaktbenachrichtigungen haben einen eigenen neutralen Footertext.
  const html = mailRahmen({ betreff, vorschau: "Neue Nachricht über das Startkontor Kontaktformular.", rubrik: "Kontaktformular", titel: daten.betreff, inhalt, fussHinweis: "Interne Benachrichtigung über das Kontaktformular von Startkontor." });
  return { betreff, text, html };
}
