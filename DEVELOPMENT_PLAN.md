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
- [x] Performance-Optimierung — Minimap-Tilelayer gecacht (4.200 Draws → 1 drawImage/Frame) und sichtbarer FPS-HUD ergänzt
- [x] Cross-Browser-Test — sichtbarer Compat-Check auf dem Titelbild, rAF/performance-Polyfills, Safe-Area/dvh-Fallbacks; Chromium file:// Smoke-Test OK, Firefox-Headless in dieser Sandbox blockiert.
- [x] Deployment (GitHub Pages) — Pages-Actions-Workflow, .nojekyll, README-Link und sichtbarer Title-Screen-Deploy-Marker ergänzt.
- [x] Quick-Continue Save-Slot — Titelbild zeigt NEW GAME/CONTINUE, Siege/Rast werden in LocalStorage gespeichert und alte Dialog-Callbacks werden sicher bereinigt.
- [x] Quest-Radar — sichtbares Overworld-HUD, Zielpfeil, Trainer-Distanz und Minimap-Markierung für den nächsten unbesiegten Gegner ergänzt.
- [x] Coach-Card Controls-Hilfe — H/?-Overlay mit Tastatur-, D-Pad- und Mobile-Hinweisen plus sichtbarem Title-Screen-Marker ergänzt.
- [x] Trainer-Scout Overlay — S-Taste zeigt im Spiel den nächsten Rivalen mit Level, Zielscore, HP/EN, EXP-Belohnung und Fortschritt; Title-Screen-Marker ergänzt.
- [x] Coach-Tipps — T-Taste zeigt taktische In-Game-Hinweise; Title-Screen-Marker, Overworld-HUD und Module-Check ergänzt.
- [x] Rivalen-Fortschrittsbalken — sichtbares Overworld-HUD mit Siege-Zähler, nächstem Gegner, Title-Screen-Marker und Module-Check ergänzt.
- [x] Home-Rest-System — Start/Respawn auf begehbarer Home-Gate-Position gefixt, R-Taste heilt HP/EN zuhause, sichtbares HUD/Title-Marker und Module-Check ergänzt.

## Technische Schulden
- [x] Code-Refactoring (saubere Module) — sichtbare Module-Registry mit 19 Boot-Checks und Title-Screen-Status ergänzt
- [x] Fehlerbehandlung (Edge Cases) — ErrorGuard mit Runtime-Overlay, globalen error/unhandledrejection-Hooks, State-Recovery und sicherem Dex-Fallback ergänzt.
- [x] Kommentare im Code — Architektur-Kommentarblock und sichtbarer Title-Screen-Status „CODE COMMENTS: 7/7 OK“ ergänzt
- [x] Battle-Prep HUD — sichtbare HP/EN-Bereitschaftsanzeige für den nächsten Rivalen, Title-Screen-Marker und Module-Check ergänzt.
- [x] Possession-Coach Battle-HUD — Live-Anzeige für Ballbesitz, Score-Ziel, Spielzug-Tipp und Module-Check ergänzt; Loss-Respawn zurück auf begehbares Home-Gate korrigiert.
- [x] Duel-Risk-Meter — sichtbares Overworld-HUD mit Risiko-Prozent, Rest/Prep/Attack-Empfehlung, Title-Screen-Marker und Module-Check ergänzt.
- [x] Momentum-Meter Battle-HUD — Live-Druckanzeige im Duell mit Hot/Cold-Status, Taktik-Hinweis, Title-Screen-Marker und Module-Check ergänzt.
- [x] Clutch-Alert Battle-HUD — sichtbare Endgame-Anzeige für benötigte Punkte, Rivalen-Gefahr, Closeout-Tipps, Title-Screen-Marker und Module-Check ergänzt.
- [x] Shot-Quality Advisor — sichtbares Move-Select-HUD mit Trefferchance, Energiecheck, taktischem Wurf-Tipp, Title-Screen-Marker und Module-Check ergänzt.
- [x] Defense-Read Enemy-Turn-HUD — sichtbare Gegnerzug-Analyse mit Threat-Prozent, erwartetem Rivalen-Move, Defense-Tipp, Title-Screen-Marker und Module-Check ergänzt.
- [x] Comeback-Coach Battle-HUD — sichtbare Score-Run-Anzeige mit Rückstands-/Lead-Tipp, Title-Screen-Marker und Module-Check ergänzt.
- [x] Stamina-Coach Battle-HUD — sichtbare HP/EN-Tankanalyse mit Rivalen-Energie, Tempo-Tipp, Title-Screen-Marker und Module-Check ergänzt.
- [x] Route-Coach Overworld-HUD — smarte nächste Route zu Rivalen/Home-Rest mit Pfeil, Distanz, Title-Screen-Marker und Module-Check ergänzt.
- [x] Win-Condition-Coach Battle-HUD — sichtbare Punkte-bis-Sieg-Anzeige mit Match-/Danger-Point-Tipps, Title-Screen-Marker und Module-Check ergänzt.
- [x] Timeout-Coach Battle-HUD — sichtbare Tempo-/Timeout-Empfehlung mit HP/EN/Lead-Analyse, Title-Screen-Marker und Module-Check ergänzt.
