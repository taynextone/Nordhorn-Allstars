// ============================================
// NORDHORN ALLSTARS — PLAYER.JS
// ============================================

class Player {
  constructor(x, y, gender, build) {
    this.x = x;
    this.y = y;
    this.gender = gender; // 'boy' or 'girl'
    this.direction = 'down';
    this.frame = 0;
    this.moving = false;
    this.moveTimer = 0;
    this.moveSpeed = 2;
    
    // Stats basierend auf Build
    this.build = build;
    this.level = 1;
    this.exp = 0;
    this.expToNext = 20;
    
    this.stats = {
      dribbling: 5,
      shooting: 5,
      athleticism: 5,
      defense: 5,
      courtVision: 5
    };
    
    // Build-Boni
    switch(build.name) {
      case 'SHOOTER':
        this.stats.shooting = 8;
        this.stats.defense = 3;
        break;
      case 'VERTEIDIGER':
        this.stats.defense = 8;
        this.stats.shooting = 3;
        break;
      case 'ALLROUNDER':
        // Alles bleibt bei 5
        break;
    }
    
    // Moves (gelernt)
    this.moves = [
      { name: 'Layup', power: 15, energy: 0, type: 'attack', desc: 'Basis-Layup' }
    ];
    this.maxEnergy = 20;
    this.energy = this.maxEnergy;
    
    // Siegelfarben (wie Pokemon-Badges)
    this.badges = [];
    
    // Inventory & Equipment
    this.inventory = [];
    this.equipment = { shoes: null, bracelet: null };
    this.baseStats = null; // Will be set when first equipping
  }
  
  update() {
    this.moving = false;
    
    if (keys['ArrowUp'] || keys['w']) {
      this.direction = 'up';
      this.tryMove(0, -1);
    } else if (keys['ArrowDown'] || keys['s']) {
      this.direction = 'down';
      this.tryMove(0, 1);
    } else if (keys['ArrowLeft'] || keys['a']) {
      this.direction = 'left';
      this.tryMove(-1, 0);
    } else if (keys['ArrowRight'] || keys['d']) {
      this.direction = 'right';
      this.tryMove(1, 0);
    }
    
    if (this.moving) {
      this.moveTimer++;
      if (this.moveTimer >= 8) {
        this.frame = (this.frame + 1) % 2;
        this.moveTimer = 0;
      }
    }
    
    // Interaktion
    if (wasPressed('Enter') || wasPressed(' ')) {
      this.interact();
    }
  }
  
  tryMove(dx, dy) {
    const newX = this.x + dx;
    const newY = this.y + dy;

    if (currentMap && currentMap.canWalk(newX, newY)) {
      this.x = newX;
      this.y = newY;
      this.moving = true;

      // Map warp check
      if (currentMap.warps) {
        for (const warp of currentMap.warps) {
          if (this.x === warp.x && this.y === warp.y) {
            const targetMap = Maps[warp.toMap];
            if (targetMap) {
              currentMap = targetMap;
              this.x = warp.toX;
              this.y = warp.toY;
              Dialog.show([
                'Zugfahrt...',
                `Ankunft in ${targetMap.name}!`
              ]);
              return;
            }
          }
        }
      }

      // Trainer-Kampf (wie Pokemon-Trainer)
      if (currentMap.trainers) {
        const trainer = currentMap.getTrainerAt(newX, newY);
        if (trainer && !trainer.defeated) {
          Dialog.show(trainer.dialog, () => {
            trainer.defeated = true;
            Battle.start(trainer);
          });
        }
      }
    }
  }
  
  interact() {
    // Prüfe was vor dem Spieler ist
    let fx = this.x, fy = this.y;
    switch(this.direction) {
      case 'up': fy--; break;
      case 'down': fy++; break;
      case 'left': fx--; break;
      case 'right': fx++; break;
    }
    
    // NPC/Objekt an dieser Position?
    if (currentMap && currentMap.interactables) {
      for (const obj of currentMap.interactables) {
        if (obj.x === fx && obj.y === fy) {
          const dialogLines = typeof obj.getDialog === 'function' ? obj.getDialog() : obj.dialog;
          Dialog.show(dialogLines);
          return;
        }
      }
    }
  }
  
  gainExp(amount) {
    let learnedMove = null;
    this.exp += amount;
    while (this.exp >= this.expToNext) {
      this.exp -= this.expToNext;
      const newMove = this.levelUp();
      if (newMove) learnedMove = newMove;
    }
    return learnedMove;
  }
  
  levelUp() {
    this.level++;
    this.expToNext = Math.floor(this.expToNext * 1.3);
    
    // Stats steigen
    for (const stat in this.stats) {
      this.stats[stat] += Math.floor(Math.random() * 2) + 1;
    }
    
    this.maxEnergy += 3;
    this.energy = this.maxEnergy;
    
    // Neuen Move lernen?
    const newMove = MovesData.getMoveForLevel(this.level);
    if (newMove && !this.moves.find(m => m.name === newMove.name)) {
      this.moves.push(newMove);
      // Return the move info so the caller can show the proper dialog
      return newMove;
    }
    return null;
  }

  // Move-Tutor: Lernt einen bestimmten Move (wenn noch nicht gelernt)
  learnMove(moveName) {
    const move = MovesData.moves.find(m => m.name === moveName);
    if (move && !this.moves.find(m => m.name === moveName)) {
      this.moves.push({ ...move });
      return move;
    }
    return null;
  }

  // Gibt alle Moves zurück, die der Spieler noch nicht gelernt hat
  getUnlearnedMoves() {
    return MovesData.moves.filter(m => !this.moves.find(pm => pm.name === m.name));
  }
}

// ============================================
// MOVES DATABASE
// ============================================

const MovesData = {
  moves: [
    { name: 'Layup', power: 18, energy: 0, type: 'attack', level: 1, desc: 'Sicherer Layup (2 PKT)' },
    { name: 'Jump Shot', power: 22, energy: 3, type: 'attack', level: 2, description:'Standard-Wurf (2 PKT)' },
    { name: 'Block', power: 0, energy: 3, type: 'defense', level: 3, desc: 'Blockt nächsten Angriff (-70% Schaden)' },
    { name: 'Crossover', power: 10, energy: 2, type: 'debuff', level: 5, desc: 'Gegner bleibt verwirrt stehen (-1 Zug)' },
    { name: 'Steal', power: 14, energy: 4, type: 'attack', level: 7, desc: 'Stiehlt Ball und würfelt 2 PKT' },
    { name: 'No-Look Pass', power: 8, energy: 2, type: 'setup', level: 9, desc: 'Nächster Angriff +10 Schaden' },
    { name: 'Alley-Oop', power: 28, energy: 5, type: 'attack', level: 11, desc: 'Spektakulärer Wurf (3 PKT)' },
    { name: 'Three Pointer', power: 32, energy: 6, type: 'attack', level: 13, desc: 'Drei-Punkte-Wurf (3 PKT)' },
    { name: 'Slam Dunk', power: 38, energy: 7, type: 'attack', level: 15, desc: 'Starker Dunk (2 PKT, aber hoher Schaden)' },
    { name: 'Ankle Breaker', power: 16, energy: 6, type: 'debuff', level: 18, desc: 'Gegler kann nächsten Zug nicht ziehen' }
  ],

  getMoveForLevel(level) {
    const move = this.moves.find(m => m.level === level);
    return move ? { ...move } : null;
  }
};
