/**
 * Particle and Visual FX Engine for BRICKER.
 */
export class ParticleEngine {
  constructor() {
    this.particles = [];
    this.floatingTexts = [];
    this.shakeDuration = 0;
    this.shakeIntensity = 0;
  }

  triggerShake(intensity = 6, duration = 0.25) {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    this.shakeDuration = Math.max(this.shakeDuration, duration);
  }

  update(dt) {
    // Screen shake update
    if (this.shakeDuration > 0) {
      this.shakeDuration -= dt;
      if (this.shakeDuration <= 0) {
        this.shakeIntensity = 0;
      }
    }

    // Update physical particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= Math.pow(p.friction || 0.98, dt * 60);
      p.vy += (p.gravity || 180) * dt;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.maxLife);

      if (p.rotation !== undefined) {
        p.rotation += (p.rotSpeed || 2) * dt;
      }

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= ft.speed * dt;
      ft.life -= dt;
      ft.alpha = Math.max(0, ft.life / ft.maxLife);
      ft.scale = 1 + (1 - ft.alpha) * 0.3;

      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    ctx.save();

    // Render particles
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;

      if (p.shape === 'rect') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation || 0);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (p.alpha * 0.8 + 0.2), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Render floating texts
    for (const ft of this.floatingTexts) {
      ctx.globalAlpha = ft.alpha;
      ctx.fillStyle = ft.color;
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 12;
      ctx.font = `${ft.bold ? 'bold ' : ''}${Math.round(ft.size * ft.scale)}px 'Orbitron', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ft.text, ft.x, ft.y);
    }

    ctx.restore();
  }

  addBrickExplosion(x, y, width, height, color, count = 16) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 260 + 80;
      const life = Math.random() * 0.4 + 0.3;
      this.particles.push({
        x: x + Math.random() * width,
        y: y + Math.random() * height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60,
        size: Math.random() * 4 + 3,
        shape: Math.random() > 0.4 ? 'rect' : 'circle',
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 10,
        color: color,
        life: life,
        maxLife: life,
        alpha: 1,
        gravity: 350,
        friction: 0.96
      });
    }
  }

  addTntExplosion(centerX, centerY) {
    this.triggerShake(14, 0.4);
    // Fiery shockwave particles
    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 400 + 100;
      const life = Math.random() * 0.6 + 0.4;
      const colors = ['#ff2200', '#ff7700', '#ffee00', '#ffffff'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      this.particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 8 + 4,
        shape: 'circle',
        color: color,
        life: life,
        maxLife: life,
        alpha: 1,
        gravity: 80,
        friction: 0.92
      });
    }
  }

  addSparks(x, y, color = '#00f0ff', count = 8) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 150 + 50;
      const life = Math.random() * 0.25 + 0.15;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 1.5,
        shape: 'circle',
        color,
        life,
        maxLife: life,
        alpha: 1,
        gravity: 120,
        friction: 0.95
      });
    }
  }

  addFloatingText(text, x, y, color = '#ffffff', size = 18, bold = true) {
    this.floatingTexts.push({
      text,
      x,
      y,
      color,
      size,
      bold,
      speed: 40,
      life: 0.8,
      maxLife: 0.8,
      alpha: 1,
      scale: 1
    });
  }

  addCelebration(width, height) {
    const colors = ['#00f0ff', '#ff007f', '#ffd700', '#00ff88', '#9d00ff'];
    for (let i = 0; i < 70; i++) {
      const x = Math.random() * width;
      const y = Math.random() * (height * 0.6);
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 250 + 60;
      const life = Math.random() * 1.2 + 0.6;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 6 + 3,
        shape: 'rect',
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        life,
        maxLife: life,
        alpha: 1,
        gravity: 180,
        friction: 0.97
      });
    }
  }

  getShakeOffset() {
    if (this.shakeDuration <= 0) return { x: 0, y: 0 };
    const currentIntensity = this.shakeIntensity * (this.shakeDuration / 0.25);
    return {
      x: (Math.random() * 2 - 1) * currentIntensity,
      y: (Math.random() * 2 - 1) * currentIntensity
    };
  }

  clear() {
    this.particles = [];
    this.floatingTexts = [];
    this.shakeDuration = 0;
    this.shakeIntensity = 0;
  }
}
