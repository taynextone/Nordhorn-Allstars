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
  
  return { success: true, msg: `${item.name} ausgerüstet!`, unequipped: previousEquip ? previousEquip.name : null };
}

function unequipItem(slot) {
  if (!player.equipment || !player.equipment[slot]) return null;
  const item = player.equipment[slot];
  player.inventory.push({ ...item });
  player.equipment[slot] = null;
  applyEquipmentBoosts();
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
  tab: 'items', // 'items' or 'equipment'
  selectedIndex: 0,
  scrollOffset: 0,
  message: '',
  messageTimer: 0,
  
  open() {
    this.active = true;
    this.tab = 'items';
    this.selectedIndex = 0;
    this.scrollOffset = 0;
    this.message = '';
    if (gameState === GameState.OVERWORLD) {
      gameState = GameState.MENU;
    }
  },
  
  close() {
    this.active = false;
    if (gameState === GameState.MENU) {
      gameState = GameState.OVERWORLD;
    }
  },
  
  update() {
    if (!this.active) return;
    
    if (this.messageTimer > 0) this.messageTimer--;
    
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
    if (wasPressed('ArrowLeft') || wasPressed('ArrowRight')) {
      this.tab = this.tab === 'items' ? 'equipment' : 'items';
      this.selectedIndex = 0;
      this.scrollOffset = 0;
      Audio.menuMove();
    }
    if (wasPressed('Enter') || wasPressed(' ')) {
      Audio.menuSelect();
      this.useSelected();
    }
    if (wasPressed('Escape') || wasPressed('m') || wasPressed('M')) {
      Audio.menuCancel();
      this.close();
    }
  },
  
  getCurrentList() {
    if (this.tab === 'items') {
      return player && player.inventory ? player.inventory : [];
    } else {
      // Equipment tab: show equipped items + option to unequip
      const list = [];
      if (player && player.equipment) {
        if (player.equipment.shoes) list.push({ ...player.equipment.shoes, _equipped: true, _slot: 'shoes' });
        if (player.equipment.bracelet) list.push({ ...player.equipment.bracelet, _equipped: true, _slot: 'bracelet' });
      }
      return list;
    }
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
      // Unequip
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
    ctx.globalAlpha = 0.85;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1.0;
    
    // Menu box
    const mx = 20, my = 20, mw = canvas.width - 40, mh = canvas.height - 40;
    ctx.fillStyle = PALETTE.darkest;
    ctx.fillRect(mx, my, mw, mh);
    ctx.strokeStyle = PALETTE.lightest;
    ctx.lineWidth = 2;
    ctx.strokeRect(mx + 2, my + 2, mw - 4, mh - 4);
    
    // Title
    ctx.fillStyle = PALETTE.lightest;
    ctx.font = 'bold 14px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('RÜSTKASTEN', canvas.width / 2, my + 20);
    
    // Tabs
    ctx.font = 'bold 11px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = this.tab === 'items' ? PALETTE.lightest : PALETTE.light;
    ctx.fillText(this.tab === 'items' ? '► Items' : '  Items', mx + 15, my + 40);
    ctx.fillStyle = this.tab === 'equipment' ? PALETTE.lightest : PALETTE.light;
    ctx.fillText(this.tab === 'equipment' ? '► Ausrüstung' : '  Ausrüstung', mx + 120, my + 40);
    
    // Item list
    const items = this.getCurrentList();
    const listY = my + 55;
    const listH = 18;
    
    if (items.length === 0) {
      ctx.fillStyle = PALETTE.light;
      ctx.font = '11px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('— leer —', canvas.width / 2, listY + 40);
    } else {
      for (let i = this.scrollOffset; i < Math.min(items.length, this.scrollOffset + 6); i++) {
        const item = items[i];
        const y = listY + (i - this.scrollOffset) * listH;
        const isSelected = i === this.selectedIndex;
        
        if (isSelected) {
          ctx.fillStyle = PALETTE.dark;
          ctx.fillRect(mx + 10, y - 2, mw - 20, listH);
        }
        
        // Item icon (small colored square)
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
    }
    
    // Description box at bottom
    const descY = my + mh - 70;
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
    
    // Message display
    if (this.messageTimer > 0 && this.message) {
      ctx.fillStyle = PALETTE.darkest;
      ctx.fillRect(canvas.width / 2 - 120, my + mh - 24, 240, 18);
      ctx.fillStyle = PALETTE.lightest;
      ctx.font = '10px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(this.message, canvas.width / 2, my + mh - 10);
    }
    
    // Controls hint
    ctx.fillStyle = PALETTE.dark;
    ctx.font = '8px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('↑↓ = Wählen  ←→ = Tab  ENTER = Benutzen  ESC/M = Schließen', canvas.width / 2, my + mh - 3);
  }
};
