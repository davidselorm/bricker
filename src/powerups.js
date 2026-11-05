/**
 * Tactical Power-up Subsystem for BRICKER.
 * Uses clean standard alphanumeric badges with zero emojis.
 */
export const POWERUP_TYPES = {
  MULTIBALL: {
    id: 'multiball',
    label: 'MLT',
    fullName: 'MULTI-BALL',
    color: '#00f0ff',
    duration: 0 // Instant trigger
  },
  LASER: {
    id: 'laser',
    label: 'LSR',
    fullName: 'PLASMA CANNONS',
    color: '#ff007f',
    duration: 14 // 14 seconds
  },
  FIREBALL: {
    id: 'fireball',
    label: 'FIR',
    fullName: 'FIREBALL PENETRATION',
    color: '#ff4500',
    duration: 12 // 12 seconds
  },
  WIDE: {
    id: 'wide',
    label: 'WID',
    fullName: 'BROAD PADDLE',
    color: '#00ff88',
    duration: 16 // 16 seconds
  },
  SHIELD: {
    id: 'shield',
    label: 'SHD',
    fullName: 'KINETIC BARRIER',
    color: '#9d00ff',
    duration: 0 // Stays until consumed or level end
  },
  SLOW: {
    id: 'slow',
    label: 'SLW',
    fullName: 'TIME DILATION',
    color: '#ffd700',
    duration: 12 // 12 seconds
  },
  LIFE: {
    id: 'life',
    label: 'LIF',
    fullName: 'SHIELD CELL',
    color: '#ff3344',
    duration: 0 // Instant
  }
};

export class PowerupManager {
  constructor() {
    this.drops = []; // Falling capsules
    this.activeEffects = new Map(); // id -> remaining seconds
  }

  spawnDrop(x, y, forceType = null) {
    let pType;
    if (forceType && POWERUP_TYPES[forceType]) {
      pType = POWERUP_TYPES[forceType];
    } else {
      const keys = Object.keys(POWERUP_TYPES);
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      pType = POWERUP_TYPES[randomKey];
    }

    this.drops.push({
      x,
      y,
      width: 48,
      height: 20,
      vy: 135, // Fall speed pixels/s
      type: pType,
      pulse: Math.random() * Math.PI
    });
  }

  update(dt, paddle, onCollect) {
    // Update active effect timers
    for (const [id, timeLeft] of this.activeEffects.entries()) {
      if (timeLeft > 0) {
        const remaining = timeLeft - dt;
        if (remaining <= 0) {
          this.activeEffects.delete(id);
        } else {
          this.activeEffects.set(id, remaining);
        }
      }
    }

    // Update falling drops
    for (let i = this.drops.length - 1; i >= 0; i--) {
      const drop = this.drops[i];
      drop.y += drop.vy * dt;
      drop.pulse += dt * 4;

      // Check collision with paddle
      if (
        drop.x + drop.width / 2 >= paddle.x &&
        drop.x - drop.width / 2 <= paddle.x + paddle.width &&
        drop.y + drop.height / 2 >= paddle.y &&
        drop.y - drop.height / 2 <= paddle.y + paddle.height
      ) {
        // Collected!
        this.activatePowerup(drop.type);
        if (onCollect) onCollect(drop.type, drop.x, drop.y);
        this.drops.splice(i, 1);
        continue;
      }

      // Despawn if fallen off screen
      if (drop.y > 640) {
        this.drops.splice(i, 1);
      }
    }
  }

  activatePowerup(type) {
    if (type.duration > 0) {
      this.activeEffects.set(type.id, type.duration);
    } else if (type.id === 'shield') {
      this.activeEffects.set('shield', 9999);
    }
  }

  hasEffect(id) {
    return this.activeEffects.has(id);
  }

  consumeShield() {
    this.activeEffects.delete('shield');
  }

  draw(ctx) {
    ctx.save();
    for (const drop of this.drops) {
      const glow = Math.sin(drop.pulse) * 3 + 8;
      ctx.shadowColor = drop.type.color;
      ctx.shadowBlur = glow;

      // Outer tactical capsule
      ctx.fillStyle = 'rgba(8, 8, 20, 0.95)';
      ctx.strokeStyle = drop.type.color;
      ctx.lineWidth = 1.5;

      const r = 5;
      const left = drop.x - drop.width / 2;
      const top = drop.y - drop.height / 2;

      ctx.beginPath();
      ctx.roundRect(left, top, drop.width, drop.height, r);
      ctx.fill();
      ctx.stroke();

      // Side marker pips
      ctx.fillStyle = drop.type.color;
      ctx.fillRect(left + 2, top + 3, 2, drop.height - 6);
      ctx.fillRect(left + drop.width - 4, top + 3, 2, drop.height - 6);

      // Clean Alphanumeric Tactical Label
      ctx.font = '700 11px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(drop.type.label, drop.x, drop.y + 1);
    }
    ctx.restore();
  }

  clear() {
    this.drops = [];
    this.activeEffects.clear();
  }
}
