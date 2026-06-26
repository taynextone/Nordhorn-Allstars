// ============================================
// NORDHORN ALLSTARS — ITEMS.JS
// Items, Inventory & Equipment System
// ============================================

// Item Database
const ItemsData = {
  // === VERBRAUCHS-ITEMS (Consumables) ===
  energyDrink: {
    id: 'energyDrink',
    name: 'Energy-Drink',
    type: 'consumable',
    desc: 'Stellt 10 EN wieder her',
    effect: 'restoreEnergy',
    value: 10,
    icon: 'drink',
    color: '#aaaa33'
  },
  proteinShake: {
    id: 'proteinShake',
    name: 'Protein-Shake',
    type: 'consumable',
    desc: 'Stellt 30 HP wieder her',
    effect: 'restoreHP',
    value: 30,
    icon: 'shake',
    color: '#cc6633'
  },
  sportsDrink: {
    id: 'sportsDrink',
    name: 'Sportler-Getränk',
    type: 'consumable',
    desc: 'Stellt 20 HP & 5 EN wieder her',
    effect: 'restoreBoth',
    value: { hp: 20, en: 5 },
    icon: 'sportsDrink',
    color: '#33aa33'
  },
  fullRecovery: {
    id: 'fullRecovery',
    name: 'Erholungspack',
    type: 'consumable',
    desc: 'Stellt HP & EN vollständig wieder her',
    effect: 'restoreFull',
    value: 999,
    icon: 'fullRecovery',
    color: '#3333cc'
  },

  // === EQUIPMENT (Schuhe) ===
  runningShoes: {
    id: 'runningShoes',
    name: 'Laufschuhe',
    type: 'equipment',
    slot: 'shoes',
    desc: '+2 Athleticism (mehr Präzision)',
    effect: 'boostStat',
    stat: 'athleticism',
    value: 2,
    icon: 'shoes',
    color: '#cc3333'
  },
  proShoes: {
    id: 'proShoes',
    name: 'Pro-Schuhe',
    type: 'equipment',
    slot: 'shoes',
    desc: '+3 Athleticism, +1 Shooting',
    effect: 'boostStats',
    stats: { athleticism: 3, shooting: 1 },
    icon: 'proShoes',
    color: '#3333cc'
  },
  kingShoes: {
    id: 'kingShoes',
    name: 'Königsschuhe',
    type: 'equipment',
    slot: 'shoes',
    desc: '+4 Athleticism, +2 Shooting',
    effect: 'boostStats',
    stats: { athleticism: 4, shooting: 2 },
    icon: 'kingShoes',
    color: '#ff44ff'
  },

  // === EQUIPMENT (Armbänder) ===
  leatherBracelet: {
    id: 'leatherBracelet',
    name: 'Leder-Armband',
    type: 'equipment',
    slot: 'bracelet',
    desc: '+2 Defense',
    effect: 'boostStat',
    stat: 'defense',
    value: 2,
    icon: 'bracelet',
    color: '#aa6633'
  },
  championBracelet: {
    id: 'championBracelet',
    name: 'Champion-Armband',
    type: 'equipment',
    slot: 'bracelet',
    desc: '+3 Defense, +1 Dribbling',
    effect: 'boostStats',
    stats: { defense: 3, dribbling: 1 },
    icon: 'championBracelet',
    color: '#ddaa22'
  },
  masterBracelet: {
    id: 'masterBracelet',
    name: 'Meister-Armband',
    type: 'equipment',
    slot: 'bracelet',
    desc: '+4 Defense, +2 Court Vision',
    effect: 'boostStats',
    stats: { defense: 4, courtVision: 2 },
    icon: 'masterBracelet',
    color: '#33cccc'
  }
};

// Item pickup definitions for map placement
const ItemPickups = [
  // Nordhorn item pickups
  { map: 'nordhorn', x: 15, y: 5, item: 'runningShoes', dialog: ['Hey! Schau mal da!', 'Da liegt ein Paar Laufschuhe!', 'Die geben dir mehr Präzision!'] },
  { map: 'nordhorn', x: 35, y: 24, item: 'energyDrink', dialog: ['Im Regal hinten findest du etwas.', 'Ein Energy-Drink! Gut für zwischendurch.'] },
  { map: 'nordhorn', x: 3, y: 15, item: 'leatherBracelet', dialog: ['Am Zaun hängt ein Armband.', 'Ein Leder-Armband! Stärkt deine Verteidigung.'] },
  { map: 'nordhorn', x: 46, y: 38, item: 'proteinShake', dialog: ['Im Stadion-Vorraum steht ein Shake.', 'Protein-Shake! Füllt deine HP wieder auf.'] },
  { map: 'nordhorn', x: 16, y: 28, item: 'sportsDrink', dialog: ['Auf dem Parktisch liegt ein Getränk.', 'Sportler-Getränk! Stellt HP und EN wieder her.'] },
  // Lingen item pickups
  { map: 'lingen', x: 14, y: 4, item: 'proShoes', dialog: ['Am Bahnhof liegen Schuhe.', 'Pro-Schuhe! Sehr gute Qualität.'] },
  { map: 'lingen', x: 40, y: 6, item: 'championBracelet', dialog: ['In der Fabrik wurde ein Armband gefunden.', 'Champion-Armband! Stärkt deine Verteidigung.'] },
  { map: 'lingen', x: 25, y: 32, item: 'sportsDrink', dialog: ['Am Hafen liegt ein Getränk.', 'Sportler-Getränk! Erfrischend.'] },
  { map: 'lingen', x: 30, y: 30, item: 'energyDrink', dialog: ['Im Park steht ein Kiosk.', 'Energy-Drink! Macht wach.'] }
];

// ============================================
// INVENTORY MANAGEMENT
// ============================================

// Add inventory to Player (called from player.js)
function initPlayerInventory() {
  if (!player.inventory) {
    player.inventory = [];
  }
  if (!player.equipment) {
    player.equipment = { shoes: null, bracelet: null };
  }
}

function addItemToInventory(itemId) {
  const item = ItemsData[itemId];
  if (!item) return null;
  if (!player.inventory) initPlayerInventory();
  player.inventory.push({ ...item });
  Audio.itemPickup();
  autoSave();
  return item;
}

function removeItemFromInventory(index) {
  if (!player.inventory || index < 0 || index >= player.inventory.length) return null;
  return player.inventory.splice(index, 1)[0];
}

function useItem(index) {
  if (!player.inventory || index < 0 || index >= player.inventory.length) return null;
  const item = player.inventory[index];
  
  if (item.type === 'consumable') {
    let result = applyItemEffect(item);
    if (result) {
      player.inventory.splice(index, 1);
    }
    return result;
  } else if (item.type === 'equipment') {
    return equipItem(index);
  }
  return null;
}

function applyItemEffect(item) {
  switch (item.effect) {
    case 'restoreEnergy':
      if (player.energy >= player.maxEnergy) return { success: false, msg: 'EN ist schon voll!' };
      player.energy = Math.min(player.maxEnergy, player.energy + item.value);
      return { success: true, msg: `+${item.value} EN wiederhergestellt!` };
    case 'restoreHP':
      // HP only meaningful in battle; store as overworld heal
      if (!Battle.active) {
        // In overworld, just show message (HP resets in battle anyway)
        return { success: true, msg: `+${item.value} HP (gilt im nächsten Kampf)` };
      }
      Battle.playerHP = Math.min(100, Battle.playerHP + item.value);
      return { success: true, msg: `+${item.value} HP wiederhergestellt!` };
    case 'restoreBoth':
      if (!Battle.active) {
        player.energy = Math.min(player.maxEnergy, player.energy + item.value.en);
        return { success: true, msg: `+${item.value.hp} HP, +${item.value.en} EN!` };
      }
      Battle.playerHP = Math.min(100, Battle.playerHP + item.value.hp);
      player.energy = Math.min(player.maxEnergy, player.energy + item.value.en);
      return { success: true, msg: `+${item.value.hp} HP, +${item.value.en} EN!` };
    case 'restoreFull':
      if (!Battle.active) {
        player.energy = player.maxEnergy;
        return { success: true, msg: 'HP & EN vollständig wiederhergestellt!' };
      }
      Battle.playerHP = 100;
      player.energy = player.maxEnergy;
      return { success: true, msg: 'HP & EN vollständig wiederhergestellt!' };
    default:
      return null;
  }
}

function equipItem(index) {
  if (!player.inventory || index < 0 || index >= player.inventory.length) return null;
  const item = player.inventory[index];
  if (item.type !== 'equipment') return null;
  
  const slot = item.slot;
  const previousEquip = player.equipment[slot];
  
  // Unequip current item (return to inventory)
  if (previousEquip) {
    player.inventory.push({ ...previousEquip });
  }
  
  // Equip new item
  player.equipment[slot] = { ...item };
  player.inventory.splice(index, 1);
  
  // Apply stat boosts
  applyEquipmentBoosts();
  autoSave();
  
  return { success: true, msg: `${item.name} ausgerüstet!`, unequipped: previousEquip ? previousEquip.name : null };
}

function unequipItem(slot) {
  if (!player.equipment || !player.equipment[slot]) return null;
  const item = player.equipment[slot];
  player.inventory.push({ ...item });
  player.equipment[slot] = null;
  applyEquipmentBoosts();
  autoSave();
  return { success: true, msg: `${item.name} abgelegt.` };
}

// Calculate total stat boosts from equipment
function getEquipmentBoosts() {
  const boosts = { dribbling: 0, shooting: 0, athleticism: 0, defense: 0, courtVision: 0 };
  if (!player.equipment) return boosts;
  
  for (const slot of ['shoes', 'bracelet']) {
    const item = player.equipment[slot];
    if (!item) continue;
    
    if (item.effect === 'boostStat') {
      boosts[item.stat] += item.value;
    } else if (item.effect === 'boostStats') {
      for (const stat in item.stats) {
        boosts[stat] += item.stats[stat];
      }
    }
  }
  return boosts;
}

// Apply equipment boosts to player stats (called after equip/unequip)
function applyEquipmentBoosts() {
  // Store base stats if not already stored
  if (!player.baseStats) {
    player.baseStats = { ...player.stats };
  }
  
  // Reset to base stats
  player.stats = { ...player.baseStats };
  
  // Apply equipment boosts
  const boosts = getEquipmentBoosts();
  for (const stat in boosts) {
    player.stats[stat] += boosts[stat];
  }
}

// Get effective shooting stat (base + equipment)
function getEffectiveShooting() {
  const boosts = getEquipmentBoosts();
  return player.stats.shooting + boosts.shooting;
}

function getEffectiveAthleticism() {
  const boosts = getEquipmentBoosts();
  return player.stats.athleticism + boosts.athleticism;
}

function getEffectiveDefense() {
  const boosts = getEquipmentBoosts();
  return player.stats.defense + boosts.defense;
}

// ============================================
// MENU SYSTEM
// ============================================

const Menu = {
  active: false,
  tab: 'status', // 'status', 'items', 'equipment', 'save'
  selectedIndex: 0,
  scrollOffset: 0,
  message: '',
  messageTimer: 0,
  
  TABS: ['status', 'items', 'equipment', 'save'],
  TAB_LABELS: { status: 'Status', items: 'Items', equipment: 'Ausrüstung', save: 'Speichern' },
  TAB_ICONS: { status: '♥', items: '◆', equipment: '▲', save: '💾' },
  
  open() {
    this.active = true;
    this.tab = 'status';
    this.selectedIndex = 0;
    this.scrollOffset = 0;
    this.message = '';
    if (gameState === GameState.OVERWORLD) {
      gameState = GameState.MENU;
    }
    Audio.menuSelect();
  },
  
  close() {
    this.active = false;
    if (gameState === GameState.MENU) {
      gameState = GameState.OVERWORLD;
    }
    Audio.menuCancel();
  },
  
  nextTab() {
    const idx = this.TABS.indexOf(this.tab);
    this.tab = this.TABS[(idx + 1) % this.TABS.length];
    this.selectedIndex = 0;
    this.scrollOffset = 0;
    Audio.menuMove();
  },
  
  prevTab() {
    const idx = this.TABS.indexOf(this.tab);
    this.tab = this.TABS[(idx - 1 + this.TABS.length) % this.TABS.length];
    this.selectedIndex = 0;
    this.scrollOffset = 0;
    Audio.menuMove();
  },
  
  update() {
    if (!this.active) return;
    
    if (this.messageTimer > 0) this.messageTimer--;
    
    // Close menu
    if (wasPressed('Escape') || wasPressed('m') || wasPressed('M')) {
      this.close();
      return;
    }
    
    // Tab switching
    if (wasPressed('ArrowLeft')) { this.prevTab(); return; }
    if (wasPressed('ArrowRight')) { this.nextTab(); return; }
    
    if (this.tab === 'status') {
      // Status tab: no item selection, just info display
      return;
    }
    
    if (this.tab === 'save') {
      if (wasPressed('Enter') || wasPressed(' ')) {
        Audio.menuSelect();
        autoSave();
        this.message = 'Spielstand gespeichert!';
        this.messageTimer = 90;
      }
      return;
    }
    
    const items = this.getCurrentList();
    
    if (wasPressed('ArrowUp')) {
      this.selectedIndex = Math.max(0, this.selectedIndex - 1);
      if (this.selectedIndex < this.scrollOffset) this.scrollOffset = this.selectedIndex;
      Audio.menuMove();
    }
    if (wasPressed('ArrowDown')) {
      this.selectedIndex = Math.min(items.length - 1, this.selectedIndex + 1);
      if (this.selectedIndex >= this.scrollOffset + 6) this.scrollOffset = this.selectedIndex - 5;
      Audio.menuMove();
    }
    if (wasPressed('Enter') || wasPressed(' ')) {
      Audio.menuSelect();
      this.useSelected();
    }
  },
  
  getCurrentList() {
    if (this.tab === 'items') {
      return player && player.inventory ? player.inventory : [];
    } else if (this.tab === 'equipment') {
      const list = [];
      if (player && player.equipment) {
        if (player.equipment.shoes) list.push({ ...player.equipment.shoes, _equipped: true, _slot: 'shoes' });
        if (player.equipment.bracelet) list.push({ ...player.equipment.bracelet, _equipped: true, _slot: 'bracelet' });
      }
      return list;
    }
    return [];
  },
  
  useSelected() {
    const items = this.getCurrentList();
    if (items.length === 0) {
      this.message = 'Keine Items vorhanden!';
      this.messageTimer = 60;
      return;
    }
    
    const item = items[this.selectedIndex];
    if (!item) return;
    
    if (this.tab === 'items') {
      const invIndex = player.inventory.indexOf(item);
      const result = useItem(invIndex);
      if (result) {
        if (result.success) {
          this.message = result.msg;
          this.messageTimer = 90;
        } else {
          this.message = result.msg;
          this.messageTimer = 60;
        }
      }
    } else {
      const result = unequipItem(item._slot);
      if (result) {
        this.message = result.msg;
        this.messageTimer = 60;
      }
    }
  },
  
  render() {
    if (!this.active) return;
    
    // Background overlay
    ctx.fillStyle = PALETTE.darkest;
    ctx.globalAlpha = 0.88;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1.0;
    
    // Menu box
    const mx = 12, my = 12, mw = canvas.width - 24, mh = canvas.height - 24;
    ctx.fillStyle = PALETTE.darkest;
    ctx.fillRect(mx, my, mw, mh);
    ctx.strokeStyle = PALETTE.lightest;
    ctx.lineWidth = 2;
    ctx.strokeRect(mx + 2, my + 2, mw - 4, mh - 4);
    // Inner border for Gameboy feel
    ctx.strokeStyle = PALETTE.light;
    ctx.lineWidth = 1;
    ctx.strokeRect(mx + 5, my + 5, mw - 10, mh - 10);
    
    // Title
    ctx.fillStyle = PALETTE.lightest;
    ctx.font = 'bold 14px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('⏸ PAUSE-MENÜ', canvas.width / 2, my + 22);
    
    // Tabs — draw all 4 tabs
    ctx.font = 'bold 10px "Courier New", monospace';
    const tabWidth = mw / 4;
    for (let i = 0; i < this.TABS.length; i++) {
      const tab = this.TABS[i];
      const tx = mx + i * tabWidth;
      const isActive = this.tab === tab;
      // Tab background
      if (isActive) {
        ctx.fillStyle = PALETTE.dark;
        ctx.fillRect(tx + 2, my + 30, tabWidth - 4, 18);
        ctx.strokeStyle = PALETTE.lightest;
        ctx.lineWidth = 1;
        ctx.strokeRect(tx + 2, my + 30, tabWidth - 4, 18);
      }
      ctx.fillStyle = isActive ? PALETTE.lightest : PALETTE.light;
      ctx.textAlign = 'center';
      const label = this.TAB_ICONS[tab] + ' ' + this.TAB_LABELS[tab];
      ctx.fillText(label, tx + tabWidth / 2, my + 43);
    }
    
    // Content area
    const contentY = my + 55;
    
    if (this.tab === 'status') {
      this.renderStatusTab(mx, contentY, mw, mh - 70);
    } else if (this.tab === 'save') {
      this.renderSaveTab(mx, contentY, mw);
    } else {
      this.renderItemListTab(mx, contentY, mw, mh - 70);
    }
    
    // Message display
    if (this.messageTimer > 0 && this.message) {
      ctx.fillStyle = PALETTE.darkest;
      const msgW = Math.min(280, ctx.measureText(this.message).width + 16);
      ctx.fillRect(canvas.width / 2 - msgW / 2, my + mh - 24, msgW, 18);
      ctx.strokeStyle = PALETTE.lightest;
      ctx.lineWidth = 1;
      ctx.strokeRect(canvas.width / 2 - msgW / 2, my + mh - 24, msgW, 18);
      ctx.fillStyle = PALETTE.lightest;
      ctx.font = '10px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(this.message, canvas.width / 2, my + mh - 10);
    }
    
    // Controls hint
    ctx.fillStyle = PALETTE.dark;
    ctx.font = '8px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('←→ = Tab  ↑↓ = Wählen  ENTER = Benutzen  ESC/M = Schließen', canvas.width / 2, my + mh - 3);
  },
  
  renderStatusTab(mx, sy, mw, sh) {
    if (!player) return;
    
    const centerX = mx + mw / 2;
    let y = sy + 10;
    
    // Player name/build
    ctx.fillStyle = PALETTE.lightest;
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.textAlign = 'center';
    const buildName = player.build ? player.build.name : 'PLAYER';
    ctx.fillText(buildName, centerX, y);
    y += 18;
    
    // Level & EXP
    ctx.font = '10px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = PALETTE.light;
    ctx.fillText(`Level: ${player.level}`, mx + 20, y);
    ctx.textAlign = 'right';
    ctx.fillText(`EN: ${player.energy}/${player.maxEnergy}`, mx + mw - 20, y);
    y += 16;
    
    // EXP bar
    ctx.textAlign = 'left';
    ctx.fillStyle = PALETTE.light;
    ctx.fillText('EXP:', mx + 20, y);
    const barX = mx + 55, barW = mw - 80, barH = 8;
    ctx.fillStyle = PALETTE.darkest;
    ctx.fillRect(barX, y - 7, barW, barH);
    const expPct = player.expToNext > 0 ? player.exp / player.expToNext : 0;
    ctx.fillStyle = PALETTE.lightest;
    ctx.fillRect(barX, y - 7, Math.floor(barW * expPct), barH);
    ctx.strokeStyle = PALETTE.light;
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, y - 7, barW, barH);
    ctx.fillStyle = PALETTE.dark;
    ctx.font = '8px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${player.exp}/${player.expToNext}`, barX + barW / 2, y);
    y += 20;
    
    // Divider
    ctx.fillStyle = PALETTE.dark;
    ctx.fillRect(mx + 15, y - 6, mw - 30, 1);
    
    // Stats
    ctx.fillStyle = PALETTE.lightest;
    ctx.font = 'bold 10px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('— WERTE —', centerX, y);
    y += 16;
    
    const stats = [
      { name: 'Dribbling', key: 'dribbling' },
      { name: 'Shooting', key: 'shooting' },
      { name: 'Athleticism', key: 'athleticism' },
      { name: 'Defense', key: 'defense' },
      { name: 'Court Vision', key: 'courtVision' }
    ];
    
    ctx.font = '10px "Courier New", monospace';
    for (const stat of stats) {
      const val = player.stats[stat.key] || 0;
      const boost = getEquipmentBoosts()[stat.key] || 0;
      ctx.textAlign = 'left';
      ctx.fillStyle = PALETTE.light;
      ctx.fillText(stat.name, mx + 20, y);
      ctx.textAlign = 'right';
      if (boost > 0) {
        ctx.fillStyle = '#aaaa5a';
        ctx.fillText(`${val} (+${boost})`, mx + mw - 20, y);
      } else {
        ctx.fillStyle = PALETTE.lightest;
        ctx.fillText(`${val}`, mx + mw - 20, y);
      }
      // Mini bar
      const miniBarX = mx + 20, miniBarW = mw - 40, miniBarH = 3;
      ctx.fillStyle = PALETTE.darkest;
      ctx.fillRect(miniBarX, y + 2, miniBarW, miniBarH);
      ctx.fillStyle = boost > 0 ? '#aaaa5a' : PALETTE.light;
      ctx.fillRect(miniBarX, y + 2, Math.floor(miniBarW * Math.min(1, val / 20)), miniBarH);
      y += 16;
    }
    
    // Divider
    ctx.fillStyle = PALETTE.dark;
    ctx.fillRect(mx + 15, y - 4, mw - 30, 1);
    y += 6;
    
    // Badges
    ctx.fillStyle = PALETTE.lightest;
    ctx.font = 'bold 10px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('— BADGES —', centerX, y);
    y += 16;
    
    const badgeCount = player.badges ? player.badges.length : 0;
    ctx.font = '10px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = PALETTE.light;
    ctx.fillText(`Gesamt: ${badgeCount} / 12`, mx + 20, y);
    y += 14;
    
    // Badge grid (4x3)
    const badgeNames = player.badges || [];
    const badgeColors = ['#cc3333', '#3333cc', '#33aa33', '#aa6633', '#ddaa22', '#33cccc', '#cc33cc', '#33cc33', '#cccc33', '#cc6633', '#6633cc', '#33cccc'];
    const gridStartX = mx + 30;
    const cellW = (mw - 60) / 4;
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        const idx = row * 4 + col;
        const bx = gridStartX + col * cellW;
        const by = y + row * 18;
        const earned = idx < badgeCount;
        // Badge octagon
        ctx.fillStyle = earned ? badgeColors[idx % badgeColors.length] : PALETTE.darkest;
        ctx.strokeStyle = earned ? PALETTE.lightest : PALETTE.dark;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bx + 5, by);
        ctx.lineTo(bx + 10, by + 3);
        ctx.lineTo(bx + 10, by + 8);
        ctx.lineTo(bx + 5, by + 11);
        ctx.lineTo(bx, by + 8);
        ctx.lineTo(bx, by + 3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Badge name
        ctx.font = '8px "Courier New", monospace';
        ctx.fillStyle = earned ? PALETTE.light : PALETTE.dark;
        ctx.textAlign = 'left';
        const bName = earned && badgeNames[idx] ? badgeNames[idx] : '???';
        ctx.fillText(bName.substring(0, 8), bx + 14, by + 9);
      }
    }
    y += 60;
    
    // Map info
    ctx.fillStyle = PALETTE.dark;
    ctx.fillRect(mx + 15, y, mw - 30, 1);
    y += 14;
    ctx.fillStyle = PALETTE.lightest;
    ctx.font = 'bold 10px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('— STANDORT —', centerX, y);
    y += 16;
    ctx.font = '10px "Courier New", monospace';
    ctx.fillStyle = PALETTE.light;
    ctx.fillText(currentMap ? currentMap.name : 'Unbekannt', centerX, y);
    y += 14;
    ctx.font = '9px "Courier New", monospace';
    ctx.fillStyle = PALETTE.dark;
    ctx.fillText(`Position: ${player.x}, ${player.y}`, centerX, y);
    
    // Moves summary
    y += 18;
    ctx.fillStyle = PALETTE.dark;
    ctx.fillRect(mx + 15, y - 6, mw - 30, 1);
    y += 8;
    ctx.fillStyle = PALETTE.lightest;
    ctx.font = 'bold 10px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('— MOVES —', centerX, y);
    y += 14;
    ctx.font = '9px "Courier New", monospace';
    ctx.fillStyle = PALETTE.light;
    if (player.moves) {
      for (let i = 0; i < Math.min(player.moves.length, 4); i++) {
        const move = player.moves[i];
        ctx.textAlign = 'left';
        ctx.fillText(`${move.name} (EN:${move.energy || 0})`, mx + 20, y);
        y += 12;
      }
    }
  },
  
  renderSaveTab(mx, sy, mw) {
    const centerX = mx + mw / 2;
    ctx.fillStyle = PALETTE.lightest;
    ctx.font = '11px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('💾 Spielstand speichern', centerX, sy + 20);
    ctx.fillStyle = PALETTE.light;
    ctx.font = '10px "Courier New", monospace';
    ctx.fillText('ENTER = Jetzt speichern', centerX, sy + 45);
    ctx.fillText('Auto-Save nach Kämpfen & Reisen', centerX, sy + 65);
    
    const saveInfo = SaveSystem.getSaveInfo();
    if (saveInfo) {
      ctx.fillStyle = PALETTE.dark;
      ctx.fillText(`Letzter Save: LV ${saveInfo.level} | ${saveInfo.badges}/12 Badges`, centerX, sy + 95);
    }
  },
  
  renderItemListTab(mx, sy, mw, sh) {
    const items = this.getCurrentList();
    const listH = 18;
    
    if (items.length === 0) {
      ctx.fillStyle = PALETTE.light;
      ctx.font = '11px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('— leer —', mx + mw / 2, sy + 40);
      return;
    }
    
    for (let i = this.scrollOffset; i < Math.min(items.length, this.scrollOffset + 6); i++) {
      const item = items[i];
      const y = sy + (i - this.scrollOffset) * listH;
      const isSelected = i === this.selectedIndex;
      
      if (isSelected) {
        ctx.fillStyle = PALETTE.dark;
        ctx.fillRect(mx + 10, y - 2, mw - 20, listH);
      }
      
      // Item icon
      ctx.fillStyle = item.color || PALETTE.lightest;
      ctx.fillRect(mx + 14, y, 8, 8);
      
      // Item name
      ctx.fillStyle = isSelected ? PALETTE.lightest : PALETTE.light;
      ctx.font = '10px "Courier New", monospace';
      ctx.textAlign = 'left';
      const prefix = item._equipped ? '[E] ' : (isSelected ? '► ' : '  ');
      ctx.fillText(prefix + item.name, mx + 28, y + 8);
      
      // Item type indicator
      ctx.textAlign = 'right';
      ctx.fillStyle = PALETTE.dark;
      const typeLabel = item.type === 'consumable' ? 'BRAUCH' : 'EQUIP';
      ctx.fillText(typeLabel, mx + mw - 14, y + 8);
    }
    
    // Description box at bottom
    const descY = sy + sh - 60;
    ctx.fillStyle = PALETTE.dark;
    ctx.fillRect(mx + 10, descY, mw - 20, 50);
    ctx.strokeStyle = PALETTE.light;
    ctx.lineWidth = 1;
    ctx.strokeRect(mx + 10, descY, mw - 20, 50);
    
    if (items[this.selectedIndex]) {
      const item = items[this.selectedIndex];
      ctx.fillStyle = PALETTE.lightest;
      ctx.font = '10px "Courier New", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(item.name, mx + 16, descY + 14);
      ctx.fillStyle = PALETTE.light;
      ctx.fillText(item.desc, mx + 16, descY + 28);
      if (item._equipped) {
        ctx.fillStyle = '#aaaa5a';
        ctx.fillText('(Ausgerüstet — ENTER zum Ablegen)', mx + 16, descY + 42);
      } else if (item.type === 'consumable') {
        ctx.fillStyle = PALETTE.light;
        ctx.fillText('ENTER = Benutzen', mx + 16, descY + 42);
      } else {
        ctx.fillStyle = PALETTE.light;
        ctx.fillText('ENTER = Ausrüsten', mx + 16, descY + 42);
      }
    }
  }
};
