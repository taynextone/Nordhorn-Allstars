// ============================================
// NORDHORN ALLSTARS — BATTLE.JS
// Verbessertes Kampfsystem mit Sprites, Animationen, EXP-Balken
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
  
  // Animation state
  playerShake: 0,
  opponentShake: 0,
  ballAnim: null, // { x, y, dx, dy, frame }
  flashTimer: 0,
  flashColor: null,
  
  // Battle intro state
  introTimer: 0,
  introComplete: false,
  
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
    this.state = 'intro';
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
    this.playerShake = 0;
    this.opponentShake = 0;
    this.ballAnim = null;
    this.flashTimer = 0;
    this.flashColor = null;
    this.introTimer = 0;
    this.introComplete = false;
    gameState = GameState.BATTLE;
  },
  
  update() {
    // Decrease shake effects
    if (this.playerShake > 0) this.playerShake -= 0.5;
    if (this.opponentShake > 0) this.opponentShake -= 0.5;
    if (this.flashTimer > 0) this.flashTimer--;
    
    switch(this.state) {
      case 'intro':
        this.updateIntro();
        break;
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
  
  updateIntro() {
    this.introTimer++;
    if (this.introTimer > 90 || wasPressed('Enter') || wasPressed(' ')) {
      this.state = 'select';
      this.introComplete = true;
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
      if (this.timer > 45) {
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
    
    // Launch ball animation for attack/finisher moves
    if (move.type === 'attack' || move.type === 'finisher') {
      const startX = side === 'player' ? 100 : canvas.width - 100;
      const startY = side === 'player' ? canvas.height - 200 : 100;
      const endX = side === 'player' ? canvas.width - 100 : 100;
      const endY = side === 'player' ? 100 : canvas.height - 200;
      this.ballAnim = {
        sx: startX, sy: startY,
        ex: endX, ey: endY,
        frame: 0, maxFrame: 30
      };
    }
  },
  
  updateAnim() {
    this.animFrame++;
    
    // Update ball animation
    if (this.ballAnim) {
      this.ballAnim.frame++;
      if (this.ballAnim.frame >= this.ballAnim.maxFrame) {
        this.ballAnim = null;
      }
    }
    
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
              this.opponentShake = 8;
              this.flashTimer = 6;
              this.flashColor = PALETTE.lightest;
            } else {
              if (this.playerBlocking) { damage = Math.floor(damage * 0.3); this.playerBlocking = false; }
              this.playerHP -= damage;
              this.opponentScore += points;
              this.opponentBonus = 0;
              this.playerShake = 8;
              this.flashTimer = 6;
              this.flashColor = PALETTE.darkest;
            }
          }
          break;
          
        case 'defense':
          if (side === 'player') {
            this.playerBlocking = true;
            this.flashTimer = 4;
            this.flashColor = PALETTE.dark;
          } else {
            this.opponentBlocking = true;
          }
          break;
          
        case 'debuff':
          if (side === 'player') {
            this.opponentStunned = true;
            this.opponentShake = 4;
          } else {
            this.playerStunned = true;
            this.playerShake = 4;
          }
          break;
          
        case 'setup':
          if (side === 'player') this.playerBonus = 10;
          else this.opponentBonus = 10;
          this.flashTimer = 4;
          this.flashColor = PALETTE.light;
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
              this.opponentShake = 12;
            } else {
              this.playerHP -= damage;
              this.opponentScore += points;
              this.playerShake = 12;
            }
          }
          hit = damage > 0;
          this.flashTimer = 8;
          this.flashColor = PALETTE.lightest;
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
      
      if (this.resultText === 'GEWONNEN!') {
        // Mark trainer as defeated
        if (this.opponent && currentMap && currentMap.trainers) {
          const trainer = currentMap.trainers.find(t => t.name === this.opponent.name);
          if (trainer) trainer.defeated = true;
        }
        
        const expGain = this.opponent.level * 10;
        const prevLevel = player.level;
        const newMove = player.gainExp(expGain);
        
        const dialogLines = [
          `${this.opponent.name} wurde besiegt!`,
          `+${expGain} EXP!`
        ];
        
        if (player.level > prevLevel) {
          dialogLines.push(`LEVEL UP! Du bist jetzt LV ${player.level}!`);
        }
        if (newMove) {
          dialogLines.push(`Neuer Move: ${newMove.name}!`);
        }
        
        if (this.opponent && this.opponent.victoryDialog) {
          dialogLines.push(...this.opponent.victoryDialog);
        }
        
        // Set fromState so dialog returns to OVERWORLD (not back to BATTLE)
        Dialog.fromState = GameState.OVERWORLD;
        Dialog.show(dialogLines);
        gameState = GameState.DIALOG;
      } else {
        // Game Over: return to home
        // Set fromState so dialog returns to OVERWORLD
        Dialog.fromState = GameState.OVERWORLD;
        Dialog.show([
          'Du hast verloren...',
          'Geh nach Hause und erhole dich!',
          'Versuche es nochmal!'
        ]);
        // Reset player position to home (door area)
        player.x = 6;
        player.y = 9;
        player.energy = player.maxEnergy;
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
  
  // ============================================
  // RENDERING
  // ============================================
  
  render() {
    // Court background
    this.renderCourt();
    
    // Intro overlay
    if (this.state === 'intro') {
      this.renderIntro();
      return;
    }
    
    // Sprites
    this.renderSprites();
    
    // Ball animation
    if (this.ballAnim) {
      this.renderBallAnim();
    }
    
    // Flash effect
    if (this.flashTimer > 0 && this.flashColor) {
      ctx.globalAlpha = this.flashTimer * 0.08;
      ctx.fillStyle = this.flashColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1.0;
    }
    
    // UI Panels
    this.renderPlayerPanel();
    this.renderOpponentPanel();
    
    // Score display
    this.renderScoreDisplay();
    
    // Move text overlay
    if (this.state === 'anim' && this.animFrame > 20 && this.animFrame < 50) {
      this.renderMoveText();
    }
    
    // Move selection
    if (this.state === 'select' && this.turn === 'player') {
      this.renderMoveSelect();
    }
    
    // Opponent thinking
    if (this.state === 'select' && this.turn === 'opponent') {
      this.renderOpponentThinking();
    }
    
    // Result overlay
    if (this.state === 'result') {
      this.renderResult();
    }
  },
  
  renderCourt() {
    // Court floor
    ctx.fillStyle = '#8bac0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Court lines
    ctx.fillStyle = '#9bbc0f';
    ctx.fillRect(0, canvas.height - 130, canvas.width, 2);
    ctx.fillRect(canvas.width / 2 - 1, 0, 2, canvas.height);
    
    // Center circle
    ctx.strokeStyle = '#9bbc0f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height - 130, 50, Math.PI, 0);
    ctx.stroke();
    
    // Free throw circles
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height - 130, 25, 0, Math.PI * 2);
    ctx.stroke();
    
    // Three-point arcs
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#306230';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height, 90, Math.PI * 1.2, Math.PI * 1.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 0, 90, Math.PI * 0.2, Math.PI * 0.8);
    ctx.stroke();
    
    // Court floor pattern (subtle wood lines)
    ctx.fillStyle = 'rgba(48, 98, 48, 0.15)';
    for (let y = 0; y < canvas.height; y += 20) {
      ctx.fillRect(0, y, canvas.width, 1);
    }
  },
  
  renderSprites() {
    // Player sprite (left, bottom)
    const pShakeX = this.playerShake > 0 ? Math.sin(this.playerShake * 3) * 3 : 0;
    const playerX = 60 + pShakeX;
    const playerY = canvas.height - 200;
    
    // Player shadow
    ctx.fillStyle = 'rgba(15, 56, 15, 0.3)';
    ctx.beginPath();
    ctx.ellipse(playerX + 20, playerY + 70, 20, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Player body (detailed sprite)
    const playerGender = player ? player.gender : 'boy';
    this.renderBattleCharacter(playerX, playerY, playerGender, 'player');
    
    // Opponent sprite (right, top)
    const oShakeX = this.opponentShake > 0 ? Math.sin(this.opponentShake * 3) * 3 : 0;
    const oppX = canvas.width - 120 + oShakeX;
    const oppY = 40;
    
    // Opponent shadow
    ctx.fillStyle = 'rgba(15, 56, 15, 0.3)';
    ctx.beginPath();
    ctx.ellipse(oppX + 20, oppY + 70, 20, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Opponent body
    const oppSprite = this.opponent ? this.opponent.sprite : 'trainerTim';
    this.renderBattleOpponent(oppX, oppY, oppSprite);
    
    // Blocking indicator
    if (this.playerBlocking) {
      ctx.fillStyle = PALETTE.lightest;
      ctx.font = 'bold 10px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('BLOCK!', playerX + 20, playerY - 4);
    }
    if (this.opponentBlocking) {
      ctx.fillStyle = PALETTE.lightest;
      ctx.font = 'bold 10px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('BLOCK!', oppX + 20, oppY - 4);
    }
    
    // Stunned indicator
    if (this.playerStunned) {
      this.renderStunStars(playerX + 20, playerY - 10);
    }
    if (this.opponentStunned) {
      this.renderStunStars(oppX + 20, oppY - 10);
    }
  },
  
  renderBattleCharacter(x, y, gender, side) {
    // Head
    ctx.fillStyle = PALETTE.lightest;
    ctx.fillRect(x + 10, y, 24, 18);
    
    // Hair
    ctx.fillStyle = PALETTE.darkest;
    ctx.fillRect(x + 8, y - 2, 28, 8);
    if (gender === 'girl') {
      // Longer hair
      ctx.fillRect(x + 6, y - 2, 4, 24);
      ctx.fillRect(x + 34, y - 2, 4, 24);
    }
    
    // Eyes
    ctx.fillStyle = PALETTE.darkest;
    ctx.fillRect(x + 14, y + 8, 4, 4);
    ctx.fillRect(x + 26, y + 8, 4, 4);
    
    // Mouth
    ctx.fillRect(x + 18, y + 14, 8, 2);
    
    // Jersey
    ctx.fillStyle = PALETTE.dark;
    ctx.fillRect(x + 6, y + 20, 32, 24);
    
    // Jersey details (number)
    ctx.fillStyle = PALETTE.lightest;
    ctx.font = 'bold 10px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('23', x + 22, y + 36);
    
    // Arms
    ctx.fillStyle = PALETTE.lightest;
    ctx.fillRect(x + 2, y + 22, 6, 16);
    ctx.fillRect(x + 36, y + 22, 6, 16);
    
    // Shorts
    ctx.fillStyle = PALETTE.light;
    ctx.fillRect(x + 8, y + 44, 28, 12);
    
    // Legs
    ctx.fillStyle = PALETTE.lightest;
    ctx.fillRect(x + 10, y + 56, 10, 14);
    ctx.fillRect(x + 24, y + 56, 10, 14);
    
    // Shoes
    ctx.fillStyle = PALETTE.darkest;
    ctx.fillRect(x + 8, y + 68, 14, 4);
    ctx.fillRect(x + 22, y + 68, 14, 4);
  },
  
  renderBattleOpponent(x, y, spriteName) {
    // Head
    ctx.fillStyle = PALETTE.dark;
    ctx.fillRect(x + 10, y, 24, 18);
    
    // Hair/Hat
    ctx.fillStyle = PALETTE.darkest;
    ctx.fillRect(x + 8, y - 2, 28, 8);
    
    // Eyes (determined)
    ctx.fillStyle = PALETTE.darkest;
    ctx.fillRect(x + 14, y + 8, 4, 4);
    ctx.fillRect(x + 26, y + 8, 4, 4);
    
    // Smirk
    ctx.fillRect(x + 18, y + 14, 8, 2);
    
    // Jersey (opponent color)
    ctx.fillStyle = PALETTE.darkest;
    ctx.fillRect(x + 6, y + 20, 32, 24);
    
    // Jersey number
    ctx.fillStyle = PALETTE.light;
    ctx.font = 'bold 10px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('99', x + 22, y + 36);
    
    // Arms
    ctx.fillStyle = PALETTE.dark;
    ctx.fillRect(x + 2, y + 22, 6, 16);
    ctx.fillRect(x + 36, y + 22, 6, 16);
    
    // Shorts
    ctx.fillStyle = '#306230';
    ctx.fillRect(x + 8, y + 44, 28, 12);
    
    // Legs
    ctx.fillStyle = PALETTE.dark;
    ctx.fillRect(x + 10, y + 56, 10, 14);
    ctx.fillRect(x + 24, y + 56, 10, 14);
    
    // Shoes
    ctx.fillStyle = PALETTE.darkest;
    ctx.fillRect(x + 8, y + 68, 14, 4);
    ctx.fillRect(x + 22, y + 68, 14, 4);
  },
  
  renderStunStars(cx, cy) {
    const t = Date.now() / 200;
    ctx.fillStyle = PALETTE.lightest;
    ctx.font = '10px "Courier New", monospace';
    ctx.textAlign = 'center';
    for (let i = 0; i < 3; i++) {
      const angle = t + i * (Math.PI * 2 / 3);
      const sx = cx + Math.cos(angle) * 14;
      const sy = cy + Math.sin(angle) * 6;
      ctx.fillText('★', sx, sy);
    }
  },
  
  renderBallAnim() {
    if (!this.ballAnim) return;
    const progress = this.ballAnim.frame / this.ballAnim.maxFrame;
    const bx = this.ballAnim.sx + (this.ballAnim.ex - this.ballAnim.sx) * progress;
    const by = this.ballAnim.sy + (this.ballAnim.ey - this.ballAnim.sy) * progress 
               - Math.sin(progress * Math.PI) * 60; // Arc
    
    // Draw basketball sprite
    const ballSprite = Sprites.basketball;
    if (ballSprite) {
      drawSprite(ballSprite, bx - 8, by - 8, 1);
    } else {
      // Fallback: circle
      ctx.fillStyle = '#306230';
      ctx.beginPath();
      ctx.arc(bx, by, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = PALETTE.lightest;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  },
  
  renderPlayerPanel() {
    // Panel background
    const px = 8, py = 8, pw = 195, ph = 72;
    ctx.fillStyle = PALETTE.darkest;
    ctx.fillRect(px, py, pw, ph);
    ctx.strokeStyle = PALETTE.lightest;
    ctx.lineWidth = 1;
    ctx.strokeRect(px, py, pw, ph);
    
    // Name
    ctx.fillStyle = PALETTE.lightest;
    ctx.font = 'bold 11px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('DU', px + 8, py + 16);
    
    // Level
    ctx.fillStyle = PALETTE.light;
    ctx.font = '9px "Courier New", monospace';
    ctx.fillText('LV' + (player ? player.level : 1), px + 50, py + 16);
    
    // HP Bar
    ctx.fillStyle = PALETTE.dark;
    ctx.fillRect(px + 8, py + 24, 130, 8);
    const hpPct = Math.max(0, this.playerHP / 100);
    ctx.fillStyle = hpPct > 0.3 ? PALETTE.lightest : '#ff3333';
    ctx.fillRect(px + 8, py + 24, Math.max(0, hpPct * 130), 8);
    ctx.fillStyle = PALETTE.lightest;
    ctx.font = '8px "Courier New", monospace';
    ctx.fillText('HP', px + 142, py + 31);
    
    // Energy Bar
    ctx.fillStyle = PALETTE.dark;
    ctx.fillRect(px + 8, py + 36, 130, 6);
    const enPct = player ? Math.max(0, this.playerEnergy / player.maxEnergy) : 0;
    ctx.fillStyle = '#9bbc0f';
    ctx.fillRect(px + 8, py + 36, Math.max(0, enPct * 130), 6);
    ctx.fillStyle = PALETTE.lightest;
    ctx.font = '8px "Courier New", monospace';
    ctx.fillText('EN', px + 142, py + 42);
    
    // Score
    ctx.font = 'bold 14px "Courier New", monospace';
    ctx.fillStyle = PALETTE.lightest;
    ctx.fillText(this.playerScore + ' PKT', px + 8, py + 60);
    
    // EXP Bar (new!)
    if (player) {
      const expPct = player.exp / player.expToNext;
      ctx.fillStyle = PALETTE.dark;
      ctx.fillRect(px + 85, py + 52, 80, 6);
      ctx.fillStyle = '#8bac0f';
      ctx.fillRect(px + 85, py + 52, Math.max(0, expPct * 80), 6);
      ctx.fillStyle = PALETTE.lightest;
      ctx.font = '7px "Courier New", monospace';
      ctx.fillText('EXP', px + 85, py + 66);
    }
  },
  
  renderOpponentPanel() {
    const ow = 195, oh = 58;
    const ox = canvas.width - ow - 8, oy = 8;
    
    ctx.fillStyle = PALETTE.darkest;
    ctx.fillRect(ox, oy, ow, oh);
    ctx.strokeStyle = PALETTE.lightest;
    ctx.lineWidth = 1;
    ctx.strokeRect(ox, oy, ow, oh);
    
    // Name
    ctx.fillStyle = PALETTE.lightest;
    ctx.font = 'bold 11px "Courier New", monospace';
    ctx.textAlign = 'right';
    if (this.opponent) ctx.fillText(this.opponent.name.toUpperCase(), ox + ow - 8, oy + 16);
    
    // Level
    ctx.fillStyle = PALETTE.light;
    ctx.font = '9px "Courier New", monospace';
    if (this.opponent) ctx.fillText('LV' + this.opponent.level, ox + ow - 50, oy + 16);
    
    // HP Bar
    ctx.fillStyle = PALETTE.dark;
    ctx.fillRect(ox + 8, oy + 24, 130, 8);
    const hpPct = Math.max(0, this.opponentHP / 100);
    ctx.fillStyle = hpPct > 0.3 ? PALETTE.lightest : '#ff3333';
    ctx.fillRect(ox + 8, oy + 24, Math.max(0, hpPct * 130), 8);
    
    // Score
    ctx.font = 'bold 14px "Courier New", monospace';
    ctx.fillText(this.opponentScore + ' PKT', ox + ow - 8, oy + 48);
    
    ctx.textAlign = 'left';
  },
  
  renderScoreDisplay() {
    ctx.fillStyle = PALETTE.darkest;
    ctx.fillRect(canvas.width / 2 - 50, 0, 100, 20);
    ctx.strokeStyle = PALETTE.lightest;
    ctx.lineWidth = 1;
    ctx.strokeRect(canvas.width / 2 - 50, 0, 100, 20);
    
    ctx.fillStyle = PALETTE.lightest;
    ctx.font = 'bold 10px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ZIEL: ' + this.targetScore + ' PKT', canvas.width / 2, 14);
  },
  
  renderMoveText() {
    if (!this.lastResult) return;
    
    // Move name banner
    ctx.fillStyle = PALETTE.darkest;
    ctx.fillRect(canvas.width / 2 - 140, canvas.height / 2 - 40, 280, 50);
    ctx.strokeStyle = PALETTE.lightest;
    ctx.lineWidth = 2;
    ctx.strokeRect(canvas.width / 2 - 140, canvas.height / 2 - 40, 280, 50);
    
    ctx.fillStyle = PALETTE.lightest;
    ctx.font = 'bold 14px "Courier New", monospace';
    ctx.textAlign = 'center';
    
    if (this.lastResult.hit) {
      ctx.fillText(this.lastResult.move + '!', canvas.width / 2, canvas.height / 2 - 16);
      ctx.fillStyle = PALETTE.light;
      ctx.font = '12px "Courier New", monospace';
      ctx.fillText('+' + this.lastResult.points + ' PKT!', canvas.width / 2, canvas.height / 2 + 2);
      if (this.lastResult.damage > 0) {
        ctx.fillText('-' + this.lastResult.damage + ' HP', canvas.width / 2, canvas.height / 2 - 2);
      }
    } else {
      ctx.fillText('VERFEHLT!', canvas.width / 2, canvas.height / 2 - 16);
      ctx.fillStyle = PALETTE.dark;
      ctx.font = '11px "Courier New", monospace';
      ctx.fillText(this.lastResult.move + ' ging daneben', canvas.width / 2, canvas.height / 2 + 2);
    }
  },
  
  renderMoveSelect() {
    const menuX = 8;
    const menuY = canvas.height - 115;
    const menuW = canvas.width - 16;
    const menuH = 108;
    
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
      const isSelected = i === this.selectedMove;
      const tooExpensive = move.energy > this.playerEnergy;
      
      if (isSelected) {
        ctx.fillStyle = PALETTE.light;
        ctx.fillRect(menuX + 8, y - 10, menuW - 16, 16);
        ctx.fillStyle = PALETTE.darkest;
      } else {
        ctx.fillStyle = tooExpensive ? PALETTE.dark : PALETTE.lightest;
      }
      
      ctx.textAlign = 'left';
      ctx.fillText((isSelected ? '► ' : '  ') + move.name, menuX + 14, y);
      
      // Move type badge
      const typeColors = {
        'attack': 'ATK',
        'defense': 'DEF',
        'debuff': 'DBF',
        'setup': 'SET',
        'finisher': 'FIN'
      };
      ctx.textAlign = 'center';
      ctx.font = '8px "Courier New", monospace';
      ctx.fillText(typeColors[move.type] || '???', menuX + 200, y);
      
      // Energy cost
      ctx.textAlign = 'right';
      ctx.font = '10px "Courier New", monospace';
      ctx.fillText('EN:' + move.energy, menuX + menuW - 14, y);
      
      ctx.textAlign = 'left';
      ctx.font = '10px "Courier New", monospace';
    }
  },
  
  renderOpponentThinking() {
    const cx = canvas.width / 2;
    const cy = canvas.height - 60;
    
    ctx.fillStyle = PALETTE.darkest;
    ctx.fillRect(cx - 60, cy - 14, 120, 28);
    ctx.strokeStyle = PALETTE.light;
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - 60, cy - 14, 120, 28);
    
    ctx.fillStyle = PALETTE.lightest;
    ctx.font = '11px "Courier New", monospace';
    ctx.textAlign = 'center';
    const dots = '.'.repeat(Math.floor(this.timer / 15) % 4);
    ctx.fillText('Denkt nach' + dots, cx, cy + 4);
  },
  
  renderIntro() {
    // Dark overlay
    ctx.fillStyle = PALETTE.darkest;
    ctx.globalAlpha = Math.min(1, this.introTimer / 30);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1.0;
    
    // VS screen
    if (this.introTimer > 15) {
      ctx.fillStyle = PALETTE.lightest;
      ctx.font = 'bold 32px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('VS', canvas.width / 2, canvas.height / 2);
      
      if (this.introTimer > 30) {
        ctx.font = 'bold 16px "Courier New", monospace';
        ctx.fillText('DU', canvas.width / 2 - 80, canvas.height / 2 - 40);
        if (this.opponent) {
          ctx.fillText(this.opponent.name.toUpperCase(), canvas.width / 2 + 80, canvas.height / 2 - 40);
        }
      }
      
      if (this.introTimer > 60) {
        ctx.font = '11px "Courier New", monospace';
        ctx.fillStyle = PALETTE.light;
        ctx.fillText('Drücke ENTER', canvas.width / 2, canvas.height / 2 + 50);
      }
    }
  },
  
  renderResult() {
    // Darken background
    ctx.fillStyle = PALETTE.darkest;
    ctx.globalAlpha = 0.7;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1.0;
    
    // Result box
    const bw = 260, bh = 90;
    const bx = canvas.width / 2 - bw / 2;
    const by = canvas.height / 2 - bh / 2;
    
    ctx.fillStyle = PALETTE.darkest;
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = this.resultText === 'GEWONNEN!' ? PALETTE.lightest : '#ff3333';
    ctx.lineWidth = 3;
    ctx.strokeRect(bx, by, bw, bh);
    
    // Result text with bounce effect
    ctx.fillStyle = this.resultText === 'GEWONNEN!' ? PALETTE.lightest : '#ff3333';
    ctx.font = 'bold 24px "Courier New", monospace';
    ctx.textAlign = 'center';
    const bounce = this.timer > 30 ? Math.sin(this.timer * 0.1) * 2 : 0;
    ctx.fillText(this.resultText, canvas.width / 2, canvas.height / 2 - 8 + bounce);
    
    // Score summary
    ctx.fillStyle = PALETTE.lightest;
    ctx.font = '12px "Courier New", monospace';
    ctx.fillText(this.playerScore + ' : ' + this.opponentScore, canvas.width / 2, canvas.height / 2 + 14);
    
    // Continue prompt
    if (this.timer > 60) {
      ctx.font = '11px "Courier New", monospace';
      ctx.fillStyle = PALETTE.light;
      ctx.fillText('Drücke ENTER', canvas.width / 2, canvas.height / 2 + 34);
    }
  }
};
