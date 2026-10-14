import { readFile, writeFile, copyFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const read = async (file) => JSON.parse(await readFile(resolve(root, file), "utf8"));
const base = await read("data/startkontor-daten.json");
const extra = await read("data/software-erweiterungen.json");
const names = new Map([...base.anbieter, ...extra.anbieter].map((a) => [a.slug, a.name]));
const registry = await read("recherche/software-medien-root.json");
const clean = (s) => s?.replaceAll("Light Mode", "Helle Oberfläche").replaceAll("Dark Mode", "Dunkle Oberfläche").replaceAll("–", ":").replaceAll("HR-Plattform", "Personalplattform").replaceAll("HR-Kennzahlen", "Personalkennzahlen").replaceAll("CFO-Dashboard", "Finanzdashboard").replaceAll("Basis-Modul", "Basismodul").replaceAll("Sales-Workspace", "Vertriebsarbeitsplatz").replaceAll("Hersteller-Aufzeichnung", "Herstelleraufzeichnung").replaceAll("Payroll-Demos", "Vorführungen zur Lohnabrechnung").replaceAll("Personal-Portal", "Personalportal").replaceAll("edlohn-Homepage", "edlohn Website").replaceAll("PersonioDACH-Webinar", "Webinar von PersonioDACH").replaceAll("Cloud-Payroll", "Lohnabrechnung in der Cloud").replaceAll("Cloud-Abrechnung", "Lohnabrechnung in der Cloud").replaceAll("HR-Komponente", "Personalkomponente").replaceAll("Live-Demo", "Livevorführung").replaceAll("KI-Agenten", "KI Agenten").replaceAll("Omnichannel-Kommunikation", "Kommunikation über mehrere Kanäle").replaceAll("UI-Clip", "Clip der Oberfläche");

for (const [slug, p] of Object.entries(registry.profile)) {
  for (const b of p.bilder) b.alt = `${b.titel}: Originalansicht von ${names.get(slug)}.`;
}
for (const file of ["sage", "payroll", "remaining"]) {
  const source = await read(`recherche/software-medien-${file}.json`);
  for (const p of source.profiles ?? source.anbieter) {
    if (!p.images.length) continue;
    registry.profile[p.slug] = {
      bilder: p.images.map((b) => ({
        src: b.src, breite: b.width, hoehe: b.height,
        titel: clean(b.title), alt: b.alt,
        quelle: b.source ?? b.sourceUrl ?? b.sourcePage,
        original: b.original ?? b.originalUrl,
        ...(b.note || b.caption || b.assetKind?.includes("mobilen") ? { hinweis: clean(b.note ?? b.caption ?? "Originalabbildung der mobilen App des Herstellers. Die Desktopansicht kann abweichen.") } : {}),
      })),
    };
    if (p.video) registry.profile[p.slug].video = normalizeVideo({ slug: p.slug, ...p.video });
  }
}

function normalizeVideo(v) {
  const source = v.source ?? v.sourceUrl ?? v.sourcePage;
  let embed = v.embedUrl ?? v.url;
  let external = v.url;
  let type = v.type;
  if (type === "youtube") {
    const q = new URLSearchParams({ rel: "0", playsinline: "1", hl: "de" });
    if (v.startSeconds) q.set("start", String(v.startSeconds));
    embed = `https://www.youtube-nocookie.com/embed/${v.id}?${q}`;
    if (v.startSeconds) external += `&t=${v.startSeconds}s`;
  }
  if (type === "vimeo") {
    const u = new URL(v.embedUrl ?? `https://player.vimeo.com/video/${v.id}`);
    u.searchParams.set("dnt", "1");
    embed = u.toString();
    // Unlisted Vimeo videos need their original hash even for the external fallback.
    if (u.searchParams.has("h")) external = `https://vimeo.com/${v.id}/${u.searchParams.get("h")}`;
  }
  if (type === "mp4") type = "datei";
  return {
    typ: type,
    titel: clean(v.title),
    anbieter: type === "youtube" ? "YouTube" : type === "vimeo" ? "Vimeo" : names.get(v.slug) ?? "Hersteller",
    einbettung: embed, extern: external, quelle: source,
    sprache: v.language === "de" ? "Deutsch" : v.language === "en" ? "Englisch" : v.language,
    ...(v.note ? { hinweis: clean(v.note) } : {}),
  };
}

await copyFile(resolve(root, "recherche/easybill-candidate-2.png"), resolve(root, "public/bilder/software/easybill-01.png"));
const easybill = await read("recherche/easybill-image-source.json");
registry.profile.easybill = { bilder: [{ src: "/bilder/software/easybill-01.png", breite: 1999, hoehe: 818, titel: "eBay mit easybill Connect verbinden", alt: "Originalansicht der eBay Schnittstelle in easybill Connect mit Navigation und Verbindungseinstellungen.", quelle: easybill.source, original: "https://support.easybill.de/hc/article_attachments/30353839514524", hinweis: "Herstellerbeispiel der eBay Anbindung in easybill Connect. Die roten Markierungen stammen aus der offiziellen Anleitung." }] };

const rootClips = [
  { slug: "fastbill", id: "2QLZODHpR88", source: "https://www.fastbill.com/funktionen", title: "FastBill: Buchhaltung im Überblick" },
  { slug: "lexware-office", id: "mNP94c9iGxA", source: "https://www.lexware.de/buchhaltungssoftware/", title: "Lexware Office: Automatische Onlinebuchhaltung" },
  { slug: "lexware-office-lohn-gehalt", id: "ldXr0w3Arrg", source: "https://www.lexware.de/lohnprogramm-lohnsoftware/", title: "Lexware Office Lohn & Gehalt: Produkttour" },
  { slug: "papierkram", id: "W7I7RTB15VY", source: "https://www.papierkram.de/funktionen/", title: "Papierkram: Buchhaltung im Arbeitsalltag", note: "Herstellervideo mit einer Kundin über digitale Buchhaltung für Selbstständige." },
  { slug: "rexx-hr", id: "PgQlV-i4_QQ", source: "https://www.rexx-systems.com/personalmanagement/", title: "rexx HR: Personalmanagement mit der rexx Suite" },
  { slug: "clockodo", id: "R-AqsA565Gg", source: "https://www.clockodo.com/de/blog/neue-stoppuhr/", title: "Clockodo: Kunden und Projektzeiten erfassen" },
  { slug: "easybill", id: "e5XNRHpid1Q", source: easybill.source, title: "easybill: eBay Rechnungen automatisieren" },
  { slug: "centralstationcrm", type: "vimeo", id: "943680237", source: "https://centralstationcrm.de/", title: "CentralStationCRM im Überblick" },
  { slug: "weclapp", type: "mp4", url: "https://www.weclapp.com/remote-image/de-new/videos/Weclapp_Brandmovie_Final_DE_4k_compressed.mp4", source: "https://www.weclapp.com/de/", title: "weclapp: Produktvorstellung" },
].map((v) => ({ type: "youtube", language: "Deutsch", url: `https://www.youtube.com/watch?v=${v.id}`, ...v }));
const verified = await read("recherche/software-videos-root-verification.json");
for (const v of rootClips) {
  if (v.type === "youtube" && !verified.some((r) => r.id === v.id && r.status === 200)) throw new Error(`Ungeprüftes Video: ${v.slug}`);
  registry.profile[v.slug].video = normalizeVideo(v);
}
for (let v of (await read("recherche/software-videos-extra.json")).videos) {
  if (v.slug === "zoho-crm") v = { slug: v.slug, ...v.alternative };
  if (v.slug === "xentral") v.note = "Offizielle Webinaraufzeichnung. Das Video beginnt bei der Produktdemo ab Minute 17:01.";
  registry.profile[v.slug].video = normalizeVideo(v);
}
for (const [slug, p] of Object.entries(registry.profile)) {
  if (!names.has(slug)) throw new Error(`Unbekanntes Profil: ${slug}`);
  for (const b of p.bilder) {
    if (!(b.breite > 0 && b.hoehe > 0)) throw new Error(`Bildmaße fehlen: ${b.src}`);
    if (!(await stat(resolve(root, "public", b.src.slice(1)))).size) throw new Error(`Leeres Bild: ${b.src}`);
    if (!/^https:\/\//.test(b.quelle) || !/^https:\/\//.test(b.original)) throw new Error(`Bildquelle fehlt: ${b.src}`);
  }
  if (p.video?.sprache?.startsWith("Englisch;")) p.video.sprache = "Englisch";
}
const corrections = await read("recherche/software-medien-korrekturen.json");
for (const slug of new Set(corrections.map((b) => b.slug))) {
  registry.profile[slug].bilder = corrections.filter((b) => b.slug === slug).map((b) => ({
    src: b.src, breite: b.width, hoehe: b.height, titel: b.title, alt: b.alt, quelle: b.source, original: b.url,
    ...(b.note ? { hinweis: b.note } : {}),
  }));
}
for (const slug of ["microsoft-dynamics-365-business-central", "superoffice-crm", "pipedrive", "zoho-crm", "hibob-bob", "odoo"]) {
  for (const b of registry.profile[slug].bilder) b.hinweis = "Originalbeispiel des Herstellers mit englischer Benutzeroberfläche. Darstellung und Funktionsumfang können je nach Version, Sprache und Tarif abweichen.";
}
await writeFile(resolve(root, "data/software-medien.json"), JSON.stringify(registry, null, 2) + "\n");
console.log(JSON.stringify({ profile: Object.keys(registry.profile).length, bilder: Object.values(registry.profile).reduce((n, p) => n + p.bilder.length, 0), videos: Object.values(registry.profile).filter((p) => p.video).length, ohne: [...names.keys()].filter((slug) => !registry.profile[slug]) }));
