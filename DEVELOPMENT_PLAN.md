# Nordhorn Allstars — Entwicklungsplan (AAA-Gameboy-Qualität)

## Phase 1: Fundament ✅ ERLEDIGT
- [x] Game-Engine mit Gameboy-Palette
- [x] Title Screen + Character Select
- [x] Overworld mit Karte
- [x] Spieler-Bewegung & Kollision
- [x] Dialog-System
- [x] Duel-System (Turn-based)
- [x] Leveling & Moves
- [x] Trainer-Kämpfe
- [x] Pixel-Art Sprites (Basis)
- [x] Detaillierte Karte

## Phase 2: Spielbar machen ✅ ERLEDIGT
- [x] Spieler-Startposition & Karten-Spawn fixen
- [x] Trainer-Sprites auf Karte rendern
- [x] NPC-Sprites auf Karte rendern
- [x] Battle-Screen verbessern (bessere Sprites, Animationen)
- [x] Gewinn/Verlust-Logik testen & fixen
- [x] EXP-Balken im Battle-Screen
- [x] "Game Over" → zurück zum Zuhause

## Phase 3: Content & Story
- [x] Alle 5 Trainer-Duelle spielbar
- [x] Story-Dialoge für alle NPCs
- [x] Zug-System mit Energie-Kosten ausgeglichen
- [x] Spieler-Movepaket gleichgewichtig
- [x] 8 "Courts" (Gym-Äquivalent) implementieren
- [x] Lingen als zweite Karte (Erzfeind-Stadt)
- [x] Finale / Endboss (König, 12-Badge-Gate, Credits-Screen)
- [x] Move-Tutor NPC
- [x] Items (Schuhe, Armbänder, Energy-Drinks)

## Phase 4: Polish & AAA-Feeling
- [x] Bessere Pixel-Art (Aseprite-Qualität) — neue Hoopster-Sprites mit Jerseys, Nummern, Headbands, Ball/Dribbling und Battle-Portraits
- [x] Screen-Transitions (Fade, Wipe)
- [x] Battle-Animationen (Ball fliegt, Korb-Swish)
- [x] Sound-Effekte (Chiptune via Web Audio) — 20+ SFX: Kampf, Menü, Dialog, Item, Warp, Victory, Defeat, Level-Up, Badge
- [x] Hintergrundmusik (Chiptune-Tracks) — 5 Tracks: Title, Overworld, Battle, Victory, Credits (Bass+Lead Sequencer)
- [x] Speicher-System (LocalStorage) — Auto-Save nach Kämpfen/Reisen/Items, Continue auf Title-Screen, manueller Save im Menü
- [x] Pause-Menü (Status mit Stats, Badges, Moves, Standort)
- [x] Pokédex-Äquivalent ("Spieler-Liste") — 13 Trainer scrollbar, Detailansicht, Fortschrittsbalken
- [x] Mobile Touch-Controls (D-Pad, Action-Buttons, Swipe, Canvas-Tap)
- [x] Minimap (Toggle mit M, zeigt Spieler, Trainer, Karten-Layout)

## Phase 5: Feinschliff
- [x] Balance-Tuning (Stats, Moves, Level) — Moves/Energie-Kosten, Trainer-HP/EN/EXP, smartere Gegner-KI und Battle-HUD-Anzeigen abgestimmt
- [x] Easter Eggs (Konami-Code: +5 alle Stats, +20 HP)
- [x] Credits-Screen (Scrolling-Title, Team, Trainer, Locations)
- [ ] Performance-Optimierung
- [ ] Cross-Browser-Test
- [ ] Deployment (GitHub Pages)

## Technische Schulden
- [ ] Code-Refactoring (saubere Module)
- [ ] Fehlerbehandlung (Edge Cases)
- [ ] Kommentare im Code
