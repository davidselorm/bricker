/**
 * Upgraded FX Engine with Warp Starfield & Particle Physics for BRICKER.
 */
export class ParticleEngine {
  constructor(canvasWidth = 800, canvasHeight = 600) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.particles = [];
    this.floatingTexts = [];
    this.shockwaves = [];
    this.shakeDuration = 0;
    this.shakeIntensity = 0;

    // Warp Starfield
    this.stars = [];
    this.initStars(55);
  }

  initStars(count) {
    this.stars = [];
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.canvasWidth,
        y: Math.random() * this.canvasHeight,
        speed: Math.random() * 25 + 15,
        size: Math.random() * 1.5 + 0.8,
        alpha: Math.random() * 0.6 + 0.2
      });
    }
  }

  triggerShake(intensity = 6, duration = 0.25) {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    this.shakeDuration = Math.max(this.shakeDuration, duration);
  }

  update(dt, combo = 1) {
    // Update warp starfield (speed scales with combo)
    const warpMultiplier = Math.min(4, 1 + (combo - 1) * 0.25);
    for (const star of this.stars) {
      star.y += star.speed * warpMultiplier * dt;
      if (star.y > this.canvasHeight) {
        star.y = 0;
        star.x = Math.random() * this.canvasWidth;
      }
    }

    // Screen shake update
    if (this.shakeDuration > 0) {
      this.shakeDuration -= dt;
      if (this.shakeDuration <= 0) {
        this.shakeIntensity = 0;
      }
    }

    // Update shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += sw.speed * dt;
      sw.alpha -= dt * 1.8;
      if (sw.alpha <= 0) {
        this.shockwaves.splice(i, 1);
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
      ft.scale = 1 + (1 - ft.alpha) * 0.35;

      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  drawBackgroundStars(ctx) {
    ctx.save();
    for (const star of this.stars) {
      ctx.fillStyle = '#00f0ff';
      ctx.globalAlpha = star.alpha;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  draw(ctx) {
    ctx.save();

    // Render shockwave rings
    for (const sw of this.shockwaves) {
      ctx.save();
      ctx.strokeStyle = sw.color;
      ctx.globalAlpha = Math.max(0, sw.alpha);
      ctx.lineWidth = sw.lineWidth;
      ctx.shadowColor = sw.color;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

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
      ctx.font = `${ft.bold ? '700 ' : ''}${Math.round(ft.size * ft.scale)}px 'Orbitron', monospace`;
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

    // Expanding shockwave ring
    this.shockwaves.push({
      x: centerX,
      y: centerY,
      radius: 10,
      speed: 380,
      alpha: 1,
      lineWidth: 3,
      color: '#ff3344'
    });

    for (let i = 0; i < 48; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 420 + 100;
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
      const speed = Math.random() * 160 + 50;
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
      speed: 42,
      life: 0.8,
      maxLife: 0.8,
      alpha: 1,
      scale: 1
    });
  }

  addCelebration(width, height) {
    const colors = ['#00f0ff', '#ff007f', '#ffd700', '#00ff88', '#9d00ff'];
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * width;
      const y = Math.random() * (height * 0.6);
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 260 + 70;
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
    this.shockwaves = [];
    this.shakeDuration = 0;
    this.shakeIntensity = 0;
  }
}
