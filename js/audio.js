// ============================================
// NORDHORN ALLSTARS — AUDIO.JS
// Chiptune Sound Effects via Web Audio API
// ============================================

const Audio = {
  ctx: null,
  masterGain: null,
  muted: false,
  initialized: false,

  // Initialize audio context (must be called after user gesture)
  init() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.3;
      this.masterGain.connect(this.ctx.destination);
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio not supported:', e);
    }
  },

  // Resume context if suspended (browser autoplay policy)
  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  // Toggle mute
  toggleMute() {
    this.muted = !this.muted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : 0.3;
    }
  },

  // Generic tone player
  playTone(frequency, duration, type = 'square', volume = 0.3, attack = 0.01, release = 0.05) {
    if (!this.initialized || this.muted) return;
    this.resume();
    
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + attack);
    gain.gain.linearRampToValueAtTime(0, now + duration - release);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + duration);
  },

  // Noise burst (for hits, bounces)
  playNoise(duration, volume = 0.2) {
    if (!this.initialized || this.muted) return;
    this.resume();
    
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    }
    
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, now);
    gain.gain.linearRampToValueAtTime(0, now + duration);
    
    // Bandpass filter for chiptune feel
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2000;
    filter.Q.value = 1;
    
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    source.start(now);
    source.stop(now + duration);
  },

  // Arpeggio (for level up, victory)
  playArpeggio(notes, noteLength = 0.08, type = 'square') {
    if (!this.initialized || this.muted) return;
    this.resume();
    
    const now = this.ctx.currentTime;
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now + i * noteLength);
      gain.gain.setValueAtTime(0, now + i * noteLength);
      gain.gain.linearRampToValueAtTime(0.25, now + i * noteLength + 0.01);
      gain.gain.linearRampToValueAtTime(0, now + i * noteLength + noteLength * 0.9);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + i * noteLength);
      osc.stop(now + i * noteLength + noteLength);
    });
  },

  // ============================================
  // GAME SOUND EFFECTS
  // ============================================

  // Menu navigation (cursor move)
  menuMove() {
    this.playTone(440, 0.05, 'square', 0.15);
  },

  // Menu select / confirm
  menuSelect() {
    this.playTone(523, 0.06, 'square', 0.2);
    setTimeout(() => this.playTone(659, 0.08, 'square', 0.2), 60);
  },

  // Menu cancel / back
  menuCancel() {
    this.playTone(392, 0.06, 'square', 0.15);
    setTimeout(() => this.playTone(330, 0.08, 'square', 0.15), 60);
  },

  // Dialog text appearing
  dialogText() {
    this.playTone(600 + Math.random() * 200, 0.02, 'square', 0.08);
  },

  // Dialog advance / close
  dialogAdvance() {
    this.playTone(500, 0.04, 'square', 0.15);
    setTimeout(() => this.playTone(700, 0.06, 'square', 0.15), 40);
  },

  // Battle start (VS screen)
  battleStart() {
    this.playArpeggio([262, 330, 392, 523], 0.1, 'square');
  },

  // Ball whoosh (attack launch)
  ballWhoosh() {
    if (!this.initialized || this.muted) return;
    this.resume();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.linearRampToValueAtTime(800, now + 0.15);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.2);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.2);
  },

  // Successful hit / swish
  hitSwish() {
    this.playNoise(0.15, 0.25);
    this.playTone(800, 0.1, 'square', 0.15);
    setTimeout(() => this.playTone(1200, 0.08, 'square', 0.1), 50);
  },

  // Score burst (points scored)
  scoreBurst() {
    this.playArpeggio([523, 659, 784], 0.06, 'square');
  },

  // Miss / ball bounces away
  missBounce() {
    this.playNoise(0.1, 0.15);
    this.playTone(200, 0.15, 'triangle', 0.15);
  },

  // Block / defense
  block() {
    this.playNoise(0.08, 0.2);
    this.playTone(150, 0.1, 'square', 0.2);
  },

  // Stun / debuff
  stun() {
    this.playTone(300, 0.1, 'square', 0.15);
    setTimeout(() => this.playTone(200, 0.15, 'square', 0.15), 80);
  },

  // Setup / buff
  setup() {
    this.playTone(400, 0.06, 'triangle', 0.15);
    setTimeout(() => this.playTone(600, 0.06, 'triangle', 0.15), 60);
    setTimeout(() => this.playTone(800, 0.08, 'triangle', 0.15), 120);
  },

  // Finisher move
  finisher() {
    this.playArpeggio([262, 392, 523, 784, 1047], 0.08, 'sawtooth');
  },

  // Victory fanfare
  victory() {
    this.playArpeggio([523, 659, 784, 1047], 0.12, 'square');
    setTimeout(() => this.playArpeggio([659, 784, 1047, 1319], 0.15, 'square'), 500);
  },

  // Defeat / game over
  defeat() {
    this.playArpeggio([392, 330, 262, 196], 0.2, 'triangle');
  },

  // Level up
  levelUp() {
    this.playArpeggio([523, 659, 784, 1047, 784, 1047], 0.08, 'square');
  },

  // Badge earned
  badgeEarned() {
    this.playArpeggio([659, 784, 1047, 1319, 1047, 1319], 0.1, 'square');
  },

  // Item pickup
  itemPickup() {
    this.playTone(800, 0.05, 'square', 0.15);
    setTimeout(() => this.playTone(1000, 0.05, 'square', 0.15), 50);
    setTimeout(() => this.playTone(1200, 0.1, 'square', 0.15), 100);
  },

  // Warp / train travel
  warp() {
    if (!this.initialized || this.muted) return;
    this.resume();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(600, now + 0.3);
    osc.frequency.linearRampToValueAtTime(300, now + 0.6);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.6);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.6);
  },

  // Title screen select
  titleSelect() {
    this.playArpeggio([523, 784], 0.1, 'square');
  },

  // Credits theme
  credits() {
    this.playArpeggio([523, 659, 784, 659, 523, 659], 0.2, 'triangle');
  }
};

// ============================================
// NORDHORN ALLSTARS — BACKGROUND MUSIC
// Chiptune sequencer with per-game-state tracks
// ============================================

const Music = {
  ctx: null,
  masterGain: null,
  initialized: false,
  muted: false,
  currentTrack: null,
  isPlaying: false,
  schedulerTimer: null,
  nextNoteTime: 0,
  currentStep: 0,
  bpm: 120,
  secondsPerBeat: 0.5, // 60 / bpm
  lookahead: 0.1, // seconds to schedule ahead
  scheduleInterval: 25, // ms between scheduler calls

  // Track definitions: arrays of {note, duration, type, volume}
  // note: frequency in Hz, duration: in beats, type: oscillator type
  tracks: {
    title: {
      bpm: 100,
      // Bass line (triangle) + lead (square)
      bass: [
        {note: 131, dur: 2}, {note: 165, dur: 2}, {note: 196, dur: 2}, {note: 165, dur: 2},
        {note: 131, dur: 2}, {note: 175, dur: 2}, {note: 220, dur: 2}, {note: 175, dur: 2},
        {note: 147, dur: 2}, {note: 175, dur: 2}, {note: 196, dur: 2}, {note: 175, dur: 2},
        {note: 131, dur: 2}, {note: 196, dur: 2}, {note: 262, dur: 2}, {note: 196, dur: 2}
      ],
      lead: [
        {note: 523, dur: 1}, {note: 0, dur: 1}, {note: 659, dur: 1}, {note: 0, dur: 1},
        {note: 784, dur: 2}, {note: 0, dur: 2},
        {note: 698, dur: 1}, {note: 0, dur: 1}, {note: 659, dur: 1}, {note: 0, dur: 1},
        {note: 523, dur: 2}, {note: 0, dur: 2},
        {note: 587, dur: 1}, {note: 0, dur: 1}, {note: 659, dur: 1}, {note: 0, dur: 1},
        {note: 698, dur: 2}, {note: 0, dur: 2},
        {note: 784, dur: 1}, {note: 0, dur: 1}, {note: 698, dur: 1}, {note: 0, dur: 1},
        {note: 523, dur: 2}, {note: 0, dur: 2}
      ]
    },
    overworld: {
      bpm: 130,
      bass: [
        {note: 165, dur: 1}, {note: 165, dur: 1}, {note: 196, dur: 1}, {note: 165, dur: 1},
        {note: 220, dur: 1}, {note: 220, dur: 1}, {note: 196, dur: 1}, {note: 220, dur: 1},
        {note: 147, dur: 1}, {note: 147, dur: 1}, {note: 175, dur: 1}, {note: 147, dur: 1},
        {note: 196, dur: 1}, {note: 196, dur: 1}, {note: 175, dur: 1}, {note: 196, dur: 1}
      ],
      lead: [
        {note: 659, dur: 0.5}, {note: 784, dur: 0.5}, {note: 880, dur: 1}, {note: 784, dur: 0.5}, {note: 659, dur: 0.5},
        {note: 587, dur: 1}, {note: 659, dur: 1}, {note: 0, dur: 1}, {note: 659, dur: 1},
        {note: 587, dur: 0.5}, {note: 659, dur: 0.5}, {note: 784, dur: 1}, {note: 659, dur: 0.5}, {note: 587, dur: 0.5},
        {note: 523, dur: 1}, {note: 587, dur: 1}, {note: 0, dur: 1}, {note: 523, dur: 1}
      ]
    },
    battle: {
      bpm: 150,
      bass: [
        {note: 131, dur: 0.5}, {note: 131, dur: 0.5}, {note: 165, dur: 0.5}, {note: 131, dur: 0.5},
        {note: 196, dur: 1}, {note: 165, dur: 0.5}, {note: 131, dur: 0.5},
        {note: 147, dur: 0.5}, {note: 147, dur: 0.5}, {note: 175, dur: 0.5}, {note: 147, dur: 0.5},
        {note: 196, dur: 1}, {note: 175, dur: 0.5}, {note: 147, dur: 0.5}
      ],
      lead: [
        {note: 523, dur: 0.5}, {note: 659, dur: 0.5}, {note: 784, dur: 0.5}, {note: 1047, dur: 0.5},
        {note: 880, dur: 0.5}, {note: 784, dur: 0.5}, {note: 659, dur: 0.5}, {note: 523, dur: 0.5},
        {note: 587, dur: 0.5}, {note: 698, dur: 0.5}, {note: 784, dur: 0.5}, {note: 988, dur: 0.5},
        {note: 880, dur: 0.5}, {note: 784, dur: 0.5}, {note: 698, dur: 0.5}, {note: 587, dur: 0.5}
      ]
    },
    victory: {
      bpm: 120,
      bass: [
        {note: 131, dur: 1}, {note: 165, dur: 1}, {note: 196, dur: 1}, {note: 262, dur: 2},
        {note: 196, dur: 1}, {note: 262, dur: 1}, {note: 330, dur: 2}, {note: 0, dur: 2}
      ],
      lead: [
        {note: 523, dur: 1}, {note: 659, dur: 1}, {note: 784, dur: 1}, {note: 1047, dur: 2},
        {note: 784, dur: 1}, {note: 1047, dur: 1}, {note: 1319, dur: 2}, {note: 0, dur: 2}
      ]
    },
    credits: {
      bpm: 90,
      bass: [
        {note: 131, dur: 2}, {note: 165, dur: 2}, {note: 196, dur: 2}, {note: 131, dur: 2},
        {note: 147, dur: 2}, {note: 175, dur: 2}, {note: 196, dur: 2}, {note: 262, dur: 2}
      ],
      lead: [
        {note: 523, dur: 1}, {note: 659, dur: 1}, {note: 784, dur: 1}, {note: 659, dur: 1},
        {note: 523, dur: 2}, {note: 0, dur: 2},
        {note: 587, dur: 1}, {note: 698, dur: 1}, {note: 784, dur: 1}, {note: 698, dur: 1},
        {note: 587, dur: 2}, {note: 0, dur: 2},
        {note: 523, dur: 1}, {note: 659, dur: 1}, {note: 784, dur: 1}, {note: 880, dur: 1},
        {note: 1047, dur: 4}, {note: 0, dur: 4}
      ]
    }
  },

  init() {
    if (this.initialized) return;
    try {
      this.ctx = Audio.ctx;
      this.masterGain = Audio.masterGain;
      this.initialized = true;
    } catch (e) {
      console.warn('Music init failed:', e);
    }
  },

  play(trackName) {
    if (!this.initialized) this.init();
    if (this.currentTrack === trackName && this.isPlaying) return;
    
    this.stop();
    
    const track = this.tracks[trackName];
    if (!track) return;
    
    this.currentTrack = trackName;
    this.bpm = track.bpm;
    this.secondsPerBeat = 60 / this.bpm;
    this.currentStep = 0;
    this.isPlaying = true;
    this.nextNoteTime = this.ctx ? this.ctx.currentTime + 0.1 : 0;
    
    this.scheduler();
  },

  stop() {
    this.isPlaying = false;
    this.currentTrack = null;
    if (this.schedulerTimer) {
      clearTimeout(this.schedulerTimer);
      this.schedulerTimer = null;
    }
  },

  toggleMute() {
    this.muted = !this.muted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : 0.3;
    }
  },

  scheduler() {
    if (!this.isPlaying || !this.ctx) return;
    
    while (this.nextNoteTime < this.ctx.currentTime + this.lookahead) {
      this.scheduleStep(this.currentStep, this.nextNoteTime);
      this.advanceStep();
    }
    
    this.schedulerTimer = setTimeout(() => this.scheduler(), this.scheduleInterval);
  },

  scheduleStep(step, time) {
    const track = this.tracks[this.currentTrack];
    if (!track) return;
    
    const bassNote = track.bass[step % track.bass.length];
    const leadNote = track.lead[step % track.lead.length];
    
    // Schedule bass note
    if (bassNote && bassNote.note > 0) {
      this.playMusicNote(bassNote.note, time, bassNote.dur * this.secondsPerBeat, 'triangle', 0.12);
    }
    
    // Schedule lead note
    if (leadNote && leadNote.note > 0) {
      this.playMusicNote(leadNote.note, time, leadNote.dur * this.secondsPerBeat, 'square', 0.08);
    }
  },

  playMusicNote(frequency, time, duration, type, volume) {
    if (!this.ctx || this.muted) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, time);
    
    const dur = Math.min(duration, 0.5); // Cap note length
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(volume, time + 0.01);
    gain.gain.setValueAtTime(volume, time + dur * 0.7);
    gain.gain.linearRampToValueAtTime(0, time + dur);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(time);
    osc.stop(time + dur + 0.05);
  },

  advanceStep() {
    this.currentStep++;
    const track = this.tracks[this.currentTrack];
    if (!track) return;
    
    // Advance by the shortest note duration in the current step
    const bassNote = track.bass[this.currentStep % track.bass.length];
    const leadNote = track.lead[this.currentStep % track.lead.length];
    const minDur = Math.min(bassNote.dur, leadNote.dur) * this.secondsPerBeat;
    this.nextNoteTime += minDur;
  }
};
