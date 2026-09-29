# Linke Regeltechnik

Moderne Unternehmenswebsite mit einem kleinen Technik-Shop für Produkte aus dem BLR24-Sortiment.

- **Website:** https://linke-regeltechnik.kevin1337pro.chatgpt.site
- **Shop:** https://linke-regeltechnik.kevin1337pro.chatgpt.site/shop/

## Umfang

Die Website stellt Leistungen, Unternehmen sowie die Standorte Herne und Dortmund vor. Der Shop umfasst zwölf Artikel mit Produktbildern, technischen Daten, Suche, Kategorien, Preissortierung und einem Warenkorb mit Mengenwahl.

Der Warenkorb wird lokal im Browser gespeichert. Der Abschluss bereitet eine unverbindliche E-Mail-Anfrage vor, die der Besucher selbst absendet. Es werden weder Zahlungen verarbeitet noch Bestellungen automatisch ausgelöst. Für Direktkäufe führt jeder Artikel zur Originalseite bei BLR24; der lokale Warenkorb wird dabei nicht übertragen.

**Preisstand: 29.09.2026.** Preise, Lieferzeit und Verfügbarkeit werden im Angebot bestätigt. Es besteht keine automatische Synchronisierung mit BLR24.

## Lokal starten

Die Website besteht aus HTML, CSS und JavaScript. Der veröffentlichbare Ordner ist `dist/`; ein Framework oder eine Paketinstallation ist nicht erforderlich.

```sh
python3 -m http.server 4173 --directory dist
```

Danach `http://localhost:4173` öffnen. Die Dateien müssen über einen lokalen Webserver geladen werden, damit die JavaScript-Module des Shops funktionieren.

## Produkte bearbeiten

- `data/blr-source-products.json`: importierte Produktinformationen mit Quellen und Abrufdatum.
- `scripts/prepare-catalog.mjs`: redaktionell aufbereitete Beschreibungen, Kategorien und technische Daten.
- `dist/assets/products/`: Produktbilder.

Nach Änderungen an Produktdaten oder Beschreibungen:

```sh
node scripts/prepare-catalog.mjs
node scripts/render-shop.mjs
node --test scripts/shop.test.mjs
```

Preisstand-Hinweise und die drei Produktvorschauen auf der Startseite müssen bei Preisänderungen ebenfalls aktualisiert werden. Die Tests prüfen unter anderem Warenkorbsummen, Mengenbegrenzung, wiederhergestellte Daten und Suche.

## Quellen und Gestaltung

Die Unternehmensinformationen stammen von Linke Regeltechnik, Produktdaten und Produktfotos von BLR24. Alle verwendeten Quellen sind in [CONTENT-SOURCES.md](CONTENT-SOURCES.md) dokumentiert. Logo und symbolisches Architekturbild wurden für diesen Entwurf generiert; die Prompts stehen in [GENERATION.md](GENERATION.md).

Die Schrift Inter wird lokal eingebunden; ihre Lizenz liegt unter `dist/assets/inter-license.txt`. Produktbilder, Markennamen und weitere Fremdinhalte behalten ihre jeweiligen Rechte. Die öffentliche Bereitstellung dieses Repositorys erteilt dafür keine zusätzliche Nutzungslizenz.

## Hosting

Die Live-Website wird über Sites bereitgestellt. `.openai/hosting.json` enthält die Projektzuordnung, keine Zugangsdaten. Ein Push zu diesem GitHub-Repository veröffentlicht nicht automatisch eine neue Live-Version.
