// ============================================
// NORDHORN ALLSTARS — BATTLE.JS
// ============================================

const Battle = {
  active: false,
  player: null,
  opponent: null,
  playerHP: 100,
  opponentHP: 100,
  playerEnergy: 20,
  opponentEnergy: 20,
  playerScore: 0,
  opponentScore: 0,
  turn: 'player',
  state: 'select',
  selectedMove: 0,
  animFrame: 0,
  resultText: '',
  timer: 0,
  targetScore: 21,
  activeMove: null,
  activeSide: null,
  lastResult: null,
  playerBlocking: false,
  opponentBlocking: false,
  playerStunned: false,
  opponentStunned: false,
  playerBonus: 0,
  opponentBonus: 0,
  
  start(opponent) {
    this.active = true;
    this.opponent = opponent;
    this.playerHP = 100;
    this.opponentHP = 100;
    this.playerEnergy = player.maxEnergy;
    this.opponentEnergy = 20;
    this.playerScore = 0;
    this.opponentScore = 0;
    this.turn = 'player';
    this.state = 'select';
    this.selectedMove = 0;
    this.animFrame = 0;
    this.resultText = '';
    this.timer = 0;
    this.activeMove = null;
    this.activeSide = null;
    this.lastResult = null;
    this.playerBlocking = false;
    this.opponentBlocking = false;
    this.playerStunned = false;
    this.opponentStunned = false;
    this.playerBonus = 0;
    this.opponentBonus = 0;
    gameState = GameState.BATTLE;
  },
  
  update() {
    switch(this.state) {
      case 'select':
        this.updateSelect();
        break;
      case 'action':
        this.updateAction();
        break;
      case 'anim':
        this.updateAnim();
        break;
      case 'result':
        this.updateResult();
        break;
    }
  },
  
  updateSelect() {
    if (this.turn === 'player') {
      if (wasPressed('ArrowUp')) this.selectedMove = Math.max(0, this.selectedMove - 1);
      if (wasPressed('ArrowDown')) this.selectedMove = Math.min(player.moves.length - 1, this.selectedMove + 1);
      if (wasPressed('Enter') || wasPressed(' ')) {
        const move = player.moves[this.selectedMove];
        if (move.energy > this.playerEnergy) {
          Dialog.show('Nicht genug Energy!');
          return;
        }
        this.executeMove('player', move);
      }
    } else {
      this.timer++;
      if (this.timer > 60) {
        const availableMoves = this.getOpponentMoves();
        const move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        this.executeMove('opponent', move);
      }
    }
  },
  
  executeMove(side, move) {
    this.activeMove = move;
    this.activeSide = side;
    
    if (side === 'player') {
      this.playerEnergy -= move.energy;
    } else {
      this.opponentEnergy -= move.energy;
    }
    
    this.state = 'anim';
    this.animFrame = 0;
  },
  
  updateAnim() {
    this.animFrame++;
    
    if (this.animFrame === 30) {
      const move = this.activeMove;
      const side = this.activeSide;
      
      let hit = false;
      let damage = 0;
      let points = 0;
      
      switch(move.type) {
        case 'attack':
          const accuracy = side === 'player' ? 
            0.5 + (player.stats.shooting * 0.03) : 0.6;
          hit = Math.random() < accuracy;
          
          if (hit) {
            damage = move.power + (side === 'player' ? this.playerBonus : this.opponentBonus);
            points = move.name === 'Three Pointer' ? 3 : 2;
            
            if (side === 'player') {
              this.opponentHP -= damage;
              this.playerScore += points;
              this.playerBonus = 0;
            } else {
              if (this.playerBlocking) { damage = Math.floor(damage * 0.3); this.playerBlocking = false; }
              this.playerHP -= damage;
              this.opponentScore += points;
              this.opponentBonus = 0;
            }
          }
          break;
          
        case 'defense':
          if (side === 'player') this.playerBlocking = true;
          else this.opponentBlocking = true;
          break;
          
        case 'debuff':
          if (side === 'player') this.opponentStunned = true;
          else this.playerStunned = true;
          break;
          
        case 'setup':
          if (side === 'player') this.playerBonus = 10;
          else this.opponentBonus = 10;
          break;
          
        case 'finisher':
          const hpPct = side === 'player' ? this.playerHP / 100 : this.opponentHP / 100;
          if (hpPct < 0.3) {
            damage = move.power * 1.5;
            points = 3;
          } else {
            hit = Math.random() < 0.5;
            damage = hit ? move.power : 0;
            points = hit ? 3 : 0;
          }
          if (damage > 0) {
            if (side === 'player') {
              this.opponentHP -= damage;
              this.playerScore += points;
            } else {
              this.playerHP -= damage;
              this.opponentScore += points;
            }
          }
          hit = damage > 0;
          break;
      }
      
      this.lastResult = { hit, damage, points, move: move.name, side };
    }
    
    if (this.animFrame > 60) {
      if (this.playerScore >= this.targetScore || this.opponentScore >= this.targetScore ||
          this.playerHP <= 0 || this.opponentHP <= 0) {
        this.state = 'result';
        this.timer = 0;
        if (this.playerScore >= this.targetScore || this.opponentHP <= 0) {
          this.resultText = 'GEWONNEN!';
        } else {
          this.resultText = 'VERLOREN...';
        }
      } else {
        if (this.activeSide === 'player') {
          if (this.opponentStunned) { this.opponentStunned = false; }
          else { this.turn = 'opponent'; }
        } else {
          if (this.playerStunned) { this.playerStunned = false; }
          else { this.turn = 'player'; }
        }
        this.state = 'select';
        this.timer = 0;
      }
    }
  },
  
  updateResult() {
    this.timer++;
    if (this.timer > 90 && (wasPressed('Enter') || wasPressed(' '))) {
      this.active = false;
      gameState = GameState.OVERWORLD;
      
      if (this.resultText === 'GEWONNEN!') {
        const expGain = this.opponent.level * 10;
        player.gainExp(expGain);
        Dialog.show([
          `${this.opponent.name} wurde besiegt!`,
          `+${expGain} EXP!`
        ]);
        gameState = GameState.DIALOG;
      } else {
        Dialog.show('Du hast verloren... Geh dich erholen und versuche es nochmal!');
        gameState = GameState.DIALOG;
      }
    }
  },
  
  getOpponentMoves() {
    const moves = [{ name: 'Layup', power: 15, energy: 0, type: 'attack' }];
    if (this.opponent && this.opponent.level >= 3) moves.push({ name: 'Jump Shot', power: 20, energy: 3, type: 'attack' });
    if (this.opponent && this.opponent.level >= 5) moves.push({ name: 'Block', power: 0, energy: 3, type: 'defense' });
    if (this.opponent && this.opponent.level >= 7) moves.push({ name: 'Steal', power: 12, energy: 4, type: 'attack' });
    if (this.opponent && this.opponent.level >= 10) moves.push({ name: 'Three Pointer', power: 30, energy: 6, type: 'attack' });
    return moves;
  },
  
  render() {
    ctx.fillStyle = PALETTE.light;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = PALETTE.lightest;
    ctx.fillRect(0, canvas.height - 120, canvas.width, 2);
    ctx.fillRect(canvas.width / 2 - 1, 0, 2, canvas.height);
    
    ctx.strokeStyle = PALETTE.lightest;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height - 120, 50, Math.PI, 0);
    ctx.stroke();
    
    const playerX = 60;
    const playerY = canvas.height - 180;
    
    ctx.fillStyle = PALETTE.darkest;
    ctx.fillRect(playerX, playerY, 40, 60);
    ctx.fillStyle = PALETTE.dark;
    ctx.fillRect(playerX + 8, playerY + 5, 24, 20);
    ctx.fillRect(playerX + 5, playerY + 25, 30, 25);
    ctx.fillRect(playerX + 5, playerY + 50, 12, 10);
    ctx.fillRect(playerX + 23, playerY + 50, 12, 10);
    
    const oppX = canvas.width - 100;
    const oppY = 60;
    
    ctx.fillStyle = PALETTE.dark;
    ctx.fillRect(oppX, oppY, 40, 60);
    ctx.fillStyle = PALETTE.darkest;
    ctx.fillRect(oppX + 8, oppY + 5, 24, 20);
    ctx.fillRect(oppX + 5, oppY + 25, 30, 25);
    ctx.fillRect(oppX + 5, oppY + 50, 12, 10);
    ctx.fillRect(oppX + 23, oppY + 50, 12, 10);
    
    ctx.fillStyle = PALETTE.darkest;
    ctx.fillRect(8, 8, 180, 60);
    ctx.strokeStyle = PALETTE.lightest;
    ctx.lineWidth = 1;
    ctx.strokeRect(8, 8, 180, 60);
    
    ctx.fillStyle = PALETTE.lightest;
    ctx.font = 'bold 11px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('DU', 16, 24);
    
    ctx.fillStyle = PALETTE.dark;
    ctx.fillRect(16, 30, 120, 8);
    ctx.fillStyle = this.playerHP > 30 ? PALETTE.lightest : '#ff3333';
    ctx.fillRect(16, 30, Math.max(0, (this.playerHP / 100) * 120), 8);
    ctx.font = '9px "Courier New", monospace';
    ctx.fillStyle = PALETTE.lightest;
    ctx.fillText('HP', 140, 38);
    
    ctx.fillStyle = PALETTE.dark;
    ctx.fillRect(16, 44, 120, 6);
    ctx.fillStyle = PALETTE.light;
    ctx.fillRect(16, 44, Math.max(0, (this.playerEnergy / player.maxEnergy) * 120), 6);
    ctx.fillText('EN', 140, 50);
    
    ctx.font = 'bold 14px "Courier New", monospace';
    ctx.fillText(this.playerScore + ' PKT', 16, 64);
    
    ctx.fillStyle = PALETTE.darkest;
    ctx.fillRect(canvas.width - 188, 8, 180, 50);
    ctx.strokeStyle = PALETTE.lightest;
    ctx.strokeRect(canvas.width - 188, 8, 180, 50);
    
    ctx.fillStyle = PALETTE.lightest;
    ctx.font = 'bold 11px "Courier New", monospace';
    ctx.textAlign = 'right';
    if (this.opponent) ctx.fillText(this.opponent.name.toUpperCase(), canvas.width - 16, 24);
    
    ctx.fillStyle = PALETTE.dark;
    ctx.fillRect(canvas.width - 170, 30, 120, 8);
    ctx.fillStyle = this.opponentHP > 30 ? PALETTE.lightest : '#ff3333';
    ctx.fillRect(canvas.width - 170, 30, Math.max(0, (this.opponentHP / 100) * 120), 8);
    
    ctx.font = 'bold 14px "Courier New", monospace';
    ctx.fillText(this.opponentScore + ' PKT', canvas.width - 16, 50);
    
    ctx.textAlign = 'center';
    ctx.font = '10px "Courier New", monospace';
    ctx.fillText('Ziel: ' + this.targetScore + ' Pkt', canvas.width / 2, 16);
    
    if (this.state === 'select' && this.turn === 'player') {
      const menuX = 8;
      const menuY = canvas.height - 110;
      const menuW = canvas.width - 16;
      const menuH = 100;
      
      ctx.fillStyle = PALETTE.darkest;
      ctx.fillRect(menuX, menuY, menuW, menuH);
      ctx.strokeStyle = PALETTE.lightest;
      ctx.lineWidth = 2;
      ctx.strokeRect(menuX + 2, menuY + 2, menuW - 4, menuH - 4);
      
      ctx.fillStyle = PALETTE.lightest;
      ctx.font = 'bold 11px "Courier New", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('DEIN ZUG:', menuX + 12, menuY + 18);
      
      for (let i = 0; i < player.moves.length; i++) {
        const move = player.moves[i];
        const y = menuY + 30 + i * 18;
        
        if (i === this.selectedMove) {
          ctx.fillStyle = PALETTE.light;
          ctx.fillRect(menuX + 8, y - 10, menuW - 16, 16);
          ctx.fillStyle = PALETTE.darkest;
          ctx.fillText('> ' + move.name, menuX + 14, y);
          ctx.textAlign = 'right';
          ctx.fillText('EN: ' + move.energy, menuX + menuW - 14, y);
        } else {
          ctx.fillStyle = move.energy > this.playerEnergy ? PALETTE.dark : PALETTE.lightest;
          ctx.textAlign = 'left';
          ctx.fillText('  ' + move.name, menuX + 14, y);
          ctx.textAlign = 'right';
          ctx.fillText('EN: ' + move.energy, menuX + menuW - 14, y);
        }
        ctx.textAlign = 'left';
      }
    }
    
    if (this.state === 'anim' && this.animFrame > 20 && this.animFrame < 50) {
      ctx.fillStyle = PALETTE.lightest;
      ctx.font = 'bold 16px "Courier New", monospace';
      ctx.textAlign = 'center';
      
      if (this.lastResult) {
        if (this.lastResult.hit) {
          ctx.fillText(this.lastResult.move + '! ' + this.lastResult.points + ' PKT!', canvas.width / 2, canvas.height / 2 - 20);
        } else {
          ctx.fillText('VERFEHLT!', canvas.width / 2, canvas.height / 2 - 20);
        }
      }
    }
    
    if (this.state === 'result') {
      ctx.fillStyle = PALETTE.darkest;
      ctx.fillRect(canvas.width / 2 - 120, canvas.height / 2 - 40, 240, 80);
      ctx.strokeStyle = PALETTE.lightest;
      ctx.lineWidth = 3;
      ctx.strokeRect(canvas.width / 2 - 120, canvas.height / 2 - 40, 240, 80);
      
      ctx.fillStyle = PALETTE.lightest;
      ctx.font = 'bold 24px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(this.resultText, canvas.width / 2, canvas.height / 2);
      
      ctx.font = '11px "Courier New", monospace';
      if (this.timer > 60) ctx.fillText('Drücke ENTER', canvas.width / 2, canvas.height / 2 + 24);
    }
  }
};
