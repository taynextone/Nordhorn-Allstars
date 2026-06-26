// ============================================
// NORDHORN ALLSTARS — GAME.JS (Hauptdatei)
// Ein Basketball-RPG im Gameboy-Stil
// ============================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// Gameboy DMG Palette (4 Farben)
const PALETTE = {
  lightest: '#9bbc0f',
  light: '#8bac0f',
  dark: '#306230',
  darkest: '#0f380f'
};

// Spielzustand
const GameState = {
  TITLE: 'title',
  CHARACTER_SELECT: 'character_select',
  OVERWORLD: 'overworld',
  DIALOG: 'dialog',
  BATTLE: 'battle',
  MENU: 'menu',
  CREDITS: 'credits'
};

let gameState = GameState.TITLE;
let player = null;
let currentMap = null;
let keys = {};
let keysPressed = {};

// ============================================
// SCREEN TRANSITIONS (Fade)
// ============================================
const ScreenTransition = {
  active: false,
  phase: 'none', // 'out' | 'in'
  color: PALETTE.darkest,
  speed: 0.06,
  progress: 0,
  onComplete: null,
  
  start(callback) {
    this.active = true;
    this.phase = 'out';
    this.progress = 0;
    this.onComplete = callback;
  },
  
  update() {
    if (!this.active) return;
    this.progress += this.speed;
    
    if (this.phase === 'out' && this.progress >= 1) {
      this.progress = 0;
      this.phase = 'in';
      if (this.onComplete) this.onComplete();
    } else if (this.phase === 'in' && this.progress >= 1) {
      this.active = false;
      this.phase = 'none';
      this.progress = 0;
    }
  },
  
  render() {
    if (!this.active) return;
    let alpha;
    if (this.phase === 'out') {
      alpha = this.progress;
    } else {
      alpha = 1 - this.progress;
    }
    ctx.fillStyle = this.color;
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
  }
};

// ============================================
// SPRITE RENDERING
// ============================================

function drawPixelRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), w, h);
}

// ============================================
// TITLE SCREEN
// ============================================

let titleFrame = 0;

function renderTitle() {
  // Hintergrund
  ctx.fillStyle = PALETTE.darkest;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Titel
  ctx.fillStyle = PALETTE.lightest;
  ctx.font = 'bold 28px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('NORDHORN', canvas.width / 2, 140);
  
  ctx.font = 'bold 22px "Courier New", monospace';
  ctx.fillText('ALL STARS', canvas.width / 2, 175);
  
  // Basketball-Symbol
  const ballX = canvas.width / 2;
  const ballY = 240;
  ctx.fillStyle = PALETTE.light;
  ctx.beginPath();
  ctx.arc(ballX, ballY, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.lightest;
  ctx.lineWidth = 2;
  ctx.stroke();
  // Ball-Linien
  ctx.beginPath();
  ctx.moveTo(ballX - 20, ballY);
  ctx.lineTo(ballX + 20, ballY);
  ctx.moveTo(ballX, ballY - 20);
  ctx.lineTo(ballX, ballY + 20);
  ctx.stroke();
  
  // "Drücke START"
  if (Math.floor(titleFrame / 30) % 2 === 0) {
    ctx.fillStyle = PALETTE.lightest;
    ctx.font = '14px "Courier New", monospace';
    ctx.fillText('DRÜCKE START', canvas.width / 2, 340);
  }
  
  ctx.font = '10px "Courier New", monospace';
  ctx.fillStyle = PALETTE.light;
  ctx.fillText('<C> 2026 Nordhorn Allstars', canvas.width / 2, 400);
  
  titleFrame++;
}

// ============================================
// CHARACTER SELECT
// ============================================

let charSelectFrame = 0;
let charSelectGender = 0; // 0=Junge, 1=Mädchen
let charSelectBuild = 0;  // 0-2
let charSelectStep = 0;   // 0=Gender, 1=Build

const BUILDS = [
  { name: 'SHOOTER', desc: 'Wurf++ / Def--' },
  { name: 'ALLROUNDER', desc: 'Ausgewogen' },
  { name: 'VERTEIDIGER', desc: 'Block++ / Wurf--' }
];

function renderCharacterSelect() {
  ctx.fillStyle = PALETTE.darkest;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = PALETTE.lightest;
  ctx.font = 'bold 16px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('CHARAKTER WÄHLEN', canvas.width / 2, 50);
  
  // Schritt 1: Geschlecht
  ctx.font = '13px "Courier New", monospace';
  ctx.textAlign = 'left';
  ctx.fillStyle = charSelectStep === 0 ? PALETTE.lightest : PALETTE.light;
  ctx.fillText('GESCHLECHT:', 40, 100);
  ctx.fillText(charSelectGender === 0 ? '>' : ' ', 180, 100);
  ctx.fillText('JUNGE', 200, 100);
  ctx.fillText(charSelectGender === 1 ? '>' : ' ', 320, 100);
  ctx.fillText('MÄDCHEN', 340, 100);
  
  // Schritt 2: Build
  ctx.fillStyle = charSelectStep === 1 ? PALETTE.lightest : PALETTE.light;
  ctx.fillText('BUILD:', 40, 160);
  for (let i = 0; i < 3; i++) {
    const y = 180 + i * 35;
    ctx.fillStyle = (charSelectStep === 1 && i === charSelectBuild) ? PALETTE.lightest : PALETTE.light;
    ctx.fillText((charSelectStep === 1 && i === charSelectBuild) ? '>' : ' ', 40, y);
    ctx.fillText(BUILDS[i].name, 60, y);
    ctx.fillStyle = PALETTE.light;
    ctx.font = '11px "Courier New", monospace';
    ctx.fillText(BUILDS[i].desc, 200, y);
    ctx.font = '13px "Courier New", monospace';
  }
  
  // Bestätigung
  if (charSelectStep === 1) {
    ctx.fillStyle = PALETTE.lightest;
    ctx.font = '11px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ENTER = Start!', canvas.width / 2, 320);
  }
  
  charSelectFrame++;
}

// ============================================
// OVERWORLD
// ============================================

function renderOverworld() {
  // Karte rendern
  if (currentMap) {
    renderMap(currentMap);
  }
  
  // Trainer-Sprites rendern
  if (currentMap && currentMap.trainers) {
    const badgeCount = (player && player.badges) ? player.badges.length : 0;
    for (const trainer of currentMap.trainers) {
      // Final boss only visible when player has enough badges
      if (trainer.isFinalBoss && badgeCount < (trainer.requiredBadges || 12)) continue;
      const tx = trainer.x * 16 - cameraX;
      const ty = trainer.y * 16 - cameraY;
      if (tx > -32 && tx < canvas.width + 32 && ty > -32 && ty < canvas.height + 32) {
        if (trainer.defeated) {
          // Besiegte Trainer grau einfaerben
          ctx.globalAlpha = 0.5;
        }
        const sprite = Sprites[trainer.sprite] || Sprites.trainerTim;
        drawSprite(sprite, tx, ty - 8, 1);
        ctx.globalAlpha = 1.0;
        // "!"-Indikator wenn Spieler in der Nähe ist (nur wenn nicht besiegt)
        if (player && !trainer.defeated) {
          const dist = Math.abs(player.x - trainer.x) + Math.abs(player.y - trainer.y);
          if (dist <= 2) {
            ctx.fillStyle = trainer.isFinalBoss ? '#ff44ff' : PALETTE.lightest;
            ctx.font = 'bold 8px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('!', tx + 8, ty - 14);
          }
        }
      }
    }
  }

  // Court indicators (badge markers on courts)
  if (currentMap && currentMap.courts) {
    for (const court of currentMap.courts) {
      const cx = court.pos.x * 16 - cameraX + 8;
      const cy = court.pos.y * 16 - cameraY - 4;
      if (cx > -16 && cx < canvas.width + 16 && cy > -16 && cy < canvas.height + 16) {
        const hasBadge = player && player.badges && player.badges.find(b => b === court.badge);
        ctx.fillStyle = hasBadge ? (court.badgeColor || PALETTE.lightest) : PALETTE.dark;
        ctx.strokeStyle = hasBadge ? PALETTE.lightest : PALETTE.darkest;
        ctx.lineWidth = 1;
        // Draw small badge octagon
        ctx.beginPath();
        ctx.moveTo(cx - 5, cy - 2);
        ctx.lineTo(cx - 2, cy - 5);
        ctx.lineTo(cx + 2, cy - 5);
        ctx.lineTo(cx + 5, cy - 2);
        ctx.lineTo(cx + 5, cy + 2);
        ctx.lineTo(cx + 2, cy + 5);
        ctx.lineTo(cx - 2, cy + 5);
        ctx.lineTo(cx - 5, cy + 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // "!" marker if player is near and hasn't beaten this court yet
        if (player && !hasBadge) {
          const dist = Math.abs(player.x - court.pos.x) + Math.abs(player.y - court.pos.y);
          if (dist <= 3) {
            ctx.fillStyle = hasBadge ? PALETTE.lightest : '#aaaa5a';
            ctx.font = 'bold 8px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('!', cx, cy - 8);
          }
        }
      }
    }
  }

  // NPC-Sprites rendern (Interactables)
  if (currentMap && currentMap.interactables) {
    for (const npc of currentMap.interactables) {
      const nx = npc.x * 16 - cameraX;
      const ny = npc.y * 16 - cameraY;
      if (nx > -32 && nx < canvas.width + 32 && ny > -32 && ny < canvas.height + 32) {
        const sprite = Sprites[npc.sprite] || Sprites.npcGeneric;
        drawSprite(sprite, nx, ny - 8, 1);
        // "!"-Indikator wenn Spieler in der Nähe ist
        if (player) {
          const dist = Math.abs(player.x - npc.x) + Math.abs(player.y - npc.y);
          if (dist <= 2) {
            ctx.fillStyle = PALETTE.lightest;
            ctx.font = 'bold 8px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('!', nx + 8, ny - 14);
          }
        }
      }
    }
  }

  // Spieler-Sprite
  if (player) {
    const px = player.x * 16 - cameraX;
    const py = player.y * 16 - cameraY;
    drawPlayerSprite(px, py, player.direction, player.frame);
  }
  
  // HUD
  renderHUD();
}

function renderMap(map) {
  const startX = Math.floor(cameraX / 16);
  const startY = Math.floor(cameraY / 16);
  const endX = startX + Math.ceil(canvas.width / 16) + 1;
  const endY = startY + Math.ceil(canvas.height / 16) + 1;
  
  for (let y = startY; y < endY && y < map.height; y++) {
    for (let x = startX; x < endX && x < map.width; x++) {
      if (x < 0 || y < 0) continue;
      const tile = map.tiles[y][x];
      const screenX = x * 16 - cameraX;
      const screenY = y * 16 - cameraY;
      drawTile(tile, screenX, screenY);
    }
  }
}

function drawTile(tile, x, y) {
  switch(tile) {
    case 0: // Gras
      drawPixelRect(x, y, 16, 16, PALETTE.light);
      // Gras-Details
      if ((x + y) % 7 === 0) drawPixelRect(x + 3, y + 5, 2, 2, PALETTE.lightest);
      if ((x + y) % 11 === 0) drawPixelRect(x + 10, y + 8, 2, 2, PALETTE.lightest);
      break;
    case 1: // Weg (Asphalt)
      drawPixelRect(x, y, 16, 16, '#6b7a5a');
      drawPixelRect(x, y, 16, 1, '#5a6a4a');
      break;
    case 2: // Haus-Wand
      drawPixelRect(x, y, 16, 16, '#8b7355');
      drawPixelRect(x, y, 16, 2, '#6b5335');
      drawPixelRect(x, y + 7, 16, 1, '#6b5335');
      break;
    case 3: // Basketball-Court
      drawPixelRect(x, y, 16, 16, '#c4944a');
      drawPixelRect(x + 1, y + 1, 14, 14, '#b0843a');
      // Court-Linien
      if (x % 4 === 0) drawPixelRect(x + 7, y, 2, 16, '#906a28');
      break;
    case 4: // Wasser
      drawPixelRect(x, y, 16, 16, PALETTE.darkest);
      drawPixelRect(x + 2, y + 3, 4, 2, '#1a4a1a');
      drawPixelRect(x + 8, y + 9, 4, 2, '#1a4a1a');
      break;
    case 5: // Baum
      drawPixelRect(x, y, 16, 16, PALETTE.light);
      drawPixelRect(x + 5, y + 1, 6, 5, PALETTE.dark);
      drawPixelRect(x + 3, y + 6, 10, 4, PALETTE.dark);
      drawPixelRect(x + 4, y + 10, 8, 6, PALETTE.darkest);
      break;
    case 6: // Schule-Wand
      drawPixelRect(x, y, 16, 16, '#7a6a5a');
      drawPixelRect(x, y, 16, 2, '#5a4a3a');
      drawPixelRect(x + 2, y + 4, 4, 4, '#9aaaaa'); // Fenster
      drawPixelRect(x + 10, y + 4, 4, 4, '#9aaaaa'); // Fenster
      break;
    case 7: // Zaun
      drawPixelRect(x, y, 16, 16, PALETTE.light);
      drawPixelRect(x, y, 16, 2, '#7a6a4a');
      drawPixelRect(x, y + 5, 16, 2, '#7a6a4a');
      drawPixelRect(x, y + 10, 16, 2, '#7a6a4a');
      drawPixelRect(x + 3, y, 2, 16, '#6a5a3a');
      drawPixelRect(x + 11, y, 2, 16, '#6a5a3a');
      break;
    case 8: // Tür
      drawPixelRect(x, y, 16, 16, '#5a3a1a');
      drawPixelRect(x + 2, y + 1, 12, 14, '#4a2a0a');
      drawPixelRect(x + 10, y + 6, 2, 2, '#aa8a2a'); // Türklinke
      break;
    case 9: // Blumenbeet
      drawPixelRect(x, y, 16, 16, PALETTE.light);
      drawPixelRect(x + 2, y + 2, 4, 4, '#aa3333'); // rote Blumen
      drawPixelRect(x + 8, y + 6, 4, 4, '#aaaa33'); // gelbe Blumen
      drawPixelRect(x + 4, y + 10, 4, 4, '#3333aa'); // blaue Blumen
      break;
    case 10: // Straßenmarkierung
      drawPixelRect(x, y, 16, 16, '#6b7a5a');
      drawPixelRect(x + 6, y, 4, 16, '#aaaa5a'); // gelbe Mittellinie
      break;
    case 11: // Hof (Schulhof)
      drawPixelRect(x, y, 16, 16, '#8a8a6a');
      drawPixelRect(x + 1, y + 1, 14, 14, '#7a7a5a');
      break;
    case 12: // Tribüne
      drawPixelRect(x, y, 16, 16, '#6a6a6a');
      drawPixelRect(x + 1, y + 1, 14, 6, '#5a5a5a');
      break;
    case 13: // Basketballkorb
      drawPixelRect(x, y, 16, 16, PALETTE.light);
      drawPixelRect(x + 4, y + 2, 8, 6, '#cc6600'); // Brett
      drawPixelRect(x + 5, y + 8, 6, 4, '#ffffff'); // Netz
      drawPixelRect(x + 6, y + 1, 4, 2, '#444444'); // Halterung
      break;
    default:
      drawPixelRect(x, y, 16, 16, PALETTE.light);
  }
}

function drawPlayerSprite(x, y, dir, frame) {
  const sprite = getPlayerSprite(player.gender, dir, frame);
  drawSprite(sprite, x, y - 8, 1);
}

function renderHUD() {
  // Level-Anzeige oben rechts
  ctx.fillStyle = PALETTE.darkest;
  ctx.fillRect(canvas.width - 80, 0, 80, 24);
  ctx.fillStyle = PALETTE.lightest;
  ctx.font = '10px "Courier New", monospace';
  ctx.textAlign = 'right';
  ctx.fillText('LV:' + (player ? player.level : 1), canvas.width - 8, 16);

  // Badges-Anzeige oben links
  if (player && player.badges && player.badges.length > 0) {
    ctx.fillStyle = PALETTE.darkest;
    ctx.fillRect(0, 0, 72, 20);
    ctx.fillStyle = PALETTE.lightest;
    ctx.font = '8px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('BADGES: ' + player.badges.length + '/12', 4, 14);
  }

  // Map name display (top center)
  if (currentMap && currentMap.name) {
    ctx.fillStyle = PALETTE.darkest;
    const nameW = ctx.measureText(currentMap.name).width + 8;
    ctx.fillRect(canvas.width / 2 - nameW / 2, 0, nameW, 14);
    ctx.fillStyle = PALETTE.light;
    ctx.font = '8px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(currentMap.name, canvas.width / 2, 10);
  }
  
  // Item count indicator (bottom-left hint)
  if (player && player.inventory && player.inventory.length > 0) {
    ctx.fillStyle = PALETTE.darkest;
    ctx.fillRect(0, canvas.height - 14, 50, 14);
    ctx.fillStyle = PALETTE.lightest;
    ctx.font = '8px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('M=Menu[' + player.inventory.length + ']', 2, canvas.height - 4);
  } else {
    ctx.fillStyle = PALETTE.darkest;
    ctx.fillRect(0, canvas.height - 14, 38, 14);
    ctx.fillStyle = PALETTE.dark;
    ctx.font = '8px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('M=Menu', 2, canvas.height - 4);
  }
}

// ============================================
// CREDITS SCREEN (Endgame)
// ============================================

let creditsFrame = 0;
let creditsScrollY = 0;

const CREDITS_LINES = [
  '',
  'NORDHORN ALLSTARS',
  '',
  'DU BIST DER',
  'BASKETBALL-KÖNIG!',
  '',
  '---',
  '',
  'GRATULATION!',
  '',
  'Du hast alle 12 Courts besiegt',
  'und König bezwungen.',
  'Nordhorn gehört dir!',
  '',
  '---',
  '',
  'TEAM:',
  '  Code & Design: Jurica',
  '  AI-Agent: Homer',
  '  Engine: Canvas + JS',
  '',
  '---',
  '',
  'Danke fürs Spielen!',
  '',
  'Drücke ENTER für Neustart',
  ''
];

function renderCredits() {
  ctx.fillStyle = PALETTE.darkest;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  creditsScrollY = Math.min(creditsFrame * 0.4, CREDITS_LINES.length * 18 + 60 - canvas.height / 2);

  ctx.textAlign = 'center';
  const centerX = canvas.width / 2;
  const startY = 60;

  for (let i = 0; i < CREDITS_LINES.length; i++) {
    const line = CREDITS_LINES[i];
    const y = startY + i * 18 - creditsScrollY;
    if (y < -20 || y > canvas.height + 20) continue;

    if (line.includes('NORDHORN') || line.includes('KÖNIG')) {
      ctx.fillStyle = PALETTE.lightest;
      ctx.font = 'bold 16px "Courier New", monospace';
    } else if (line.startsWith('---')) {
      ctx.fillStyle = PALETTE.dark;
      ctx.font = '10px "Courier New", monospace';
    } else if (line === 'GRATULATION!') {
      ctx.fillStyle = '#aaaa5a';
      ctx.font = 'bold 14px "Courier New", monospace';
    } else {
      ctx.fillStyle = PALETTE.light;
      ctx.font = '11px "Courier New", monospace';
    }
    ctx.fillText(line, centerX, y);
  }

  // Basketball animation at top
  const ballY = 30 + Math.sin(creditsFrame * 0.05) * 8;
  ctx.fillStyle = PALETTE.light;
  ctx.beginPath();
  ctx.arc(30, ballY, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.lightest;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Restart prompt at bottom
  if (creditsFrame > 120) {
    if (Math.floor(creditsFrame / 30) % 2 === 0) {
      ctx.fillStyle = PALETTE.lightest;
      ctx.font = '11px "Courier New", monospace';
      ctx.fillText('ENTER = Neustart', centerX, canvas.height - 20);
    }
  }

  creditsFrame++;
}

// ============================================
// KAMERA
// ============================================

let cameraX = 0;
let cameraY = 0;

function updateCamera() {
  if (player && currentMap) {
    cameraX = player.x * 16 - canvas.width / 2 + 8;
    cameraY = player.y * 16 - canvas.height / 2 + 8;
    cameraX = Math.max(0, Math.min(cameraX, currentMap.width * 16 - canvas.width));
    cameraY = Math.max(0, Math.min(cameraY, currentMap.height * 16 - canvas.height));
  }
}

// ============================================
// INPUT
// ============================================

document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  keysPressed[e.key] = true;
  // Initialize audio on first keypress (browser autoplay policy)
  Audio.init();
  Audio.resume();
});

document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

function wasPressed(key) {
  if (keysPressed[key]) {
    keysPressed[key] = false;
    return true;
  }
  return false;
}

// ============================================
// GAME LOOP
// ============================================

function gameLoop() {
  // Screen löschen
  ctx.fillStyle = PALETTE.darkest;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  switch(gameState) {
    case GameState.TITLE:
      renderTitle();
      if (!ScreenTransition.active && (wasPressed('Enter') || wasPressed(' '))) {
        Audio.titleSelect();
        ScreenTransition.start(() => {
          gameState = GameState.CHARACTER_SELECT;
        });
      }
      break;
      
    case GameState.CHARACTER_SELECT:
      renderCharacterSelect();
      if (charSelectStep === 0) {
        if (wasPressed('ArrowLeft') || wasPressed('ArrowRight')) {
          charSelectGender = charSelectGender === 0 ? 1 : 0;
          Audio.menuMove();
        }
        if (!ScreenTransition.active && (wasPressed('Enter') || wasPressed(' '))) {
          Audio.menuSelect();
          charSelectStep = 1;
        }
      } else {
        if (wasPressed('ArrowUp')) { charSelectBuild = Math.max(0, charSelectBuild - 1); Audio.menuMove(); }
        if (wasPressed('ArrowDown')) { charSelectBuild = Math.min(2, charSelectBuild + 1); Audio.menuMove(); }
        if (!ScreenTransition.active && (wasPressed('Enter') || wasPressed(' '))) {
          Audio.menuSelect();
          ScreenTransition.start(() => {
            startGame(charSelectGender, charSelectBuild);
          });
        }
        if (wasPressed('Escape')) { Audio.menuCancel(); charSelectStep = 0; }
      }
      break;
      
    case GameState.OVERWORLD:
      updateCamera();
      renderOverworld();
      if (player) player.update();
      // Open menu with M key
      if (wasPressed('m') || wasPressed('M')) {
        Menu.open();
      }
      // Toggle mute with X key
      if (wasPressed('x') || wasPressed('X')) {
        Audio.toggleMute();
      }
      break;
      
    case GameState.MENU:
      renderOverworld();
      Menu.render();
      Menu.update();
      break;
      
    case GameState.DIALOG:
      renderOverworld();
      Dialog.render();
      Dialog.update();
      break;
      
    case GameState.BATTLE:
      Battle.render();
      Battle.update();
      // Show dialog overlays on top of battle screen
      if (Dialog.active) {
        Dialog.render();
        Dialog.update();
      }
      break;
      
    case GameState.CREDITS:
      renderCredits();
      if (creditsFrame === 1) Audio.credits();
      if (creditsFrame > 120 && !ScreenTransition.active && (wasPressed('Enter') || wasPressed(' '))) {
        Audio.titleSelect();
        ScreenTransition.start(() => {
          gameState = GameState.TITLE;
          creditsFrame = 0;
          creditsScrollY = 0;
          player = null;
          currentMap = null;
        });
      }
      break;
  }
  
  // Update and render screen transitions on top of everything
  ScreenTransition.update();
  ScreenTransition.render();
  
  requestAnimationFrame(gameLoop);
}

function startGame(gender, buildIndex) {
  player = new Player(6, 7, gender, BUILDS[buildIndex]);
  currentMap = Maps.nordhorn;
  gameState = GameState.OVERWORLD;
}

// Start
gameLoop();
