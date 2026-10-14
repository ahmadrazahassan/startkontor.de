# Startkontor: Gestaltung des Softwareportals

Stand der Umsetzung: 14. Oktober 2026.

Die [Startseite von TechnologyCounter](https://technologycounter.com/) stellt eine zentrierte Suche zwischen Büromotiven in den Vordergrund. Eine kurze Navigation, viel Weißraum, eine Logoleiste und kompakte Programmkarten machen den Einstieg übersichtlich. Die [Kategorieansicht](https://technologycounter.com/crm-software) zeigt Programme als horizontale Karten neben einer Seitenleiste. Das [Produktprofil](https://technologycounter.com/products/zoho-crm) verwendet einen kompakten Kopf, Abschnittslinks und eine Hauptspalte mit ergänzenden Informationen am Rand.

Für die deutsche Ansprache wurden auch [OMR Reviews](https://omr.com/de/reviews) und [Capterra Deutschland](https://www.capterra.com.de/) berücksichtigt. Beide ordnen die Softwareauswahl über Kategorien, Funktionen, Preise und Bewertungen. Startkontor verwendet die vorhandenen Herstellerangaben und die eigene redaktionelle Einordnung als Grundlage.

## Umsetzung

- Startseite: zentrierte Suche mit Vorschlägen, Bürofotos, Programmlogos, vier Programme aus unterschiedlichen Kategorien und ein einfacher Kategorienwechsel.
- Softwareverzeichnis: horizontale Programmkarten mit Profil- und Preislinks; Kategorie, Preisangabe und monatliche Kündbarkeit als Filter. Die Auswahl bleibt in der URL erhalten. Auf dem Smartphone lassen sich die Filter ein- und ausblenden.
- Kategorieansichten: Programme zuerst, Auswahlkriterien und Ratgeber danach. Die Übersicht zeigt fünf kompakte Kategorien mit Illustrationen.
- Softwareprofile: kompakter Kopf, neun Abschnittslinks, klare Fakten und eine beschriftete Einschätzung. Vertragsdetails, Grenzen, Herstellerinformationen und Quellen bleiben zugänglich.
- Gestaltung: weiße Flächen, dezente Linien, kleine Rundungen und einfache blaue Schaltflächen.
- Sprache: deutsche Beschriftungen mit einheitlicher Sie-Ansprache. Aus „Review“ wird „Softwareprofil“.
- Bildserie: die 19 lokal gespeicherten Motive werden für Softwareauswahl, Kategorien, Unternehmensphasen und weitere Seiten verwendet.

## Farben und Schrift

| Verwendung | Farbe |
| --- | --- |
| Primärfarbe und Aktionen | `#095fbb` |
| Helle Flächen | `#e9f3f8` |
| Hellblaue Akzente | `#7aacdc` |
| Text | `#0f2438` |
| Dunkle Flächen | `#0a2540` |
| Grundfläche | `#ffffff` |

DM Sans ist die einzige Schrift für Überschriften, Fließtext und Oberfläche. Die variablen WOFF2-Dateien für Latin und Latin Extended liegen im Projekt. Beim Seitenbesuch werden keine Schriften von Google angefordert. Die Lizenz liegt unter `public/fonts/dmsans/OFL.txt`.

## Prüfung

Der Produktionsbuild erzeugt 117 Seiten erfolgreich. TypeScript ist fehlerfrei. Die vorhandenen 65 Tests bestehen; der Routencheck bestätigt 111 erwartete Routen. 40 Browseransichten bei 360, 768, 1024 und 1280 Pixel zeigen keinen horizontalen Überlauf und keine Bildfehler.

Zusätzlich wurden Suchvorschläge, Tastaturbedienung der Kategorien, Preisanker, Sortierung, mobile Navigation, das Ein- und Ausblenden der Filter sowie ein leeres Filterergebnis und das Zurücksetzen geprüft. Die Kombination Personal, veröffentlichter Preis und monatliche Kündbarkeit liefert das erwartete Programm Sage HR.

Der Textcheck prüft 112 HTML-Seiten. Er meldet ausschließlich 16 bereits offene Betreiberplatzhalter in Impressum, Datenschutz und Kontakt. Diese Angaben fehlen in `config/betreiber.json`; sie wurden nicht erfunden. Alle übrigen geprüften Textregeln bestehen.

Vorschauen und das Prüfprotokoll liegen unter `test-results/portal-*.jpg` beziehungsweise `test-results/portal-responsiv.json`.

## Verfeinerung von Hero und Kategorien

Die linke Heroaufnahme wird in ihrer Originalauflösung von 1536 × 1024 Pixeln ausgeliefert. Eine SVG-Maske bildet den Rahmen, ohne das Foto zu drehen oder nachträglich zu vergrößern. Die Quelldatei bleibt in voller Qualität erhalten.

Die Kategorien verwenden einheitliche Linienicons für Rechnungen, Gehalt, Personal, Vertrieb und Warenwirtschaft. Alle Iconflächen sind transparent, auch bei Auswahl und Hover. Kurze Bezeichnungen und eine Unterstreichung kennzeichnen die aktive Kategorie. Die Programmkarten zeigen ihre vollständigen Beschreibungen in zwei Spalten; auf dem Smartphone stehen sie untereinander. Die Kategorienübersicht verwendet dieselben Icons und kürzere deutsche Einführungstexte.

25 Kombinationen aus fünf Kategorien und fünf Bildschirmbreiten wurden geprüft, zusätzlich fünf Ansichten der Kategorienübersicht. Zwischen 320 und 1440 Pixeln treten weder horizontaler Überlauf noch abgeschnittene Beschreibungen auf. Tastaturwechsel und der Produktionsbuild sind geprüft. Aktuelle Vorschauen: `hero-originalqualitaet.jpg`, `kategorien-neu-desktop.jpg`, `kategorien-neu-mobil.jpg` und `kategorien-uebersicht-neu.jpg` unter `test-results`.


## Ergänzung vom 14. Oktober 2026

Die Kopfzeile bündelt die Inhalte in Software, Ratgeber und Über uns. Die Navigation bietet zusätzlich Suche, Auswahlhilfe und einen Zugang für Hersteller. Direkte Herstellerlinks stehen in den Programmkarten und an mehreren sinnvollen Stellen der Softwareprofile. Werbekennzeichnung und Partnerlogik folgen weiterhin den tatsächlichen Konfigurationen.

Zwölf eigens erzeugte Artikelmotive sind in der vorhandenen Farbwelt lokal eingebunden. Leitfäden, Wissensübersicht und die Startseite verwenden passende Motive, deutsche Alternativtexte und lesbare HTML-Titel. Die Originaldateien bleiben erhalten; Bildquellen und Prompts stehen in artikelbilder/generierung.json. Die Motivgalerie ist unter public/bilder/artikel/index.html verfügbar.

Der Footer verwendet die dunkle Markenfarbe, vier klare Inhaltsbereiche, größere Entdecken-Links, einen eigenen Monatsbriefbereich sowie einen zurückhaltenden Abschluss mit Arbeitsweise und rechtlichen Links. Adresse, Mitgliedschaften und Gütesiegel werden nicht erfunden.

### 17 weitere Programme und ausführliche Analysen

| Bereich | Neue Programme |
| --- | --- |
| Finanzen und Rechnungen | easybill, orgaMAX Buchhaltung, Papierkram, Accountable |
| Lohn und Gehalt | edlohn, GDI Lohn & Gehalt |
| Personal und Zeit | Clockodo, HRlab, Rexx HR, absence.io |
| Vertrieb und Kunden | cobra CRM, CAS genesisWorld, Salesforce Sales Cloud |
| Betrieb und Waren | JTL-Wawi, PlentyONE, Haufe X360, Abas ERP |

Das Verzeichnis enthält nun 47 Programme. Die Ergänzung bleibt getrennt vom ursprünglichen Datenbestand in data/software-erweiterungen.json. Jedes neue Profil hat vier ausführliche Analyseabschnitte und acht Absätze, außerdem Funktionen, Tarifinformationen, Eignung, Grenzen, Vertragsaspekte und Fragen für das Herstellergespräch. Die Analysen stützen sich auf öffentliche Herstellerquellen vom 14. Oktober 2026 und sind ausdrücklich als redaktionelle Einordnung ohne eigenen Praxistest beschrieben. Reguläre Preise und Aktionsangebote werden unterschieden. Nicht belegte Vertragsdetails werden als offen ausgewiesen.

Alle 17 Originalherstellerlogos sind lokal gespeichert und unverändert. Das neue Startkontor-Zeichen besteht aus zwei gegenläufigen offenen Bändern. Header, Footer, Social Preview und favicon verwenden dieselbe Geometrie. Der Symbol-Export public/marke/startkontor-symbol.svg sowie app/icon.svg enthalten keine Hintergrundfläche.

Die Original-SVG der Bundesflagge wurde unverändert gespeichert. Kleine Flaggen stehen im Hero und im Footer. Die Beschriftung nennt den Zielmarkt Deutschland. Sie behauptet keinen deutschen Betreiberstandort. Herkunft der Flagge und sämtliche Software- und Logoquellen stehen in recherche/software-erweiterungen-quellen.json.

### Aktuelle Prüfung

- Produktionsbuild und TypeScript erfolgreich: 134 erzeugte Seiten.
- 68 Tests erfolgreich; 128 redaktionelle Routen stimmen mit dem Build überein.
- Der Suchindex enthält 120 Einträge.
- Alle 17 neuen Reviewseiten zeigen ihre acht Analyseabsätze, Quellen, geladenen Originallogos und Herstelleraktionen.
- Homepage und zwei unterschiedlich lange neue Profile wurden bei 320, 390, 768, 1024 und 1440 Pixeln geprüft.
- Die mobile Auswahlhilfe wurde bei 320 Pixeln nachgebessert; die Nachprüfung findet in allen fünf Breiten weder horizontalen Überlauf noch abgeschnittene CTAs.
- Die mobile Suche nach Clockodo führt direkt zum neuen Profil. Bei Sortierung nach Prüfdatum stehen die 17 neuen Profile zuerst; die Erklärung zur Sortierung folgt der Auswahl.
- Der Textcheck enthält ausschließlich die 16 bestehenden Betreiberplatzhalter in Impressum, Datenschutz und Kontakt. Neue Textfehler liegen nicht vor.

Aktuelle Screenshots und das Prüfprotokoll stehen unter test-results/software-17-qa.json, software-17-neu-desktop.png, review-easybill-analyse-desktop.png, footer-logo-deutschland-desktop.png und home-logo-deutschland-mobil.png. Die früheren Prüfprotokolle dokumentieren die jeweiligen vorherigen Ausbaustufen.

### Einheitliche Darstellung aller 47 Programme

Der separate Abschnitt „Neu im Verzeichnis“ ist entfernt. Alle 47 Programme stehen gemeinsam in den vorhandenen Kategorien, im alphabetischen Verzeichnis und in der Suche. Die Kategorieanzahlen betragen 9, 8, 10, 9 und 11. Programmkarten, Profilkopf und seitliche Preiszusammenfassung zeigen keine Datumslabels mehr. Tatsächliche Recherche- und Abrufdaten bleiben in Methodik und Quellen erhalten und werden nicht rückdatiert.

Die Nachprüfung bei 390 und 1440 Pixeln bestätigt 47 Einträge, keinen separaten Neu-Bereich, keine Datumslabels auf Karten und keinen horizontalen Überlauf. Screenshot und Protokoll: test-results/software-47-gemeinsam.png und test-results/software-47-gemeinsam-qa.json.

### Softwarebilder und Produktvideos auf Reviewseiten

45 der 47 Softwareprofile enthalten jetzt insgesamt 73 originale Produktansichten mit deutschen Bildtiteln, Alternativtexten und direkten Quellenlinks. Die Galerie bietet Miniaturen und einen per Tastatur bedienbaren Bilddialog. Das Originalbild wird erst beim Vergrößern geladen und bleibt unverändert abrufbar. Native Bildmaße verhindern unnötiges Hochskalieren. Mobile Ansichten, englische Beispiele und ältere Vorführungen sind entsprechend gekennzeichnet.

28 Profile enthalten jeweils ein zugeordnetes Herstellervideo. YouTube im erweiterten Datenschutzmodus, Vimeo und originale Videodateien werden erst nach einem Klick geladen. Ein externer Wiedergabelink und die Herstellerquelle bleiben verfügbar. Die Datenschutzseite erklärt das technische Ladeverhalten; FAQ und Impressum beschreiben die nun vorhandenen Medien korrekt. Die Sicherheitsrichtlinie erlaubt ausschließlich die tatsächlich verwendeten Videohosts.

Die Quellen und Dateien stehen in data/software-medien.json, die Herkunftsrecherche unter recherche/software-medien-*.json. DATEV Lohn und Gehalt sowie Sage 50 Handwerk haben weiterhin keine Galerie: Die verifizierten Originaldateien waren nicht zugänglich. Es gibt dafür keine erfundenen Ersatzansichten.

Prüfung: Produktionsbuild mit 134 Seiten, 70 erfolgreiche Tests, alle 47 Reviewrouten und alle 73 Bilddateien erreichbar. 64 Rasterbilder behalten ihre Originalmaße. Bildwechsel, Dialog, Escape und Fokuswechsel sowie YouTube, Vimeo und eine originale Videodatei wurden im Browser geprüft. Die Nachprüfung bei 320, 390, 768 und 1280 Pixeln zeigt keinen horizontalen Überlauf. Nicht jedes einzelne externe Video wurde vollständig abgespielt. Der Textcheck meldet ausschließlich die 16 bereits bekannten Betreiberplatzhalter. Prüfprotokolle und Screenshots stehen in test-results/software-media-summary.json und test-results/software-review-media-*.png.
