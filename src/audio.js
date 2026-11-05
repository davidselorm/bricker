/**
 * Procedural Web Audio API Synthesizer for BRICKER.
 * Zero external audio files required.
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.soundEnabled = true;
    this.musicEnabled = false;
    this.musicInterval = null;
    this.musicStep = 0;

    // Pentatonic scale frequencies for combo escalation
    this.pentatonic = [
      261.63, // C4
      293.66, // D4
      329.63, // E4
      392.00, // G4
      440.00, // A4
      523.25, // C5
      587.33, // D5
      659.25, // E5
      783.99, // G5
      880.00, // A5
      1046.50 // C6
    ];
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound(force) {
    this.soundEnabled = force !== undefined ? force : !this.soundEnabled;
    return this.soundEnabled;
  }

  toggleMusic(force) {
    this.musicEnabled = force !== undefined ? force : !this.musicEnabled;
    if (this.musicEnabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
    return this.musicEnabled;
  }

  playTone(freq, type, duration, gainStart = 0.2, gainEnd = 0.001) {
    if (!this.soundEnabled || !this.ctx) return;
    this.init();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(gainStart, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(gainEnd, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playPaddleHit(offsetRatio = 0) {
    if (!this.soundEnabled || !this.ctx) return;
    this.init();

    // Pitch shifts slightly depending on where on the paddle the ball hits
    const baseFreq = 220 + offsetRatio * 80;
    this.playTone(baseFreq, 'sine', 0.1, 0.25);
  }

  playWallHit() {
    if (!this.soundEnabled || !this.ctx) return;
    this.init();
    this.playTone(180, 'triangle', 0.07, 0.15);
  }

  playBrickHit(combo = 1) {
    if (!this.soundEnabled || !this.ctx) return;
    this.init();

    // Note scales up with current combo count
    const noteIdx = Math.min(combo - 1, this.pentatonic.length - 1);
    const freq = this.pentatonic[noteIdx];
    this.playTone(freq, 'sine', 0.15, 0.28);
  }

  playBrickExplode() {
    if (!this.soundEnabled || !this.ctx) return;
    this.init();

    const t = this.ctx.currentTime;
    // Sub-bass punch
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.2);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);

    // Crackle noise burst
    this.playNoise(0.12, 0.25);
  }

  playTntExplosion() {
    if (!this.soundEnabled || !this.ctx) return;
    this.init();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.exponentialRampToValueAtTime(20, t + 0.5);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.5);

    this.playNoise(0.4, 0.45);
  }

  playNoise(duration, gainVal = 0.2) {
    if (!this.soundEnabled || !this.ctx) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000;

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(gainVal, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    whiteNoise.start();
  }

  playLaserShot() {
    if (!this.soundEnabled || !this.ctx) return;
    this.init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.12);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  playPowerupCollect() {
    if (!this.soundEnabled || !this.ctx) return;
    this.init();
    const notes = [440, 554.37, 659.25, 880]; // A Major arpeggio
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.15, 0.25);
      }, idx * 45);
    });
  }

  playLifeLost() {
    if (!this.soundEnabled || !this.ctx) return;
    this.init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.45);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.45);
  }

  playLevelComplete() {
    if (!this.soundEnabled || !this.ctx) return;
    this.init();
    const fanfare = [
      { f: 523.25, d: 100 },
      { f: 659.25, d: 100 },
      { f: 783.99, d: 100 },
      { f: 1046.50, d: 350 }
    ];
    let offset = 0;
    fanfare.forEach(note => {
      setTimeout(() => {
        this.playTone(note.f, 'triangle', note.d / 1000, 0.3);
      }, offset);
      offset += note.d + 30;
    });
  }

  playGameOver() {
    if (!this.soundEnabled || !this.ctx) return;
    this.init();
    const notes = [440, 415.30, 392, 349.23];
    notes.forEach((f, idx) => {
      setTimeout(() => {
        this.playTone(f, 'sawtooth', 0.25, 0.25);
      }, idx * 160);
    });
  }

  playShieldHit() {
    if (!this.soundEnabled || !this.ctx) return;
    this.init();
    this.playTone(520, 'square', 0.08, 0.2);
  }

  startMusic() {
    if (!this.musicInterval) {
      this.init();
      // Synthwave baseline loop (A minor pentatonic bass arpeggio)
      const bassNotes = [110, 110, 130.81, 146.83, 164.81, 146.83, 130.81, 110];
      this.musicStep = 0;
      this.musicInterval = setInterval(() => {
        if (!this.musicEnabled) return;
        const note = bassNotes[this.musicStep % bassNotes.length];
        this.playTone(note, 'sawtooth', 0.12, 0.06);
        this.musicStep++;
      }, 160);
    }
  }

  stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const audio = new SoundEngine();
