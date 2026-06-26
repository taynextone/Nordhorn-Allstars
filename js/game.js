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
  MENU: 'menu'
};

let gameState = GameState.TITLE;
let player = null;
let currentMap = null;
let keys = {};
let keysPressed = {};

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
let charSelectPos = 0;

const BUILDS = [
  { name: 'SHOOTER', desc: 'Wurf++', color: PALETTE.lightest },
  { name: 'ALLROUNDER', desc: 'Ausgewogen', color: PALETTE.light },
  { name: 'VERTEIDIGER', desc: 'Block++', color: PALETTE.dark }
];

function renderCharacterSelect() {
  ctx.fillStyle = PALETTE.darkest;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = PALETTE.lightest;
  ctx.font = 'bold 16px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('CHARAKTER WÄHLEN', canvas.width / 2, 50);
  
  // Junge/Mädchen Auswahl
  ctx.font = '13px "Courier New", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(charSelectPos === 0 ? '>' : ' ', 40, 90);
  ctx.fillText('JUNGE', 60, 90);
  ctx.fillText(charSelectPos === 1 ? '>' : ' ', 240, 90);
  ctx.fillText('MÄDCHEN', 260, 90);
  
  // Build-Auswahl
  ctx.fillText('BUILD:', 40, 140);
  for (let i = 0; i < 3; i++) {
    const y = 160 + i * 40;
    ctx.fillStyle = i === charSelectPos - 2 ? PALETTE.lightest : PALETTE.light;
    ctx.fillText(i === charSelectPos - 2 ? '>' : ' ', 40, y);
    ctx.fillText(BUILDS[i].name, 60, y);
    ctx.fillStyle = PALETTE.light;
    ctx.font = '11px "Courier New", monospace';
    ctx.fillText(BUILDS[i].desc, 200, y);
    ctx.font = '13px "Courier New", monospace';
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
      break;
    case 1: // Weg
      drawPixelRect(x, y, 16, 16, PALETTE.lightest);
      break;
    case 2: // Haus
      drawPixelRect(x, y, 16, 16, PALETTE.dark);
      break;
    case 3: // Court (Basketball-Platz)
      drawPixelRect(x, y, 16, 16, PALETTE.dark);
      drawPixelRect(x + 4, y + 4, 8, 8, PALETTE.light);
      break;
    case 4: // Wasser
      drawPixelRect(x, y, 16, 16, PALETTE.darkest);
      break;
    case 5: // Baum
      drawPixelRect(x, y, 16, 16, PALETTE.light);
      drawPixelRect(x + 4, y + 2, 8, 6, PALETTE.dark);
      drawPixelRect(x + 2, y + 8, 12, 8, PALETTE.darkest);
      break;
    case 6: // Schule
      drawPixelRect(x, y, 16, 16, PALETTE.dark);
      drawPixelRect(x + 2, y + 2, 12, 12, PALETTE.lightest);
      break;
    case 7: // Zaun
      drawPixelRect(x, y, 16, 16, PALETTE.light);
      drawPixelRect(x, y, 16, 2, PALETTE.dark);
      drawPixelRect(x, y + 8, 16, 2, PALETTE.dark);
      break;
    default:
      drawPixelRect(x, y, 16, 16, PALETTE.light);
  }
}

function drawPlayerSprite(x, y, dir, frame) {
  // Einfacher 16x16 Sprite
  const px = Math.floor(x);
  const py = Math.floor(y);
  
  // Kopf
  drawPixelRect(px + 4, py, 8, 6, PALETTE.lightest);
  // Körper
  drawPixelRect(px + 3, py + 6, 10, 6, PALETTE.dark);
  // Beine (animiert)
  if (frame % 2 === 0) {
    drawPixelRect(px + 3, py + 12, 4, 4, PALETTE.darkest);
    drawPixelRect(px + 9, py + 12, 4, 4, PALETTE.darkest);
  } else {
    drawPixelRect(px + 2, py + 12, 4, 4, PALETTE.darkest);
    drawPixelRect(px + 10, py + 12, 4, 4, PALETTE.darkest);
  }
}

function renderHUD() {
  // Level-Anzeige oben rechts
  ctx.fillStyle = PALETTE.darkest;
  ctx.fillRect(canvas.width - 80, 0, 80, 24);
  ctx.fillStyle = PALETTE.lightest;
  ctx.font = '10px "Courier New", monospace';
  ctx.textAlign = 'right';
  ctx.fillText('LV:' + (player ? player.level : 1), canvas.width - 8, 16);
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
      if (wasPressed('Enter') || wasPressed(' ')) {
        gameState = GameState.CHARACTER_SELECT;
      }
      break;
      
    case GameState.CHARACTER_SELECT:
      renderCharacterSelect();
      if (wasPressed('ArrowUp')) charSelectPos = Math.max(0, charSelectPos - 1);
      if (wasPressed('ArrowDown')) charSelectPos = Math.min(4, charSelectPos + 1);
      if (wasPressed('Enter') && charSelectPos >= 2) {
        startGame(charSelectPos - 2);
      }
      break;
      
    case GameState.OVERWORLD:
      updateCamera();
      renderOverworld();
      if (player) player.update();
      break;
      
    case GameState.DIALOG:
      renderOverworld();
      Dialog.render();
      Dialog.update();
      break;
      
    case GameState.BATTLE:
      Battle.render();
      Battle.update();
      break;
  }
  
  requestAnimationFrame(gameLoop);
}

function startGame(buildIndex) {
  player = new Player(8, 12, BUILDS[buildIndex]);
  currentMap = Maps.nordhorn;
  gameState = GameState.OVERWORLD;
}

// Start
gameLoop();
