/**
 * Power-up System for BRICKER.
 */
export const POWERUP_TYPES = {
  MULTIBALL: {
    id: 'multiball',
    label: 'MULTI',
    icon: '⚡',
    color: '#00f0ff',
    duration: 0 // Instant trigger
  },
  LASER: {
    id: 'laser',
    label: 'LASER',
    icon: '🚀',
    color: '#ff007f',
    duration: 14 // 14 seconds
  },
  FIREBALL: {
    id: 'fireball',
    label: 'FIRE',
    icon: '🔥',
    color: '#ff4500',
    duration: 12 // 12 seconds
  },
  WIDE: {
    id: 'wide',
    label: 'WIDE',
    icon: '↔️',
    color: '#00ff88',
    duration: 16 // 16 seconds
  },
  SHIELD: {
    id: 'shield',
    label: 'SHIELD',
    icon: '🛡️',
    color: '#9d00ff',
    duration: 0 // Stays until consumed or level end
  },
  SLOW: {
    id: 'slow',
    label: 'SLOW',
    icon: '⏱️',
    color: '#ffd700',
    duration: 12 // 12 seconds
  },
  LIFE: {
    id: 'life',
    label: 'LIFE',
    icon: '❤️',
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
      width: 44,
      height: 22,
      vy: 130, // Fall speed pixels/s
      type: pType,
      pulse: 0
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
      drop.pulse += dt * 5;

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
      if (drop.y > 650) {
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
      const glow = Math.sin(drop.pulse) * 4 + 8;
      ctx.shadowColor = drop.type.color;
      ctx.shadowBlur = glow;

      // Capsule body
      ctx.fillStyle = 'rgba(10, 10, 25, 0.9)';
      ctx.strokeStyle = drop.type.color;
      ctx.lineWidth = 2;

      const r = drop.height / 2;
      const left = drop.x - drop.width / 2;
      const top = drop.y - drop.height / 2;

      ctx.beginPath();
      ctx.roundRect(left, top, drop.width, drop.height, r);
      ctx.fill();
      ctx.stroke();

      // Capsule text/badge
      ctx.fillStyle = drop.type.color;
      ctx.font = 'bold 11px Orbitron, sans-serif';
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
