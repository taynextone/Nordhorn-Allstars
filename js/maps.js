// ============================================
// NORDHORN ALLSTARS — MAPS.JS (Detailliert)
// ============================================

const Maps = {
  nordhorn: {
    width: 50,
    height: 45,
    name: 'Nordhorn',
    
    // Tile-Legende:
    // 0 = Gras (hell), 1 = Weg (grau), 2 = Haus-Wand, 3 = Basketball-Court
    // 4 = Wasser, 5 = Baum, 6 = Schule-Wand, 7 = Zaun
    // 8 = Tür (begehbar), 9 = Blumenbeet, 10 = Straßenmarkierung
    // 11 = Hof (Schulhof), 12 = Tribüne, 13 = Tor/Basketballkorb
    
    tiles: generateNordhornMap(),
    
    canWalk(x, y) {
      if (x < 0 || y < 0 || x >= this.width || y >= this.height) return false;
      const tile = this.tiles[y][x];
      return ![2, 4, 5, 6, 7, 12].includes(tile);
    },
    
    courts: [
      { id: 1, name: 'Wohnhof-Court', badge: 'ANFÄNGER', badgeColor: '#9bbc0f',
        pos: { x: 8, y: 16 }, trainerName: 'Tim', requiredBadges: 0 },
      { id: 2, name: 'Schulhof-Court', badge: 'SCHÜLER', badgeColor: '#8bac0f',
        pos: { x: 23, y: 10 }, trainerName: 'Lisa', requiredBadges: 1 },
      { id: 3, name: 'Park-Court', badge: 'NATUR', badgeColor: '#306230',
        pos: { x: 19, y: 16 }, trainerName: 'Mohammed', requiredBadges: 2 },
      { id: 4, name: 'Stadion-Court', badge: 'PROFI', badgeColor: '#0f380f',
        pos: { x: 44, y: 37 }, trainerName: 'Coach Müller', requiredBadges: 3 },
      { id: 5, name: 'Spielplatz-Court', badge: 'KAMPF', badgeColor: '#c4944a',
        pos: { x: 6, y: 33 }, trainerName: 'Erik', requiredBadges: 4 },
      { id: 6, name: 'Bücherei-Court', badge: 'WEISHEIT', badgeColor: '#6b5335',
        pos: { x: 38, y: 26 }, trainerName: null, requiredBadges: 5 },
      { id: 7, name: 'Hausberg-Court', badge: 'STÄRKE', badgeColor: '#aa3333',
        pos: { x: 7, y: 28 }, trainerName: null, requiredBadges: 6 },
      { id: 8, name: 'Meister-Court', badge: 'MEISTER', badgeColor: '#aaaa33',
        pos: { x: 44, y: 35 }, trainerName: null, requiredBadges: 7 }
    ],

    trainers: [
      { x: 14, y: 10, defeated: false, name: 'Tim',
        dialog: ['Hey! Bist du der neue in der Stadt?', 'Ich bin Tim! Schulfreund von dir, erinnerst du dich?', 'Zeig mal was du kannst!'],
        build: 'SHOOTER', level: 3, sprite: 'trainerTim',
        victoryDialog: ['Wow, du bist gut!', 'Ich habe mein Bestes gegeben.', 'Viel Erfolg auf den anderen Courts!'],
        badge: 'ANFÄNGER', badgeColor: '#9bbc0f' },
      { x: 30, y: 14, defeated: false, name: 'Lisa',
        dialog: ['Hello! Ich bin Lisa.', 'Tim sagt, du willst Basketball spielen?', 'Dann zeig mir was du drauf hast!'],
        build: 'ALLROUNDER', level: 4, sprite: 'trainerLisa',
        victoryDialog: ['Du hast mich besiegt!', 'Du wirst noch weit kommen.', 'Geh zu Coach Müller, der ist der Nächste.'],
        badge: 'SCHÜLER', badgeColor: '#8bac0f' },
      { x: 10, y: 22, defeated: false, name: 'Coach Müller',
        dialog: ['Du willst in der Bundesliga spielen?', 'Dann musst du mich erst besiegen!', 'Ich bin Coach Müller, der Trainer des Stadions!'],
        build: 'VERTEIDIGER', level: 6, sprite: 'coachMuller',
        victoryDialog: ['Gut gemacht, mein Junge!', 'Du hast Potenzial.', 'Aber der Weg ist noch lang.'],
        badge: 'PROFI', badgeColor: '#0f380f' },
      { x: 38, y: 8, defeated: false, name: 'Mohammed',
        dialog: ['As-salamu alaikom!', 'Ich bin Mohammed, komme aus dem Stadion.', 'Lass uns ein Spiel machen!'],
        build: 'ALLROUNDER', level: 5, sprite: 'trainerMohammed',
        victoryDialog: ['Mashallah, du bist stark!', 'Ich habe viel gelernt.', 'Bis zum nächsten Mal!'],
        badge: 'NATUR', badgeColor: '#306230' },
      { x: 22, y: 32, defeated: false, name: 'Erik',
        dialog: ['Ich bin der beste in Nordhorn!', 'Oder zumindest... in meinem Viertel.', 'Komm schon, spiel mit mir!'],
        build: 'SHOOTER', level: 7, sprite: 'trainerErik',
        victoryDialog: ['Okay, du hast gewonnen!', 'Aber ich revanchiere mich!', 'Bis bald!'],
        badge: 'KAMPF', badgeColor: '#c4944a' }
    ],
    
    interactables: [
      { x: 7, y: 6, sprite: 'npcGeneric', dialog: ['Zuhause. Hier ist alles sicher.', 'Dein Zimmer ist oben.', 'Drücke ENTER um zu interagieren.'] },
      { x: 22, y: 5, sprite: 'npcGeneric', dialog: ['Schule "Am Sportplatz"', 'Hier gibt es die besten Trainer der Stadt.', 'Der Hof hinten ist offen für alle.', 'Coach Müller trainiert hier.'] },
      { x: 38, y: 24, sprite: 'npcGeneric', dialog: ['Bücherei Nordhorn', 'Regal 3: "Basketball für Anfänger"', 'Regal 7: "Die Geschichte des Streetballs"', 'Ein guter Ort zum Lernen.'] },
      { x: 42, y: 36, sprite: 'coachMuller',
        getDialog: function() {
          const badges = (player && player.badges) ? player.badges.length : 0;
          if (badges >= 8) {
            return ['Stadion Nordhorn', 'Du hast alle 8 Badges!', 'Der Meister wartet im Inneren.', 'Gehe hinein und werde Champion!'];
          } else if (badges >= 5) {
            return ['Stadion Nordhorn', `Du hast schon ${badges} Siege!`, `Noch ${8-badges} bis zum Finale.`, 'Beeile dich, die Saison beginnt!'];
          }
          return ['Stadion Nordhorn', 'Das Finale findet hier statt.', `Du brauchst ${8-badges} weitere Siege.`, 'Der Weg zum Champion beginnt hier.'];
        } },
      { x: 5, y: 30, sprite: 'npcGeneric', dialog: ['Spielplatz', 'Hier haben wir als Kinder immer gespielt.', 'Die alten Körbe sind noch da.', 'Perfekt für ein paar Übungswürfe.'] }
    ],
    
    getTrainerAt(x, y) {
      for (const t of this.trainers) {
        if (Math.abs(t.x - x) <= 1 && Math.abs(t.y - y) <= 1 && !t.defeated) {
          return t;
        }
      }
      return null;
    },

    getCourt(index) {
      return this.courts ? this.courts[index] : null;
    },

    getBadgeProgress() {
      if (!player || !player.badges) return 0;
      return player.badges.length;
    }
  }
};

function generateNordhornMap() {
  const W = 50, H = 45;
  const map = Array.from({ length: H }, () => Array(W).fill(0));
  
  // Ränder = Wasser
  for (let x = 0; x < W; x++) { map[0][x] = 4; map[H-1][x] = 4; }
  for (let y = 0; y < H; y++) { map[y][0] = 4; map[y][W-1] = 4; }
  
  // Hauptstraße (horizontal, Mitte)
  for (let x = 2; x < W-2; x++) { map[20][x] = 1; map[21][x] = 1; }
  // Hauptstraße (vertikal, Mitte)
  for (let y = 2; y < H-2; y++) { map[y][24] = 1; map[y][25] = 1; }
  
  // Querstraßen
  for (let x = 2; x < W-2; x++) { map[10][x] = 1; map[11][x] = 1; }
  for (let x = 2; x < W-2; x++) { map[30][x] = 1; map[31][x] = 1; }
  for (let y = 2; y < H-2; y++) { map[y][12] = 1; map[y][13] = 1; }
  for (let y = 2; y < H-2; y++) { map[y][37] = 1; map[y][38] = 1; }
  
  // Zuhause (links oben, 5x4)
  for (let y = 4; y <= 8; y++) for (let x = 4; x <= 8; x++) map[y][x] = 2;
  map[4][4] = 2; map[4][8] = 2; map[8][4] = 2; map[8][8] = 2; // Ecken
  map[8][6] = 8; // Tür
  for (let x = 5; x <= 7; x++) { map[5][x] = 9; } // Blumenbeet
  
  // Schule (oben mitte, 6x5)
  for (let y = 3; y <= 7; y++) for (let x = 20; x <= 26; x++) map[y][x] = 6;
  map[7][23] = 8; // Eingang
  // Schulhof (hinter Schule)
  for (let y = 8; y <= 11; y++) for (let x = 20; x <= 26; x++) map[y][x] = 11;
  map[9][21] = 13; // Korb links
  map[9][25] = 13; // Korb rechts
  
  // Basketball Court 1 (links mitte, 5x4)
  for (let y = 14; y <= 17; y++) for (let x = 6; x <= 10; x++) map[y][x] = 3;
  map[15][7] = 13; // Korb
  map[15][9] = 13; // Korb
  for (let y = 14; y <= 17; y++) { map[y][5] = 7; map[y][11] = 7; } // Zaun
  for (let x = 6; x <= 10; x++) { map[13][x] = 7; map[18][x] = 7; }
  
  // Basketball Court 2 (rechts oben, 5x4)
  for (let y = 12; y <= 15; y++) for (let x = 32; x <= 36; x++) map[y][x] = 3;
  map[13][33] = 13; map[13][35] = 13;
  for (let y = 12; y <= 15; y++) { map[y][31] = 7; map[y][37] = 7; }
  
  // Bücherei (rechts mitte, 4x4)
  for (let y = 22; y <= 25; y++) for (let x = 36; x <= 39; x++) map[y][x] = 2;
  map[25][38] = 8; // Eingang
  
  // Stadion (unten rechts, 8x6)
  for (let y = 34; y <= 40; y++) for (let x = 40; x <= 47; x++) map[y][x] = 3;
  map[36][42] = 13; map[36][45] = 13; // Körbe
  for (let y = 34; y <= 40; y++) { map[y][39] = 7; map[y][48] = 7; }
  for (let x = 40; x <= 47; x++) { map[33][x] = 7; map[41][x] = 7; }
  map[37][40] = 8; // Eingang Stadion
  
  // Häuser-Block (links unten, 6x5)
  for (let y = 26; y <= 30; y++) for (let x = 4; x <= 9; x++) map[y][x] = 2;
  map[30][6] = 8; map[30][7] = 8; // Eingang
  for (let y = 26; y <= 30; y++) for (let x = 10; x <= 15; x++) map[y][x] = 2;
  map[30][12] = 8;
  
  // Häuser-Block (mitte unten, 6x5)
  for (let y = 34; y <= 38; y++) for (let x = 18; x <= 23; x++) map[y][x] = 2;
  map[38][20] = 8; map[38][21] = 8;
  for (let y = 34; y <= 38; y++) for (let x = 26; x <= 31; x++) map[y][x] = 2;
  map[38][28] = 8;
  
  // Spielplatz (links unten, 4x3)
  for (let y = 32; y <= 34; y++) for (let x = 4; x <= 7; x++) map[y][x] = 11;
  map[33][5] = 13; // alter Korb
  
  // Park (mitte, Bäume & Wege)
  for (let y = 14; y <= 17; y++) for (let x = 16; x <= 22; x++) map[y][x] = 0;
  map[14][16] = 5; map[14][18] = 5; map[14][20] = 5; map[14][22] = 5;
  map[17][16] = 5; map[17][18] = 5; map[17][20] = 5; map[17][22] = 5;
  map[15][17] = 1; map[15][18] = 1; map[15][19] = 1; map[15][20] = 1; map[15][21] = 1;
  map[16][17] = 1; map[16][18] = 1; map[16][19] = 1; map[16][20] = 1; map[16][21] = 1;
  
  // Bäume entlang der Hauptstraße
  for (let y = 2; y < H-2; y += 3) {
    if (y < 20 || y > 21) map[y][23] = 5;
    if (y < 20 || y > 21) map[y][26] = 5;
  }
  
  // Blumenbeete an der Schule
  for (let x = 20; x <= 26; x++) map[2][x] = 9;
  
  // Straßenmarkierungen
  for (let x = 5; x < W-5; x += 4) { if (map[20][x] === 1) map[20][x] = 10; }
  for (let y = 5; y < H-5; y += 4) { if (map[y][24] === 1) map[y][24] = 10; }
  
  return map;
}
