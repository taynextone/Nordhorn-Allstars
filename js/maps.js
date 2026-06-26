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
        pos: { x: 44, y: 35 }, trainerName: null, requiredBadges: 7 },
      { id: 13, name: 'Königs-Court', badge: 'KÖNIG', badgeColor: '#ff44ff',
        pos: { x: 44, y: 36 }, trainerName: 'König', requiredBadges: 12 }
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
        badge: 'KAMPF', badgeColor: '#c4944a' },
      { x: 44, y: 36, defeated: false, name: 'König',
        dialog: ['Du hast alle 12 Courts besiegt...',
        'Ich bin König, der unangefochtene Meister!',
        'Nur der Stärkste darf mich herausfordern.',
        'Zeig mir, was du gelernt hast!'],
        build: 'ALLROUNDER', level: 20, sprite: 'finalBoss',
        victoryDialog: ['Unglaublich... du hast mich besiegt!',
        'Du bist der wahre Champion von Nordhorn!',
        'Die Stadt gehört dir!',
        'Dein Name wird in die Geschichte eingehen!'],
        badge: 'KÖNIG', badgeColor: '#ff44ff',
        isFinalBoss: true, requiredBadges: 12 }
    ],
    
    interactables: [
      { x: 7, y: 6, sprite: 'npcGeneric', dialog: ['Zuhause. Hier ist alles sicher.', 'Dein Zimmer ist oben.', 'Drücke ENTER um zu interagieren.'] },
      { x: 22, y: 5, sprite: 'npcGeneric', dialog: ['Schule "Am Sportplatz"', 'Hier gibt es die besten Trainer der Stadt.', 'Der Hof hinten ist offen für alle.', 'Coach Müller trainiert hier.'] },
      { x: 38, y: 24, sprite: 'npcGeneric', dialog: ['Bücherei Nordhorn', 'Regal 3: "Basketball für Anfänger"', 'Regal 7: "Die Geschichte des Streetballs"', 'Ein guter Ort zum Lernen.'] },
      { x: 42, y: 36, sprite: 'coachMuller',
        getDialog: function() {
          const badges = (player && player.badges) ? player.badges.length : 0;
          if (badges >= 12) {
            return ['Stadion Nordhorn', 'Du hast alle 12 Badges!', 'König wartet im Stadion.', 'Er ist der stärkste Spieler aller Zeiten!', 'Tritt ihm gegenüber und werde Basketball-König!'];
          } else if (badges >= 8) {
            return ['Stadion Nordhorn', `Du hast schon ${badges} Siege!`, `Noch ${12-badges} bis zum Finale.`, 'Beeile dich, die Saison beginnt!'];
          } else if (badges >= 5) {
            return ['Stadion Nordhorn', `Du hast schon ${badges} Siege!`, `Noch ${12-badges} bis zum Finale.`, 'Beeile dich, die Saison beginnt!'];
          }
          return ['Stadion Nordhorn', 'Das Finale findet hier statt.', `Du brauchst ${8-badges} weitere Siege.`, 'Der Weg zum Champion beginnt hier.'];
        } },
      { x: 5, y: 30, sprite: 'npcGeneric', dialog: ['Spielplatz', 'Hier haben wir als Kinder immer gespielt.', 'Die alten Körbe sind noch da.', 'Perfekt für ein paar Übungswürfe.'] },
      { x: 43, y: 2, sprite: 'npcGeneric',
        getDialog: function() {
          return ['Bahnhof Nordhorn', 'Der Zug nach Lingen fährt stündlich.', 'Vorsicht: Die Spieler dort sind stark!', 'Drücke ENTER am Gleis umzureisen.'];
        } },
      { x: 27, y: 5, sprite: 'moveTutor',
        getDialog: function() {
          if (!player) return ['Move-Tutor', 'Komm wieder wenn du bereit bist.'];
          const unlearned = player.getUnlearnedMoves();
          if (unlearned.length === 0) {
            return ['Move-Tutor', 'Du hast alle Moves gelernt!', 'Du bist ein wahrer Meister!', 'Geh und zeig was du kannst!'];
          }
          // Biete den nächsten ungelernten Move an (basierend auf Level)
          const nextMove = unlearned[0];
          const learned = player.learnMove(nextMove.name);
          if (learned) {
            return ['Move-Tutor', 'Ich habe dir was beigebracht!', `Du hast "${learned.name}" gelernt!`, `${learned.desc}`, `Noch ${unlearned.length - 1} Moves übrig.`];
          }
          return ['Move-Tutor', 'Du hast das schon gelernt.', `Noch ${unlearned.length} Moves übrig.`, 'Komm wieder wenn du bereit bist!'];
        } },
      // Item pickups (Nordhorn)
      { x: 15, y: 5, sprite: 'npcGeneric',
        getDialog: function() {
          const item = addItemToInventory('runningShoes');
          if (item) return ['Hey! Schau mal da!', 'Da liegt ein Paar Laufschuhe!', `"${item.name}" erhalten!`, item.desc];
          return ['Hey! Schau mal da!', 'Da liegt ein Paar Laufschuhe!'];
        } },
      { x: 35, y: 24, sprite: 'npcGeneric',
        getDialog: function() {
          const item = addItemToInventory('energyDrink');
          if (item) return ['Im Regal hinten findest du etwas.', 'Ein Energy-Drink!', `"${item.name}" erhalten!`, item.desc];
          return ['Im Regal hinten findest du etwas.'];
        } },
      { x: 3, y: 15, sprite: 'npcGeneric',
        getDialog: function() {
          const item = addItemToInventory('leatherBracelet');
          if (item) return ['Am Zaun hängt ein Armband.', 'Ein Leder-Armband!', `"${item.name}" erhalten!`, item.desc];
          return ['Am Zaun hängt ein Armband.'];
        } },
      { x: 46, y: 38, sprite: 'npcGeneric',
        getDialog: function() {
          const item = addItemToInventory('proteinShake');
          if (item) return ['Im Stadion-Vorraum steht ein Shake.', 'Protein-Shake!', `"${item.name}" erhalten!`, item.desc];
          return ['Im Stadion-Vorraum steht ein Shake.'];
        } },
      { x: 16, y: 28, sprite: 'npcGeneric',
        getDialog: function() {
          const item = addItemToInventory('sportsDrink');
          if (item) return ['Auf dem Parktisch liegt ein Getränk.', 'Sportler-Getränk!', `"${item.name}" erhalten!`, item.desc];
          return ['Auf dem Parktisch liegt ein Getränk.'];
        } }
    ],
    
    getTrainerAt(x, y) {
      for (const t of this.trainers) {
        if (Math.abs(t.x - x) <= 1 && Math.abs(t.y - y) <= 1 && !t.defeated) {
          // Final boss only appears when player has enough badges
          if (t.isFinalBoss) {
            const badgeCount = (player && player.badges) ? player.badges.length : 0;
            if (badgeCount < (t.requiredBadges || 12)) continue;
          }
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
    },

    warps: [
      { x: 44, y: 3, toMap: 'lingen', toX: 5, toY: 5 }
    ]
  },

  lingen: {
    width: 45,
    height: 40,
    name: 'Lingen',

    // Tile-Legende (gleiche wie Nordhorn):
    // 0 = Gras, 1 = Weg, 2 = Haus-Wand, 3 = Basketball-Court
    // 4 = Wasser, 5 = Baum, 6 = Schule-Wand, 7 = Zaun
    // 8 = Tür, 9 = Blumenbeet, 10 = Straßenmarkierung
    // 11 = Hof, 12 = Tribüne, 13 = Basketballkorb

    tiles: generateLingenMap(),

    canWalk(x, y) {
      if (x < 0 || y < 0 || x >= this.width || y >= this.height) return false;
      const tile = this.tiles[y][x];
      return ![2, 4, 5, 6, 7, 12].includes(tile);
    },

    courts: [
      { id: 9, name: 'Bahnhof-Court', badge: 'RIVALE', badgeColor: '#cc4444',
        pos: { x: 6, y: 6 }, trainerName: 'Klaus', requiredBadges: 0 },
      { id: 10, name: 'Industrie-Court', badge: 'STAHL', badgeColor: '#888899',
        pos: { x: 36, y: 8 }, trainerName: 'Sven', requiredBadges: 1 },
      { id: 11, name: 'Hafen-Court', badge: 'STURM', badgeColor: '#4466aa',
        pos: { x: 20, y: 33 }, trainerName: 'Rashta', requiredBadges: 2 },
      { id: 12, name: 'Arena Lingen', badge: 'CHAMPION', badgeColor: '#ddaa22',
        pos: { x: 22, y: 18 }, trainerName: 'Maxim', requiredBadges: 3 }
    ],

    trainers: [
      { x: 6, y: 7, defeated: false, name: 'Klaus',
        dialog: ['Willkommen in Lingen!', 'Ich bin Klaus, der hier die Regeln aufstellt.', 'Du kommst aus Nordhorn? Zeig was du kannst!'],
        build: 'SHOOTER', level: 9, sprite: 'trainerKlaus',
        victoryDialog: ['Du bist stark für einen Anfänger!', 'Aber hier in Lingen sind wir härter.', 'Geh und trainiere weiter!'],
        badge: 'RIVALE', badgeColor: '#cc4444' },
      { x: 36, y: 9, defeated: false, name: 'Sven',
        dialog: ['Ich bin Sven, Fabrikarbeiter und Baller.', 'Nach der Schicht trainiere ich hier.', 'Kein Spielchen — echtes Basketball!'],
        build: 'VERTEIDIGER', level: 11, sprite: 'trainerSven',
        victoryDialog: ['Du hast mich besiegt!', 'Deine Offensive ist beeindruckend.', 'Aber Maxim wird dich zerstören.'],
        badge: 'STAHL', badgeColor: '#888899' },
      { x: 20, y: 34, defeated: false, name: 'Rashta',
        dialog: ['Ich bin Rashta, komme aus dem Hafen.', 'Hier windig draußen — wie auf dem Court!', 'Lass uns spielen!'],
        build: 'ALLROUNDER', level: 13, sprite: 'trainerRashta',
        victoryDialog: ['Beeindruckend!', 'Du hast den Sturm überstanden.', 'Geh zur Arena — Maxim wartet!'],
        badge: 'STURM', badgeColor: '#4466aa' },
      { x: 22, y: 19, defeated: false, name: 'Maxim',
        dialog: ['Ich bin Maxim, der unangefochtene Champion von Lingen!', 'Du hast es weit geschafft...', 'Aber hier endet deine Reise!'],
        build: 'ALLROUNDER', level: 16, sprite: 'trainerMaxim',
        victoryDialog: ['Unglaublich... du hast mich besiegt!', 'Du bist der wahre Champion!', 'Geh zurück nach Nordhorn und feiere deinen Sieg!'],
        badge: 'CHAMPION', badgeColor: '#ddaa22' }
    ],

    interactables: [
      { x: 4, y: 4, sprite: 'npcGeneric',
        dialog: ['Bahnhof Lingen', 'Hier kommt man aus Nordhorn.', 'Aber Vorsicht — die Spieler hier sind stark!'] },
      { x: 38, y: 6, sprite: 'npcGeneric',
        dialog: ['Industriegebiet Lingen', 'Die Fabriken laufen rund um die Uhr.', 'Die Arbeiter spielen nach der Schicht Ball.'] },
      { x: 18, y: 30, sprite: 'npcGeneric',
        dialog: ['Hafen Lingen', 'Der Wind vom Kanal ist eisig.', 'Perfekt für harte Trainingseinheiten.'] },
      { x: 24, y: 16, sprite: 'coachMuller',
        getDialog: function() {
          const badges = (player && player.badges) ? player.badges.length : 0;
          if (badges >= 12) {
            return ['Arena Lingen', 'Du hast alle 12 Courts besiegt!', 'Du bist der wahre Meister!', 'Geh zum Stadion in Nordhorn!', 'König wartet auf dich!'];
          } else if (badges >= 9) {
            return ['Arena Lingen', `Du hast schon ${badges} Siege!`, `Noch ${12-badges} bis zum Finale.`, 'Maxim wartet im Zentrum!'];
          }
          return ['Arena Lingen', 'Der Champion von Lingen trainiert hier.', `Du brauchst ${9-badges} weitere Siege für den Zugang.`, 'Bewehe dich erst auf den anderen Courts!'];
        } },
      { x: 10, y: 20, sprite: 'npcGeneric',
        dialog: ['Parkstraße', 'Ruhiger Ort in der Stadt.', 'Hier kann man den Kopf freibekommen.', 'Perfekt vor einem wichtigen Spiel.'] },
      { x: 29, y: 16, sprite: 'moveTutor',
        getDialog: function() {
          if (!player) return ['Move-Tutor', 'Komm wieder wenn du bereit bist.'];
          const unlearned = player.getUnlearnedMoves();
          if (unlearned.length === 0) {
            return ['Move-Tutor', 'Du hast alle Moves gelernt!', 'Du bist ein wahrer Meister!', 'Geh und zeig was du kannst!'];
          }
          const nextMove = unlearned[0];
          const learned = player.learnMove(nextMove.name);
          if (learned) {
            return ['Move-Tutor', 'Ich habe dir was beigebracht!', `Du hast "${learned.name}" gelernt!`, `${learned.desc}`, `Noch ${unlearned.length - 1} Moves übrig.`];
          }
          return ['Move-Tutor', 'Du hast das schon gelernt.', `Noch ${unlearned.length} Moves übrig.`, 'Komm wieder wenn du bereit bist!'];
        } },
      // Item pickups (Lingen)
      { x: 14, y: 4, sprite: 'npcGeneric',
        getDialog: function() {
          const item = addItemToInventory('proShoes');
          if (item) return ['Am Bahnhof liegen Schuhe.', 'Pro-Schuhe!', `"${item.name}" erhalten!`, item.desc];
          return ['Am Bahnhof liegen Schuhe.'];
        } },
      { x: 30, y: 5, sprite: 'npcGeneric',
        getDialog: function() {
          const item = addItemToInventory('championBracelet');
          if (item) return ['Am Industriehof liegt ein Armband.', 'Champion-Armband!', `"${item.name}" erhalten!`, item.desc];
          return ['Am Industriehof liegt ein Armband.'];
        } },
      { x: 26, y: 30, sprite: 'npcGeneric',
        getDialog: function() {
          const item = addItemToInventory('sportsDrink');
          if (item) return ['Am Hafen liegt ein Getränk.', 'Sportler-Getränk!', `"${item.name}" erhalten!`, item.desc];
          return ['Am Hafen liegt ein Getränk.'];
        } },
      { x: 30, y: 30, sprite: 'npcGeneric',
        getDialog: function() {
          const item = addItemToInventory('energyDrink');
          if (item) return ['Im Park steht ein Kiosk.', 'Energy-Drink!', `"${item.name}" erhalten!`, item.desc];
          return ['Im Park steht ein Kiosk.'];
        } }
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
    },

    warps: [
      { x: 4, y: 6, toMap: 'nordhorn', toX: 43, toY: 3 }
    ]
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

  // Bahnhof Nordhorn (rechts oben — Zug nach Lingen)
  for (let y = 2; y <= 5; y++) for (let x = 42; x <= 47; x++) map[y][x] = 2;
  map[5][44] = 8; // Eingang Bahnhof
  map[3][42] = 10; map[3][43] = 10; map[3][44] = 10; map[3][45] = 10; map[3][46] = 10; map[3][47] = 10;
  
  // Straßenmarkierungen
  for (let x = 5; x < W-5; x += 4) { if (map[20][x] === 1) map[20][x] = 10; }
  for (let y = 5; y < H-5; y += 4) { if (map[y][24] === 1) map[y][24] = 10; }

  return map;
}

// ============================================
// LINGEN KARTE — Erzfeind-Stadt
// ============================================

function generateLingenMap() {
  const W = 45, H = 40;
  const map = Array.from({ length: H }, () => Array(W).fill(0));

  // Ränder = Wasser
  for (let x = 0; x < W; x++) { map[0][x] = 4; map[H-1][x] = 4; }
  for (let y = 0; y < H; y++) { map[y][0] = 4; map[y][W-1] = 4; }

  // Hauptstraße (horizontal, Mitte)
  for (let x = 2; x < W-2; x++) { map[16][x] = 1; map[17][x] = 1; }
  // Hauptstraße (vertikal)
  for (let y = 2; y < H-2; y++) { map[y][22] = 1; map[y][23] = 1; }

  // Querstraßen
  for (let x = 2; x < W-2; x++) { map[8][x] = 1; map[9][x] = 1; }
  for (let x = 2; x < W-2; x++) { map[26][x] = 1; map[27][x] = 1; }
  for (let y = 2; y < H-2; y++) { map[y][11] = 1; map[y][12] = 1; }
  for (let y = 2; y < H-2; y++) { map[y][33] = 1; map[y][34] = 1; }

  // Bahnhof (links oben — Verbindung zu Nordhorn)
  for (let y = 2; y <= 6; y++) for (let x = 2; x <= 7; x++) map[y][x] = 2;
  map[6][4] = 8; // Eingang Bahnhof
  map[3][2] = 10; map[3][3] = 10; map[3][4] = 10; // Gleise-Markierung
  map[3][5] = 10; map[3][6] = 10; map[3][7] = 10;

  // Bahnhof-Court (neben Bahnhof)
  for (let y = 4; y <= 7; y++) for (let x = 8; x <= 12; x++) map[y][x] = 3;
  map[5][9] = 13; map[5][11] = 13;
  for (let y = 4; y <= 7; y++) { map[y][7] = 7; map[y][13] = 7; }

  // Industrie-Gebäude (rechts oben)
  for (let y = 2; y <= 6; y++) for (let x = 32; x <= 39; x++) map[y][x] = 2;
  map[6][35] = 8; // Eingang Fabrik
  for (let y = 2; y <= 6; y++) { map[y][31] = 7; map[y][40] = 7; }

  // Industrierei-Court (rechts oben)
  for (let y = 6; y <= 10; y++) for (let x = 34; x <= 38; x++) map[y][x] = 3;
  map[7][35] = 13; map[7][37] = 13;
  for (let y = 6; y <= 10; y++) { map[y][33] = 7; map[y][39] = 7; }

  // Arena Lingen (Mitte, groß)
  for (let y = 14; y <= 22; y++) for (let x = 18; x <= 27; x++) map[y][x] = 3;
  map[16][20] = 13; map[16][25] = 13; // Körbe
  for (let y = 14; y <= 22; y++) { map[y][17] = 7; map[y][28] = 7; }
  for (let x = 18; x <= 27; x++) { map[13][x] = 7; map[23][x] = 7; }
  map[18][18] = 8; // Arena-Eingang

  // Tribüne bei Arena
  for (let x = 19; x <= 26; x++) { map[13][x] = 12; }

  // Hafen-Bereich (unten, Wasser-Kanal)
  for (let y = 28; y <= 36; y++) for (let x = 14; x <= 24; x++) map[y][x] = 0;
  for (let y = 28; y <= 36; y++) { map[y][13] = 4; map[y][25] = 4; } // Kanalwände
  for (let x = 14; x <= 24; x++) { map[37][x] = 4; } // Kanalboden
  // Hafen-Court
  for (let y = 31; y <= 34; y++) for (let x = 16; x <= 22; x++) map[y][x] = 3;
  map[32][17] = 13; map[32][21] = 13;
  for (let y = 31; y <= 34; y++) { map[y][15] = 7; map[y][23] = 7; }

  // Wohn-Block (links unten)
  for (let y = 28; y <= 33; y++) for (let x = 2; x <= 8; x++) map[y][x] = 2;
  map[33][5] = 8; // Eingang
  for (let y = 28; y <= 33; y++) for (let x = 9; x <= 12; x++) map[y][x] = 2;
  map[33][10] = 8;

  // Park (mitte unten)
  for (let y = 28; y <= 32; y++) for (let x = 28; x <= 38; x++) map[y][x] = 0;
  map[29][29] = 5; map[29][31] = 5; map[29][33] = 5; map[29][35] = 5; map[29][37] = 5;
  map[31][29] = 5; map[31][31] = 5; map[31][33] = 5; map[31][35] = 5; map[31][37] = 5;
  map[30][30] = 1; map[30][32] = 1; map[30][34] = 1; map[30][36] = 1;

  // Bäume entlang der Hauptstraßen
  for (let y = 2; y < H-2; y += 4) {
    if (y < 16 || y > 17) map[y][21] = 5;
    if (y < 16 || y > 17) map[y][24] = 5;
  }

  // Blumenbeete beim Bahnhof
  for (let x = 2; x <= 7; x++) map[7][x] = 9;

  // Straßenmarkierungen
  for (let x = 5; x < W-5; x += 4) { if (map[16][x] === 1) map[16][x] = 10; }
  for (let y = 5; y < H-5; y += 4) { if (map[y][22] === 1) map[y][22] = 10; }

  return map;
}
