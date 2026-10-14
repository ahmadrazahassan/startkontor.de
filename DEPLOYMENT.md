# Startkontor deployen

Die öffentliche Hauptadresse ist `https://startkontor.de`. Die Website verwendet Node.js 24.x und Next.js auf Vercel. Ein reiner HTML Export reicht wegen der Kontakt- und Newsletter-API nicht aus.

## Umgebungsvariablen

`.env.example` enthält die öffentlichen Standardwerte und die Namen der benötigten Variablen. `.env.local` enthält die tatsächliche lokale Konfiguration und wird nicht mit Git übertragen. Beim Hoster müssen die Werte separat als private Umgebungsvariablen hinterlegt werden. Das gilt auch für Vorschau-Deployments, die Formulare anbieten sollen.

| Variable | Verwendung |
| --- | --- |
| `SITE_URL` | `https://startkontor.de`; Canonical, Sitemap und Bestätigungslinks |
| `RESEND_API_KEY` | Privater Schlüssel für den Mailversand und die Newsletter-Kontakte |
| `MAIL_FROM` | `Startkontor <newsletter@startkontor.de>`; die Domain muss bei Resend verifiziert sein |
| `MAIL_TO` | `newsletter@startkontor.de`; Empfänger des Kontaktformulars |
| `NEWSLETTER_SECRET` | Privates zufälliges Geheimnis für signierte Bestätigungs- und Abmeldelinks |
| `NEWSLETTER_AUDIENCE_ID` | ID der bei Resend eingerichteten Gruppe „Startkontor Monatsbrief“ |

Schlüssel und Geheimnisse gehören weder in GitHub noch in `NEXT_PUBLIC_` Variablen. Bestehende Newsletter-Geheimnisse nicht ohne Migrationsplan austauschen: sonst werden ältere Abmeldelinks ungültig.

## Build und Betrieb

In Vercel das GitHub-Repository `ahmadrazahassan/startkontor.de` importieren. Framework: Next.js; Root Directory: Projektwurzel; Build Command: `npm run build`; Output Directory: Framework-Standard. Die privaten Variablen aus `.env.local` oder der lokalen Importdatei `.env.vercel` unter Project Settings → Environment Variables für Production hinterlegen. Für funktionierende Formulare auf Vorschauen dieselben Variablen auch für Preview setzen. Danach neu deployen: Änderungen gelten für neue Deployments.

`public/fonts/` enthält die mit Git übertragenen DM Sans Dateien einschließlich Open Font License. Nur der ungenutzte Lieferordner `/fonts/` in der Projektwurzel wird ignoriert. Das Newsletterlogo ist ausdrücklich im File Tracing der API-Funktionen enthalten.

```sh
npm ci
npm test
npm run build
npm run check:routen
npm start
```

Vor der öffentlichen Freigabe `config/betreiber.json` mit den echten Betreiberangaben vervollständigen, Impressum und Datenschutz auf den tatsächlichen Betrieb abstimmen und `npm run build:prod` ausführen. Dieser strengere Build stoppt bewusst bei fehlenden Betreiberangaben oder sichtbaren Platzhaltern. Ein erfolgreicher normaler Build bestätigt lediglich, dass der Code kompiliert.

Im DNS die Website auf den gewählten Hoster zeigen lassen, HTTPS aktivieren und die alternative `www` Adresse auf die Hauptadresse umleiten. Bestehende Mail-DNS-Einträge von IONOS und Resend erhalten.

Nach dem Deployment Canonical, Sitemap, Kontaktzustellung, Double Opt in und Abmeldung mit einer eigenen Testadresse überprüfen. Affiliate-Links im jeweiligen Partnerkonto auf die Domain und das eigene Konto prüfen. Eine GitHub-Veröffentlichung ist keine Website-Veröffentlichung und keine Affiliate-Freigabe.

## Monatsbrief

`npm run newsletter:setup` prüft alle sechs benötigten Variablen, die Resend-Gruppe und die Einwilligungsfelder. `npm run newsletter:preview` erzeugt drei lokale HTML-Vorschauen. `npm run newsletter:test` sendet die Monatsbrief-Vorschau nur an `MAIL_TO`. Die redaktionelle Ausgabe liegt in `data/newsletter-ausgabe.json`. `npm run newsletter:send` versendet diese Ausgabe ausschließlich an bestätigte, nicht abgemeldete Kontakte der Gruppe und verlangt echte Betreiberangaben. Kein automatischer monatlicher Versandplan ist eingerichtet.
