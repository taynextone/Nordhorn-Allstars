// ============================================
// NORDHORN ALLSTARS — DIALOG.JS
// ============================================

const Dialog = {
  active: false,
  lines: [],
  currentLine: 0,
  currentText: '',
  textIndex: 0,
  textSpeed: 2,
  textTimer: 0,
  callback: null,
  fromState: null,
  
  show(text, callback) {
    if (typeof text === 'string') {
      this.lines = [text];
    } else {
      this.lines = text;
    }
    this.currentLine = 0;
    this.currentText = '';
    this.textIndex = 0;
    this.textTimer = 0;
    this.active = true;
    this.callback = callback;
    // Only switch to DIALOG state if in overworld
    if (gameState === GameState.OVERWORLD) {
      this.fromState = GameState.OVERWORLD;
      gameState = GameState.DIALOG;
    } else {
      this.fromState = gameState;
    }
  },
  
  update() {
    if (!this.active) return;
    
    const fullText = this.lines[this.currentLine] || '';
    
    if (this.textIndex < fullText.length) {
      this.textTimer++;
      if (this.textTimer >= this.textSpeed) {
        this.currentText += fullText[this.textIndex];
        this.textIndex++;
        this.textTimer = 0;
        Audio.dialogText();
      }
    }
    
    if (wasPressed('Enter') || wasPressed(' ')) {
      if (this.textIndex < fullText.length) {
        // Text sofort anzeigen
        this.currentText = fullText;
        this.textIndex = fullText.length;
      } else if (this.currentLine < this.lines.length - 1) {
        // Nächste Zeile
        Audio.dialogAdvance();
        this.currentLine++;
        this.currentText = '';
        this.textIndex = 0;
      } else {
        // Dialog beenden
        Audio.dialogAdvance();
        this.active = false;
        if (this.callback) {
          this.callback();
          this.callback = null;
        }
        if (gameState === GameState.DIALOG) {
          gameState = this.fromState || GameState.OVERWORLD;
        }
      }
    }
  },
  
  render() {
    if (!this.active) return;
    
    // Dialogbox
    const boxH = 80;
    const boxY = canvas.height - boxH - 8;
    
    // Hintergrund
    ctx.fillStyle = PALETTE.darkest;
    ctx.fillRect(4, boxY, canvas.width - 8, boxH);
    
    // Rahmen
    ctx.strokeStyle = PALETTE.lightest;
    ctx.lineWidth = 2;
    ctx.strokeRect(6, boxY + 2, canvas.width - 12, boxH - 4);
    
    // Text
    ctx.fillStyle = PALETTE.lightest;
    ctx.font = '12px "Courier New", monospace';
    ctx.textAlign = 'left';
    
    // Word wrap
    const maxWidth = canvas.width - 32;
    const words = this.currentText.split(' ');
    let line = '';
    let y = boxY + 20;
    
    for (const word of words) {
      const testLine = line + word + ' ';
      if (ctx.measureText(testLine).width > maxWidth) {
        ctx.fillText(line, 14, y);
        line = word + ' ';
        y += 16;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 14, y);
    
    // "Weiter"-Pfeil
    if (this.textIndex >= (this.lines[this.currentLine] || '').length) {
      if (Math.floor(Date.now() / 500) % 2 === 0) {
        ctx.fillStyle = PALETTE.lightest;
        ctx.beginPath();
        ctx.moveTo(canvas.width - 20, boxY + boxH - 16);
        ctx.lineTo(canvas.width - 12, boxY + boxH - 12);
        ctx.lineTo(canvas.width - 20, boxY + boxH - 8);
        ctx.fill();
      }
    }
  }
};
