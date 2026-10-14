// Originale Produktmedien und ihre Herkunft zusammenführen. Verändert keine Bilddateien.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const root = process.cwd();
const plans = [
  ["billomat", "https://www.billomat.com/onboarding/dashboard/", [["Billomat_Software", "billomat-02.png", "Finanzübersicht"], ["Dashboard-individuell", "billomat-01.png", "Anpassbares Dashboard"]]],
  ["fastbill", "https://www.fastbill.com/funktionen", [["Bildschirmfoto", "fastbill-01.png", "Banking und Zahlungsabgleich"]]],
  ["lexware-office", "https://www.lexware.de/buchhaltungssoftware/", [["dashboard.svg", "lexware-office-01.svg", "Finanzübersicht"], ["einnahmenueberschuss", "lexware-office-02.svg", "Einnahmenüberschussrechnung"]]],
  ["lexware-office-lohn-gehalt", "https://www.lexware.de/lohnprogramm-lohnsoftware/", [["arbeitsbescheinigung.svg", "lexware-office-lohn-gehalt-02.svg", "Übermittlung einer Arbeitsbescheinigung"], ["lohnabrechnungabgeschlossen", "lexware-office-lohn-gehalt-01.svg", "Abgeschlossene Lohnabrechnung"]]],
  ["sevdesk", "https://sevdesk.de/", [["sevdesk-dashboard-mockup", "sevdesk-01.webp", "Dashboard und Finanzkennzahlen"]]],
  ["factorial", "https://factorialhr.de/preise", [["core-pricing-page-de", "factorial-01.webp", "Personalverwaltung"], ["time-tracking-pricing-page-de", "factorial-02.webp", "Arbeitszeiterfassung"]]],
  ["hr-works", "https://www.hrworks.de/produkt/personalverwaltung-software/", [["Dashboard_Zeiterfassung", "hr-works-01.png", "Dashboard zur Zeiterfassung"]]],
  ["kenjo", "https://www.kenjo.io/de/", [["DE_Shiftplan", "kenjo-01.jpg", "Schichtplanung"], ["DE_Whoscheckedin", "kenjo-02.png", "Anwesenheitsübersicht"]]],
  ["centralstationcrm", "https://centralstationcrm.de/", [["Central_Station_CRM_Person_Details", "centralstationcrm-01.png", "Kontaktansicht"]]],
  ["hubspot-sales-hub", "https://www.hubspot.de/products/sales", [["Prospecting%20Workspace_de", "hubspot-sales-hub-01.jpg", "Arbeitsbereich für den Vertrieb"], ["Deal%20Scores_de", "hubspot-sales-hub-02.png", "Bewertung von Verkaufschancen"]]],
  ["pipedrive", "https://www.pipedrive.com/de/", [["Pipedrive-homepage-hero-25_DE", "pipedrive-02.png", "Vertriebspipeline"], ["Contacts-450-DE", "pipedrive-01.svg", "Kontakte und Aktivitäten"]]],
  ["superoffice-crm", "https://www.superoffice.de/preise/", [["feature_crm-suite-dashboard", "superoffice-crm-01.png", "Übersicht des CRM"]]],
  ["zoho-crm", "https://www.zoho.com/de/crm/", [["canvas-screen-crm-home", "zoho-crm-01.svg", "Anpassbare Kundenansicht"]]],
  ["microsoft-dynamics-365-business-central", "https://www.microsoft.com/de-de/dynamics-365/products/business-central", [["106513-Accordion-2-1", "microsoft-dynamics-365-business-central-01.jpg", "Dashboard mit Verkaufskennzahlen"]]],
  ["weclapp", "https://www.weclapp.com/de/", [["dashboard-weclapp-erp-homepage", "weclapp-01.png", "Dashboard der Warenwirtschaft"]]],
  ["xentral", "https://xentral.com/de/", [["cmumhshmqdo9z07w5l6vntpea", "xentral-01.webp", "Aufträge und Bearbeitungsstatus"]]],
  ["papierkram", "https://www.papierkram.de/funktionen/", [["elm_screen-notebook", "papierkram-02.png", "Papierkram am Desktop"], ["elm__feature--editor-templates", "papierkram-01.png", "Dokumentgestaltung"]]],
  ["accountable", "https://www.accountable.de/", [["features_revenues.webp", "accountable-01.webp", "Rechnungen und Einnahmen"]]],
  ["gdi-lohn-gehalt", "https://www.gdi.de/lohnabrechnung/", [["Gehalt-Lohn_Abrechnung", "gdi-lohn-gehalt-02.webp", "Lohnabrechnung"], ["Lohn-Gehalt_Meldewesen", "gdi-lohn-gehalt-01.webp", "Meldewesen"]]],
  ["clockodo", "https://www.clockodo.com/de/funktionen/", [["mockup-stoppuhr-mit-vorteilen", "clockodo-01.svg", "Zeiterfassung mit der Stoppuhr"], ["Exporte_fuer_die_Lohnbuchhaltung", "clockodo-02.png", "Export zur Lohnbuchhaltung"]]],
  ["hrlab", "https://www.hrlab.de/", [["hrlab-dashboard-screen-de", "hrlab-01.png", "Personalübersicht"], ["hrlab-digitale-personnel-file-de", "hrlab-02.png", "Digitale Personalakte"]]],
  ["rexx-hr", "https://www.rexx-systems.com/personalmanagement/", [["2024/02/personalmanagement_software", "rexx-hr-01.webp", "Übersicht der Personalverwaltung"]]],
  ["absence-io", "https://www.absence.io/de/", [["Abwesenheiten-Zeiterfassung-Desktop-Mobile-App", "absence-io-02.svg", "Abwesenheiten und Arbeitszeiten"], ["Personalfragebogen-an-Desktop", "absence-io-01.svg", "Digitale Personalakte"]]],
  ["cobra-crm", "https://cobra.de/", [["cobra_Grafik_Header_Cockpit", "cobra-crm-02.png", "Cockpit der Kundenverwaltung"], ["cobra_Grafik_Uebersicht_Business_intelligence", "cobra-crm-01.png", "Auswertung und Kennzahlen"]]],
  ["salesforce-sales-cloud", "https://www.salesforce.com/de/sales/cloud/", [["reports-and-dashboards", "salesforce-sales-cloud-02.jpg", "Vertriebsberichte und Dashboards"], ["pdp-lead-management", "salesforce-sales-cloud-01.webp", "Bearbeitung eines Leads"]]],
  ["jtl-wawi", "https://www.jtl-software.com/de/warenwirtschaftssystem-software/", [["2025/10/jtl-warenwirtschaft-demo.png", "jtl-wawi-01.png", "Benutzeroberfläche der Warenwirtschaft"]]],
  ["haufe-x360", "https://www.haufe-x360.de/", [["Projektcontrolling-Controlling", "haufe-x360-02.png", "Projektcontrolling"], ["QMS-Dashboard", "haufe-x360-01.jpg", "Qualitätsmanagement"]]],
  ["abas-erp", "https://abas-erp.com/de/", [["abas-erp-dashboard-fertigungsuebersicht", "abas-erp-01.webp", "Fertigungsübersicht"]]],
];

const decode = (s) => s.replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#038;", "&");
function images(html, base) {
  const out = [];
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const attr = (key) => decode(m[0].match(new RegExp(`\\b${key}=["']([^"']*)["']`, "i"))?.[1] || "");
    let src = attr("data-src") || attr("src");
    if (!src || src.startsWith("data:")) continue;
    const big = [...attr("srcset").matchAll(/(\S+)\s+(\d+)w(?:,|$)/g)].sort((a, b) => Number(b[2]) - Number(a[2]))[0];
    if (big) src = big[1];
    out.push(new URL(src, base).href);
  }
  return [...new Set(out)];
}
function originalImage(src) {
  const u = new URL(src);
  if (u.pathname === "/_next/image" && u.searchParams.has("url")) return new URL(u.searchParams.get("url"), u.origin).href;
  if (u.pathname.startsWith("/_image/") && u.searchParams.has("href")) return u.searchParams.get("href");
  const inner = src.indexOf("/https://");
  if (inner > 0 && src.includes("/cdn-cgi/image/")) return src.slice(inner + 1);
  if (u.hostname === "www.datocms-assets.com") u.search = "";
  return u.href;
}

const rasterCode = 'import json,sys,pathlib\nfrom PIL import Image\nr=[]\nfor p in pathlib.Path(sys.argv[1]).glob("*"):\n if p.suffix.lower() in [".png",".jpg",".jpeg",".webp",".gif",".avif"]:\n  with Image.open(p) as im:r.append({"name":p.name,"breite":im.width,"hoehe":im.height})\nprint(json.dumps(r))';
const python = "C:/Users/Ahmed/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe";
const sizes = new Map(JSON.parse(execFileSync(python, ["-c", rasterCode, join(root, "public/bilder/software")]).toString()).map((x) => [x.name, { breite: x.breite, hoehe: x.hoehe }]));
const profiles = {};
const research = [];
await mkdir(join(root, "recherche"), { recursive: true });
for (let offset = 0; offset < plans.length; offset += 6) {
  const found = await Promise.all(plans.slice(offset, offset + 6).map(async ([slug, source, choices]) => {
    const r = await fetch(source, { signal: AbortSignal.timeout(20000) });
    if (!r.ok) throw new Error(`${slug}: Herstellerseite ${r.status}`);
    const all = images(await r.text(), r.url);
    const bilder = [];
    for (const [needle, file, titel] of choices) {
      const url = all.find((x) => x.includes(needle));
      if (!url) throw new Error(`${slug}: Originalquelle fehlt für ${file}`);
      let masse = sizes.get(file);
      if (file.endsWith(".svg")) {
        const svg = await readFile(join(root, "public/bilder/software", file), "utf8");
        if (/<script\b|\bonload\s*=|javascript:/i.test(svg)) throw new Error(`Aktive Inhalte in ${file}`);
        const v = svg.match(/viewBox=["']([^"']+)["']/)?.[1].trim().split(/\s+/).map(Number);
        masse = { breite: Math.round(v?.[2] || Number(svg.match(/\bwidth=["']([\d.]+)/)?.[1])), hoehe: Math.round(v?.[3] || Number(svg.match(/\bheight=["']([\d.]+)/)?.[1])) };
      }
      if (!masse?.breite || !masse?.hoehe) throw new Error(`Bildmaße fehlen für ${file}`);
      bilder.push({ src: `/bilder/software/${file}`, ...masse, titel, alt: `${titel}: Originalansicht von ${slug}.`, quelle: r.url, original: originalImage(url) });
    }
    return [slug, { bilder }];
  }));
  for (const [slug, p] of found) { profiles[slug] = p; research.push({ slug, ...p }); }
  await writeFile(join(root, "recherche/software-medien-root.json"), JSON.stringify({ profile: profiles }, null, 2) + "\n");
}

await writeFile(join(root, "data/software-medien.json"), JSON.stringify({ profile: profiles }, null, 2) + "\n");
console.log(`Originalmedien: ${Object.keys(profiles).length} Profile, ${Object.values(profiles).reduce((sum, p) => sum + p.bilder.length, 0)} Bilder.`);
