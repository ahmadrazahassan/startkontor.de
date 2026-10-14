# Erweiterte Bildserie für Startkontor

Die Bildserie umfasst 19 Motive. 13 wurden für diese Erweiterung mit dem integrierten Imagegen-Werkzeug neu erstellt.

## Recherche

- [OMR Reviews](https://omr.com/de/reviews): zentrale Suche, Kategorien und redaktionelle Software-Guides.
- [trusted](https://trusted.de/): Kategorien, Vergleiche und erklärende Ratgeber für die Softwareauswahl.
- [SoftGuide](https://www.softguide.de/): Marktübersicht nach Anwendungsbereichen und Unterstützung bei der Auswahl.
- [BusinessWith](https://businesswith.de/): geführte Bedarfsermittlung und Gegenüberstellung passender Software.

Die Gestaltung für Startkontor greift die klare Orientierung nach Aufgabe und Kategorie auf. Menschen bei der Arbeit zeigen den Bezug zum Unternehmensalltag. Eigene Illustrationen ergänzen die Erläuterungen zu Funktionen, Kosten, Verträgen und Quellen. Die vorhandenen Startkontor-Farben bleiben die Grundlage: Blau #095FBB, Hellblau #E9F3F8, Himmelblau #7AACDC, Marineblau #0F2438 und Weiß.

## Verwendung auf der Website

| Bereich | Motive |
|---|---|
| Startbereich | Softwareauswahl |
| Drei Einstiegswege | Softwarevergleich, Softwareplanung, Vertragscheck |
| Kategorien auf der Startseite | Büroteam sowie Finanzen, Lohn, Personal, Vertrieb und Betrieb |
| Kategorienübersicht und fünf Kategorieseiten | Die fünf Kategorienillustrationen |
| Fahrplanübersicht und fünf Stationsseiten | Gründung, erste Umsätze, erstes Team, Wachstum und Ausbau |
| Erklärung des Review-Aufbaus und Redaktion | Quellenprüfung |
| Bausteinplaner | Softwareplanung |
| Herstellerbereich | Anbieterprofil |
| Monatsbrief | Monatsbrief |
| Softwareverzeichnis | Softwarevergleich |
| Checklisten | Vertragscheck |
| Kontakt und FAQ | Beratung, als Symbolbild gekennzeichnet |

Die Bildgrößen und deutschen Alternativtexte werden zentral in `data/bildmotive.json` geführt. Die Bildkomponente nutzt die Bildoptimierung von Next.js und lädt Bilder unterhalb des Startbereichs verzögert. Falls ein Betreiber ein eigenes Foto für einen vorhandenen Bildplatz hochlädt, hat dieses weiterhin Vorrang vor dem generierten Ersatzmotiv.

Sämtliche Personen in den generierten Motiven sind fiktiv. Die Darstellung der Redaktion verwendet eine Illustration der Quellenarbeit; ein vorhandenes echtes Redaktionsfoto bleibt erhalten.

## Dateien

Alle 19 PNG-Originale liegen unter `public/bilder/illustrationen/`. Die Originalprompts dieser Erweiterung stehen in `generierung-v2.json`. Die Galerie `index-v2.html` zeigt sämtliche Motive. Das Paket `startkontor-bildpaket-v2.zip` enthält Bilder, Bilddaten, Galerie und Prompts.

