// ============================================
// NORDHORN ALLSTARS — SAVE.JS (LocalStorage)
// ============================================

const SaveSystem = {
  STORAGE_KEY: 'nordhorn_allstars_save',

  hasSave() {
    return localStorage.getItem(this.STORAGE_KEY) !== null;
  },

  save(player, currentMapName, defeatedTrainers, timestamp) {
    try {
      const saveData = {
        version: 1,
        timestamp: timestamp || Date.now(),
        player: {
          x: player.x,
          y: player.y,
          gender: player.gender,
          build: player.build,
          direction: player.direction,
          level: player.level,
          exp: player.exp,
          expToNext: player.expToNext,
          stats: { ...player.stats },
          moves: player.moves.map(m => ({ ...m })),
          maxEnergy: player.maxEnergy,
          energy: player.energy,
          badges: [...player.badges],
          inventory: player.inventory.map(i => ({ ...i })),
          equipment: {
            shoes: player.equipment.shoes ? { ...player.equipment.shoes } : null,
            bracelet: player.equipment.bracelet ? { ...player.equipment.bracelet } : null
          },
          baseStats: player.baseStats ? { ...player.baseStats } : null
        },
        mapName: currentMapName,
        defeatedTrainers: defeatedTrainers || {}
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(saveData));
      return true;
    } catch (e) {
      console.error('Save failed:', e);
      return false;
    }
  },

  load() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.error('Load failed:', e);
      return null;
    }
  },

  clear() {
    localStorage.removeItem(this.STORAGE_KEY);
  },

  getSaveInfo() {
    const data = this.load();
    if (!data) return null;
    return {
      level: data.player ? data.player.level : 1,
      badges: data.player && data.player.badges ? data.player.badges.length : 0,
      map: data.mapName || 'nordhorn',
      timestamp: data.timestamp || 0
    };
  },

  // Restore defeated trainer flags from save data
  restoreTrainerFlags(maps, defeatedTrainers) {
    if (!defeatedTrainers) return;
    for (const mapName in defeatedTrainers) {
      const map = maps[mapName];
      if (!map || !map.trainers) continue;
      const defeated = defeatedTrainers[mapName];
      if (!defeated) continue;
      for (const trainer of map.trainers) {
        if (defeated[trainer.name]) {
          trainer.defeated = true;
        }
      }
    }
  },

  // Collect defeated trainer flags from all maps
  collectDefeatedTrainers(maps) {
    const result = {};
    for (const mapName in maps) {
      const map = maps[mapName];
      if (!map || !map.trainers) continue;
      const defeated = {};
      for (const trainer of map.trainers) {
        if (trainer.defeated) {
          defeated[trainer.name] = true;
        }
      }
      result[mapName] = defeated;
    }
    return result;
  }
};
