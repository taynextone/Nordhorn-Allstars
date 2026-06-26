// ============================================
// NORDHORN ALLSTARS — MAPS.JS
// ============================================

const Maps = {
  nordhorn: {
    width: 40,
    height: 35,
    name: 'Nordhorn',
    
    // Tile-Legende:
    // 0 = Gras, 1 = Weg, 2 = Haus, 3 = Court
    // 4 = Wasser, 5 = Baum, 6 = Schule, 7 = Zaun
    
    tiles: generateNordhornMap(),
    
    canWalk(x, y) {
      if (x < 0 || y < 0 || x >= this.width || y >= this.height) return false;
      const tile = this.tiles[y][x];
      return tile !== 2 && tile !== 4 && tile !== 5 && tile !== 6 && tile !== 7;
    },
    
    trainers: [
      { x: 14, y: 8, defeated: false, name: 'Tim', dialog: 'Hey! Bist du der neue? Dann zeig mal was du kannst!', build: 'SHOOTER', level: 3 },
      { x: 25, y: 12, defeated: false, name: 'Lisa', dialog: 'Hello! Let\'s play! Aber vergiss nicht: Ich bin besser als Tim.', build: 'ALLROUNDER', level: 4 },
      { x: 8, y: 18, defeated: false, name: 'Coach Müller', dialog: 'Du willst im Stadion spielen? Besiht mich erst!', build: 'VERTEIDIGER', level: 6 },
      { x: 32, y: 6, defeated: false, name: 'Mohammed', dialog: 'As-salamu alaikom! Lass uns spielen!', build: 'ALLROUNDER', level: 5 },
      { x: 18, y: 25, defeated: false, name: 'Erik', dialog: 'Ich bin der beste in Nordhorn! Oder?', build: 'SHOOTER', level: 7 }
    ],
    
    interactables: [
      { x: 7, y: 5, dialog: 'Zuhause. Hier alles angekommen.' },
      { x: 20, y: 4, dialog: 'Schule "Am Sportplatz" — Hier gib\'s die besten Trainer.' },
      { x: 30, y: 20, dialog: 'Bücherei — "Basketball für Anfänger" steht im Regal.' }
    ],
    
    getTrainerAt(x, y) {
      // Prüfe 2 Tiles vor dem Spieler
      for (const t of this.trainers) {
        if ((t.x === x && (t.y === y || t.y === y - 1)) ||
            (t.y === y && (t.x === x || t.x === x - 1))) {
          return t;
        }
      }
      return null;
    }
  }
};

function generateNordhornMap() {
  const map = [];
  
  for (let y = 0; y < 35; y++) {
    map[y] = [];
    for (let x = 0; x < 40; x++) {
      // Standard: Gras
      map[y][x] = 0;
      
      // Ränder = Wasser
      if (x === 0 || x === 39 || y === 0 || y === 34) {
        map[y][x] = 4;
      }
      
      // Hauptwege (horizontal & vertikal)
      if (y === 14 || y === 15 || x === 19 || x === 20) {
        map[y][x] = 1;
      }
      
      // Basketball Courts
      if ((x === 12 && y >= 6 && y <= 9) || 
          (x === 28 && y >= 10 && y <= 13)) {
        map[y][x] = 1; // Weg um Courts
      }
      if (x === 11 && y >= 6 && y <= 8) map[y][x] = 3;
      if (x === 27 && y >= 10 && y <= 12) map[y][x] = 3;
      
      // Zuhause (links oben)
      if (x >= 6 && x <= 8 && y >= 4 && y <= 6) map[y][x] = 2;
      if (x === 7 && y === 5) map[y][x] = 1; // Tür
      
      // Schule (mitte-oben)
      if (x >= 18 && x <= 22 && y >= 3 && y <= 6) map[y][x] = 6;
      if (x === 20 && y === 4) map[y][x] = 1; // Eingang
      
      // Häuser
      if (x >= 10 && x <= 13 && y >= 17 && y <= 19) map[y][x] = 2;
      if (x >= 22 && x <= 25 && y >= 17 && y <= 19) map[y][x] = 2;
      if (x >= 14 && x <= 17 && y >= 24 && y <= 26) map[y][x] = 2;
      if (x >= 28 && x <= 32 && y >= 22 && y <= 24) map[y][x] = 2;
      
      // Bäume am Rand
      if ((x === 5 || x === 34) && y > 2 && y < 32 && y % 3 === 0) {
        map[y][x] = 5;
      }
      if ((x === 6 || x === 33) && y > 3 && y < 30 && y % 4 === 0) {
        map[y][x] = 5;
      }
      
      // Zaun um Court
      if (x === 13 && y >= 6 && y <= 8) map[y][x] = 7;
      if (x === 10 && y >= 6 && y <= 8) map[y][x] = 7;
      
      // Bücherei
      if (x >= 29 && x <= 31 && y >= 19 && y <= 21) map[y][x] = 2;
      if (x === 30 && y === 20) map[y][x] = 1; // Eingang
      
      // Stadion (unten-rechts) — große Fläche
      if (x >= 30 && x <= 36 && y >= 27 && y <= 32) map[y][x] = 1;
      if (x >= 31 && x <= 35 && y >= 28 && y <= 31) map[y][x] = 3;
      
      // Schulhof
      if (x >= 17 && x === 22 && y >= 8 && y <= 10) map[y][x] = 3;
      if (y === 8 && x >= 17 && x <= 22) map[y][x] = 3;
      if (y === 10 && x >= 17 && x <= 22) map[y][x] = 3;
    }
  }
  
  return map;
}
