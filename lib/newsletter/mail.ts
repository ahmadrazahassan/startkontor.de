// Mailtexte. Alle Wörter stammen aus ui.mails. Kein Tracking, keine fremden Bilder, Knopf eckig.

import { ui } from "../daten.ts";
import { escapeHtml } from "./api.ts";

export function bestaetigungsMail(link: string): { betreff: string; text: string; html: string } {
  const m = ui.mails.bestaetigung;
  const text = [m.anrede, "", ...m.absaetze.flatMap((a) => [a, ""]), `${m.knopf}: ${link}`, "", m.gueltigkeit, "", m.gruss, m.absender].join("\n");
  const absaetze = m.absaetze.map((a) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;">${escapeHtml(a)}</p>`).join("");
  const html = `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(m.betreff)}</title></head>
<body style="margin:0;padding:24px;background:#f1f1f1;font-family:Arial,Helvetica,sans-serif;color:#0f2438;">
<div style="max-width:560px;margin:0 auto;background:#ffffff;padding:32px;border-top:6px solid #095fbb;">
<p style="margin:0 0 16px;font-size:16px;line-height:1.6;">${escapeHtml(m.anrede)}</p>
${absaetze}
<p style="margin:24px 0;"><a href="${escapeHtml(link)}" style="display:inline-block;padding:14px 24px;background:#095fbb;color:#ffffff;font-weight:bold;font-size:16px;text-decoration:none;border-radius:0;">${escapeHtml(m.knopf)}</a></p>
<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#425468;">${escapeHtml(m.gueltigkeit)}</p>
<p style="margin:0;font-size:16px;line-height:1.6;">${escapeHtml(m.gruss)}<br>${escapeHtml(m.absender)}</p>
</div></body></html>`;
  return { betreff: m.betreff, text, html };
}

export function kontaktMail(daten: { name: string; email: string; betreff: string; nachricht: string; seite: string }): {
  betreff: string;
  text: string;
  html: string;
} {
  const f = ui.mails.kontakt.feldNamen;
  const betreff = ui.mails.kontakt.betreffMuster.replace("{betreff}", daten.betreff);
  const zeilen: [string, string][] = [
    [f.name, daten.name],
    [f.email, daten.email],
    [f.nachricht, daten.nachricht],
    [f.seite, daten.seite],
  ];
  const text = zeilen.map(([k, v]) => `${k}: ${v}`).join("\n\n");
  const html = `<!doctype html><html lang="de"><head><meta charset="utf-8"></head><body style="font-family:Arial,Helvetica,sans-serif;color:#0f2438;">${zeilen
    .map(
      ([k, v]) =>
        `<p style="margin:0 0 16px;line-height:1.6;"><strong>${escapeHtml(k)}</strong><br>${escapeHtml(v).replace(/\n/g, "<br>")}</p>`,
    )
    .join("")}</body></html>`;
  return { betreff, text, html };
}
