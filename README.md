# Startkontor

Independent German editorial site for young B2B companies: which business software at which stage, what a wrong order costs, which deadlines stand behind it. All visible text is German. This README is for the operator and is in English on purpose.

Stack: Next.js 16 (App Router, Turbopack), React 19, strict TypeScript, plain CSS in `@layer`. Everything is static except the four API routes. No analytics. Product videos contact their external provider only after a visitor chooses to load them.

Production domain: `https://startkontor.de`. See [DEPLOYMENT.md](DEPLOYMENT.md) for environment setup, hosting and the remaining operator information required before public launch. Actual credentials belong in the ignored `.env.local` file or the host's private environment settings.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build, must finish with zero warnings
npm start            # serve the production build
```

Requires Node 24.x. `npm run dev` and `npm run build` first regenerate `public/suche-index.json` (search index) and `lib/client-texte.json` from the merged editorial content.

## Where things live

| Path | What |
|---|---|
| `data/startkontor-daten.json` | All content (copy of the file you were given). Read only for developers. Replace the whole file to update content. |
| `data/ui-ergaenzungen.json` | The few UI strings that the data file does not contain (see "Added German strings"). Merged under `ui` at load time. A key that already exists in the data file fails the build. |
| `data/startseite.json` | German copy of the review portal homepage (hero, search, logo strip, categories, review anatomy, manufacturer band) and of the review page labels. Numbers in braces are filled from the data. |
| `data/software-erweiterungen.json` | 17 additional researched profiles, integrated into the collective directory of 47 programs. |
| `data/software-medien.json` | Official manufacturer images and videos, with source URLs and version notes. |
| `data/affiliate-partner.json` | The four affiliate partnerships confirmed by the operator, with the supplied exact links. |
| `data/begriffe.json` | Term overrides on top of the data file ("Anbieterakte" becomes "Review", the menu item "Anbieter" becomes "Software Reviews", "Bausteine" becomes "Kategorien"; the planner keeps its name "Bausteinplaner"). Each entry has `pfad`, `alt` and `neu`. If the data file changes and `alt` is no longer in the text, the build fails and tells you which entry to adjust. `data/startkontor-daten.json` itself stays untouched. |
| `data/hersteller.json` | Company and location per provider (legal name, city, country) with source link and check date. Shown in the "Über den Hersteller" block of each review. Taken from the manufacturers' Impressum pages; for HubSpot, Microsoft, Odoo, Personio, HiBob and Factorial from their own contact, facts or press pages (no directly retrievable Impressum). Re-check before launch. |
| `data/bewertungen.json` | Editorial ratings per provider slug. Ships empty, so no stars are shown anywhere (see "Review portal and ratings"). |
| `config/betreiber.json` | Operator values for Impressum, Datenschutz, Kontakt. Ships empty. |
| `app/`, `components/`, `lib/` | Routes, UI, pure logic with tests. |
| `app/styles/` | Plain CSS: `reset`, `tokens`, `base`, `layout`, `components/*`, `pages/*`, `print`. |
| `public/bilder/` | Your photos (exact names below). |
| `public/logos/` | Provider logos, `<slug>.svg` or `<slug>.png`. |
| `public/werbung/sage/` | Official Sage banners, only used once the partner is live. |
| `scripts/` | Search index, launch gate, checks. |

## Review portal and ratings

The homepage follows the pattern of the big review portals (search first, clear next steps, category list with cards, directory) but is its own design: a hero with a pill search and decorative brand shapes, three paths ("Ich suche ein Programm", "Ich weiß nicht, wo ich anfange", "Ich habe mich schon entschieden"), five categories as a list with a card grid per category, an explanation of how a review is built (with a real example), the planner, guides, a "for manufacturers" band, an A to Z directory of all programs by category and the newsletter. `/anbieter` shows the same cards with the filters as pills. Every provider has a full review page at `/anbieter/<slug>`: header with logo and actions, a sticky tab bar with scroll tracking, and the blocks Überblick (facts and editorial verdict), Funktionen, Preise (price banner and plan cards), Eignung, Grenzen, Vertrag, Daten auf einen Blick, Über den Hersteller (with a correction request), Fragen für den Termin, Bewertung (empty state until ratings exist), Alternativen (same category, alphabetical, never ranked), FAQ (generated from the verified data, also as FAQPage structured data) and Quellen. On phones a fixed bar carries the manufacturer link. `lib/produkt.ts` builds the data table and the FAQ from the provider data, so nothing is invented; its tests are in `lib/produkt.test.ts`.

**No invented values.** There are no user reviews, no review counts, no user numbers and no quotes anywhere, because none exist. Stars and the criteria bars render only for providers that have an entry in `data/bewertungen.json`:

```json
{ "bewertungen": { "billomat": { "gesamt": 4.0, "stand": "2026-10-13", "kriterien": [ { "label": "Funktionsumfang", "wert": 4.0 } ] } } }
```

The build validates the slug, the range 0 to 5 and the ISO date. Before you enter the first value: write the method on `/redaktion/arbeitsweise` (criteria, weights, who rates, how often), and have the wording checked legally (UWG, the Omnibus rules on ratings). The data still says "no own test", so a rating must be explained as an editorial assessment of public sources.

**Texts that now contradict a rating system** and must be rewritten by the editors as soon as ratings go live: the homepage trust strip shows only three of the four principles (the fourth, "Keine Sterne und keine Rangliste", is hidden on purpose), but these still say there are no stars or comparisons: `seiten.start.prinzipien` (point 3), the FAQ entries `keine-sterne` and the one about comparison tables, the page "Arbeitsweise" (sections "Warum es keine Sterne gibt", "Warum es keine Gegenüberstellungen gibt"), `marke.positionierung` and the `redaktionsregeln`. The labels "Anbieterakte" and the menu item "Anbieter" are already renamed through `data/begriffe.json`; longer passages that describe the old concept (the "Arbeitsweise" page, the FAQ) still need an editor.

## Fonts

Three families, all free to use and self hosted (the browser never contacts Google at runtime):

| Role | Family | Where it comes from |
|---|---|---|
| Display (headlines, wordmark, card titles) | **DM Sans**, variable font | `public/fonts/dmsans/dm-sans-variable-*.woff2` (SIL Open Font License, licence text in the same folder) |
| Body text | **DM Sans**, weight 400 | locally hosted; no Google font request during a visit |
| UI (buttons, labels, tables) | **DM Sans**, weights 400–700 | same locally hosted variable font |

The supplied Ryker files were a demo (97 characters, no umlauts, watermark glyphs) and are no longer used. DM Sans has all German characters, so there is no fallback font and no gaps. `app/fonts.ts` is maintained by hand. The OG image uses `dm-sans-latin-900-normal.woff` because Satori cannot read WOFF2.

To change the display font, replace the files in `public/fonts/dmsans/`, adjust `app/fonts.ts` and the `--font-display` token in `app/styles/tokens.css`. Long words are handled by the `--wl` rule in `base.css` (headings never hyphenate, the size shrinks instead).

## Images

Upload by hand into `public/bilder/`. Names come from `bilder.plaetze` in the data. A missing file shows the designed brand placeholder, never a grey box.

| File | Ratio | Where |
|---|---|---|
| `hero-startseite.jpg` | 3:2, 1800 px wide | Home, next to the headline |
| `station-1-gruendung.jpg` to `station-5-ausbau.jpg` | 3:2, 1600 px | Station pages and Fahrplan |
| `baustein-finanzen.jpg`, `-lohn`, `-personal`, `-vertrieb`, `-betrieb` | 4:3, 1200 px | Baustein pages and cards |
| `redaktion.jpg` | 3:2, 1600 px | `/redaktion`, only shown if the file exists |

Photo direction: real daylight scenes in German offices and workshops, cool neutral grade that sits with `#095fbb` and `#e9f3f8`, people shown working, no posed handshakes, no visible brand logos, no text overlays. **If a photo shows something different from the alt text in `bilder.plaetze[].alt`, edit that alt text in the data file.** Never use stock "team" photos on the editorial page.

Leitfäden use generated cover illustrations matching the site's colors. Software reviews use original manufacturer screenshots; videos load only after a visitor's click. Media sources are recorded in `data/software-medien.json`.

Logos: put each provider logo into `public/logos/` as `<slug>.svg` or `<slug>.png`. Show only to identify the manufacturer, unchanged. Record the source of every logo in `public/logos/quellen.json`. Folders `public/product-media/` and `public/market-reference/` were already in the project and are **not used**. Delete them if they belong to the earlier comparison project.

## Operator values and the launch gate

Fill `config/betreiber.json` (empty strings are shipped, nothing is invented). These four may stay empty and their paragraph then disappears: `TELEFON`, `HANDELSREGISTER_UND_NUMMER_FALLS_VORHANDEN`, `UMSATZSTEUER_ID_FALLS_VORHANDEN`, `ANGABEN_ZUR_DRITTLANDUEBERMITTLUNG_FALLS_ZUTREFFEND`. Everything else is required. For reach measurement write either a description of the tool or the sentence "Wir messen die Nutzung dieser Website nicht." and set `ANALYSE_DIENST_ODER_KEINER` to "keiner". If you ever add analytics, rework the privacy text and a consent mechanism first.

Copy `.env.example` to `.env.local` (development) or set the variables at your host.

```bash
npm run gate           # shows what is missing, never fails (development)
npm run build:prod     # strict gate, then build, then scan the built HTML
```

`build:prod` fails if: a required operator value is empty, an environment variable is missing, a `{{PLACEHOLDER}}` is still visible in content, a builder only field leaked into the output, or a partner is `aktiv` without a link. It warns if the legal stand date is older than 30 days.

The Impressum and Datenschutz texts are **templates**. Have them reviewed legally before launch. In development a yellow banner on both pages lists the open placeholders.

## Newsletter and contact

* `POST /api/newsletter`: validates, checks honeypot and fill time (3 seconds), limits per IP (in memory, **best effort only** on serverless hosts because each instance has its own memory), sends a confirmation mail. The address is **not** stored yet and the response is always the same.
* `GET /api/newsletter/bestaetigen?token=…`: displays a confirmation page for the signed token (valid 48 hours). Its `POST` confirms the address, saves the signup time, confirmation time and consent version, adds the Resend contact to the group and sends a welcome email.
* `GET /api/newsletter/abmelden?token=…`: displays a confirmation page; `POST` unsubscribes. One Click unsubscribe requests are supported. Old signup links cannot reverse a later unsubscribe.
* `POST /api/kontakt`: one mail to `MAIL_TO`, no auto reply, no storage.
* The service uses Resend's current Contacts and Segments API. `npm run newsletter:setup` verifies the private environment and creates missing contact properties without changing an existing signing secret.
* Every newsletter issue you send must contain the unsubscribe link built with `erzeugeAbmeldeToken(email, NEWSLETTER_SECRET)` from `lib/newsletter/token.ts` and the sentence from `ui.mails.monatsbrief`.

Mail templates use the website colors, the real inline Startkontor logo, a dark footer and a plain-text alternative. `npm run newsletter:preview` creates previews. `npm run newsletter:test` sends the design preview to `MAIL_TO`. Edit `data/newsletter-ausgabe.json` and use `npm run newsletter:send` to send an approved issue to confirmed subscribers. Public sending requires the real operator name and postal address. No recurring campaign is scheduled automatically.

## Partner links and banners

Sage, Pipedrive, weclapp and Odoo are active through `data/affiliate-partner.json`, based on the operator's confirmation. Their supplied links keep the original parameters and carry visible German advertising disclosures and `rel="sponsored"`. Sage uses the approved Impact short link exactly as provided; click attribution is reported in the Sage/Impact partner dashboard. A partner is live only when `aktiv` is `true` **and** its `zielLink` no longer contains `{{`. Until then outbound links go straight to the manufacturer (`zielUrl`) and no affiliate banners appear. Account ownership and attribution must still be verified in the respective partner dashboards.

To switch one on:

1. Register **this site's own domain as a new property** in the affiliate network and wait for written approval. Programme approvals are tied to the registered website.
2. Put the network link into the matching key in `config/betreiber.json` (for example `SAGE_NETZWERKLINK_FUER_DIESE_DOMAIN`). Ask the partner manager to confirm the deep link parameters. The code uses `u` (URL encoded target) and `subId1` (placement) for Impact, see `lib/partner.ts`.
3. Set `aktiv` to `true` in the data file.
4. For Sage banners, download the official creatives yourself into `public/werbung/sage/` as `{satz}-{Breite}x{Höhe}.png` (for example `erp-728x90.png`, `hr-320x50.png`). The build never loads from the network. Banners appear only on the placements listed in `werbemittel.einsatz`, at most one per page, never in articles, legal pages or planner results.
5. Verify by reading the rendered HTML. **Do not click or test tracking links and do not generate test clicks.**

Partner status never changes order, text or assessment.

## Checks

```bash
npm test                 # unit tests: planner, search, inline parser, nbsp, dates, filters, partner links, placeholders, data integrity
npm run build            # zero warnings, zero type errors
npm run check:routen     # built routes equal the 128 routes in the merged data, exactly
npm run check:text       # typography scan of the built HTML (no dashes, no hyphen chains, no soft hyphens, banned words)
npm start                # in a second terminal, then:
SITE_BASIS=http://localhost:3000 node scripts/check-e2e.mjs   # axe (WCAG 2.2 AA), no third party requests, corner radius (up to 14 px, pills and circles allowed), no horizontal scroll, search, hero search, category tabs, menus, planner, checklist
```

For the end to end run, install the browser once with `npx playwright install chromium`. For local checks without real operator data, put obviously fake values into `config/betreiber.test.json` (it is git ignored) and start with `BETREIBER_DATEI=betreiber.test.json`.

`npm run shot -- /fahrplan 390` writes a screenshot at an exact width to `test-results/` (needs the dev server).

## Added German strings

The data file had no strings for a few accessibility labels. They are in `data/ui-ergaenzungen.json`, not in code: "Hauptnavigation", "Menü", "Fußzeile", "Brotkrumen", "Schnellzugriff", "Anfangsbuchstaben", "Suchergebnisse", "Platzhalter für ein Bild", "Punkte", "Punkt", "Seite neu laden". Review or rename them there.

## Launch checklist

1. Fonts: DM Sans is used throughout and hosted locally under the SIL Open Font License. Check the headlines once on the production URL.
2. Photos uploaded, alt texts match the photos. All 47 providers have a logo (some products reuse their manufacturer's brand logo). Check logo and product-media sources and usage permissions before launch.
3. `config/betreiber.json` and environment variables filled. `npm run build:prod` passes.
4. Impressum and Datenschutz reviewed legally.
5. Prices, features and legal statements re-verified on the manufacturer and statute pages. The data carries check dates 25 and 27 September 2026 and a legal stand of 13 October 2026. Update `marke.stand` afterwards.
6. Trademark and domain check for the name Startkontor.
7. Ratings: leave `data/bewertungen.json` empty until the method is published and legally reviewed. Rewrite the texts listed in "Review portal and ratings".
8. Resend domain verified, test the double opt in with your own address.
9. Affiliate: register the new domain in every network before setting any `aktiv` to `true`.
10. Lighthouse on the production URL (mobile): target 95 or better for performance, 100 for accessibility, best practices and SEO.
