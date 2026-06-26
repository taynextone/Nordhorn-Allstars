# Nordhorn Allstars — Game Design Document

## Überblick
Ein Basketball-RPG im Stil von Pokémon Rot/Blau für den Gameboy. Du bist ein 10-jähriges Kind in Nordhorn, levelst durch 1vs1-Basketball-Duelle auf und lernst neue Moves. Lingen ist die rivalisierende Stadt.

## Kernelemente

### Charakter-Erstellung
- Junge oder Mädchen wählen
- 3 Starter-"Builds" (ähnlich Starter-Pokemon):
  - **Shooter** (Fernwurf stark, Verteidigung schwach)
  - **Allrounder** (ausgewogen)
  - **Verteidiger** (Blocks & Steals stark, Angriff schwach)

### Stats (levelbar)
- **Dribbling** (geschwindigkeit & kontrolle)
- **Wurf** (trefferquote 2P & 3P)
- **Athletik** (geschwindigkeit, sprung, ausdauer)
- **Verteidigung** (steals, blocks)
- **Court Vision** (pass-genauigkeit, combo-moves)

### Moves (werden gelernt)
Jeder Move hat einen "Energy Cost" (wie PP in Pokemon):
- **Layup** (Basis, immer verfügbar)
- **Jump Shot** (Level 3)
- **Three Pointer** (Level 6)
- **Crossover** (Level 4, verfehlt gegnerischen steal)
- **Alley-Oop** (Level 10, combo-move)
- **Block** (Level 5, verteidigung)
- **Steal** (Level 7, chance auf ballgewinn)
- **Slam Dunk** (Level 12, stark aber riskant)
- **No-Look Pass** (Level 9, combo-setup)
- **Ankle Breaker** (Level 15, gegner verliert nächste runde)
- **Buzzer Beater** (Level 20, finisher bei wenig zeit)

### Duel-System (Turn-based mit Timing)
- 1vs1 auf einem Basketballcourt
- Jede Runde: Angriff, Verteidigung oder Spezial
- Timing-basiert (wie Pokemon-Trefferchance, aber mit Mini-Game-Element)
- Punkte zählen wie Basketball (2P, 3P)
- Wer zuerst 21 Punkte gewinnt (Streetball-Regeln)

### Overworld — Nordhorn
Top-down 16x16 Tile-Map im Gameboy-Stil:
- **Zuhause** (Startpunkt)
- **Schule** (NPCs zum Kämpfen)
- **Basketball-Court 1** (erster Trainer)
- **Basketball-Court 2** (mittleres Level)
- **Stadion** (Endgame-Area)
- **Bücherei** (Infos, Move-Tutor)
- **Platz der Deutschen Einheit** (zentraler Treffpunkt)
- **Bahnhof** (Reise nach Lingen — Erzfeind-Stadt)
- **Lingen** (Endgegner, stärkste Spieler)

### Rivalen / Trainers
- **Tim** (Schulfreund, Shooter-Build)
- **Lisa** (Rivalin, Allrounder)
- **Coach Müller** (erster "Gym Leader" — Stadion)
- **Der Kantonist** (stärkster Spieler aus Lingen)
- **Der Trainer aus Lingen** (Endboss)

### Progression
- 8 "Courts" (wie Gym Leaders) — jedes Court gibt einen "Siegel"
- Nach 8 Siegeln: Finale in Lingen
- Level-Cap pro Area (wie Pokemon-Gym-Order)

### Visuell
- 4-Farben-Palette (klassisch Gameboy Grün ODER DMG Grau)
- 16x16 Sprite-Größe
- 8x8 Tiles für Overworld
- Animierte Duel-Szenen (seitliche Ansicht)
- Dialoge im Pokemon-Stil

### Audio
- Chiptune-Musik (Gameboy-Soundchip-Style)
- SFX für Würfe, Treffer, Level-Ups

## Tech-Stack
- HTML5 Canvas + JavaScript (Vanilla)
- Pixel-art Sprites (selbst gezeichnet, Aseprite-Style)
- Web Audio API für Chiptune
- Keine Frameworks — alles von Grund auf
- Responsive (auch auf Handy spielbar)

## Umsetzungs-Phase 1
1. Projekt-Setup (HTML/CSS/JS)
2. Gameboy-Palette & Sprite-System
3. Overworld-Rendering (Nordhorn-Karte)
4. Charakter-Bewegung & Kollision
5. Dialog-System
6. Duel-System (Basis)
7. Erster Trainer + Test-Duel
