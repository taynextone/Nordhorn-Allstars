# Nordhorn Allstars

**Nordhorn Allstars** ist ein Gameboy-style Basketball-RPG im Browser: Du startest am Home-Court in Nordhorn, trainierst deine Werte, lernst neue Moves und spielst dich durch 1vs1-Duelle bis zur Lingen-Rivalenroute und dem Finale gegen Coach Mihler.

> Status: spielbare, durchlaufbare Demo mit 8 Rivalen, Nordhorn-/Lingen-Storyroute, Save/Continue, Mobile-Touch-Controls und GitHub-Pages-Deployment.

## Spielen

- **Online:** https://taynextone.github.io/Nordhorn-Allstars/
- **Lokal:**

```bash
python3 -m http.server 8080
# dann öffnen:
# http://127.0.0.1:8080/
```

## Kurzbeschreibung

Ein kleines Basketball-Abenteuer mit klassischer Grün-Pixel-Optik: Laufe durch eine abstrahierte Nordhorn-Karte, sprich mit Leuten, finde Story-Schilder, trainiere am Court und besiege nach und nach lokale Rivalen. Später führt die Route nach Lingen — mit Auswärtsatmosphäre, Arena-Momenten und Finale.

## Features

- Gameboy-inspirierter Pixel-Look im Browser
- 8 spielbare Rivalen/Trainer inklusive Lingen-Arc und Coach-Finale
- 1vs1-Basketball-Kämpfe mit HP, Energie, Skills und lernbaren Moves
- Story-Schilder, NPC-Dialoge, Credits-Orte und Map-Overview
- Save/Continue über LocalStorage
- Tastatur- und Mobile-Touch-Steuerung
- Statische Single-File-App: kein Backend nötig

## Steuerung

| Aktion | Tastatur | Touch/Mobile |
| --- | --- | --- |
| Bewegen | Pfeiltasten / WASD | D-Pad |
| Bestätigen / Aktion | Enter / Z / Leertaste | A |
| Zurück / Abbrechen | Escape / X | B |
| Übersichtskarte | O | OVR |
| Minimap | M | MINI |
| Speichern | P | SAVE |
| Ausruhen am Home-Court | R | REST |

## Release-Checkliste

Für einen Demo-Release sind diese Punkte relevant:

- [x] GitHub Pages Deployment aktiv
- [x] Spiel startet direkt im Browser
- [x] Kernroute mit 8 Rivalen durchspielbar
- [x] Save/Continue vorhanden
- [x] Mobile-Touch-Controls vorhanden
- [x] README mit Spielbeschreibung, Controls und Release-Hinweisen
- [ ] finaler Nutzer-Playtest auf Desktop
- [ ] finaler Nutzer-Playtest auf Handy
- [ ] optionale Screenshots/GIFs für die Projektseite

## Screenshot-Vorschläge

Wenn du die Release-Seite oder Social-Posts vorbereitest, eignen sich besonders:

1. Title Screen
2. Nordhorn Home-Court
3. Map-Overview mit Nordhorn/Lingen-Orten
4. Battle gegen einen Rivalen
5. Lingen-Arena oder Rückfahrt-/Finalschild

## Entwicklung / Verifikation

Es gibt keinen npm-/Build-Schritt. Das Spiel ist eine statische Browser-App in `index.html`.

Aktuelle Smoke-Checks liegen unter `scripts/`:

```bash
node scripts/smoke-flow.js
python3 scripts/browser-smoke.py
```

## Deployment

Jeder Push auf `master` startet den Workflow `.github/workflows/deploy-pages.yml` und veröffentlicht die statischen Dateien per GitHub Pages Actions.
