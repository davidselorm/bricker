/**
 * Paddle Controller & Laser Blaster for BRICKER.
 */
export class Paddle {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.baseWidth = 110;
    this.width = this.baseWidth;
    this.height = 14;
    this.x = (canvasWidth - this.width) / 2;
    this.y = canvasHeight - 45;
    this.targetX = this.x;
    this.speed = 700; // pixels per second for keyboard
    this.lasers = [];
    this.laserCooldown = 0;
  }

  reset() {
    this.width = this.baseWidth;
    this.x = (this.canvasWidth - this.width) / 2;
    this.targetX = this.x;
    this.lasers = [];
    this.laserCooldown = 0;
  }

  setTargetX(mouseX) {
    // Center paddle around mouse
    this.targetX = Math.max(0, Math.min(this.canvasWidth - this.width, mouseX - this.width / 2));
  }

  moveLeft(dt) {
    this.targetX = Math.max(0, this.targetX - this.speed * dt);
  }

  moveRight(dt) {
    this.targetX = Math.min(this.canvasWidth - this.width, this.targetX + this.speed * dt);
  }

  update(dt, powerupManager) {
    // Check wide paddle effect
    const isWide = powerupManager && powerupManager.hasEffect('wide');
    const targetWidth = isWide ? this.baseWidth * 1.45 : this.baseWidth;
    // Smooth width change
    this.width += (targetWidth - this.width) * Math.min(1, dt * 10);

    // Smooth movement interpolation toward target
    this.x += (this.targetX - this.x) * Math.min(1, dt * 25);
    this.x = Math.max(0, Math.min(this.canvasWidth - this.width, this.x));

    // Laser firing cooldown and update
    if (this.laserCooldown > 0) {
      this.laserCooldown -= dt;
    }

    // Update active laser projectiles
    for (let i = this.lasers.length - 1; i >= 0; i--) {
      const laser = this.lasers[i];
      laser.y += laser.vy * dt;
      if (laser.y < -20) {
        this.lasers.splice(i, 1);
      }
    }
  }

  fireLaser(audioEngine) {
    if (this.laserCooldown > 0) return false;
    this.laserCooldown = 0.22; // Seconds between shots

    // Twin lasers from left and right tips
    this.lasers.push({
      x: this.x + 8,
      y: this.y - 6,
      width: 4,
      height: 16,
      vy: -750
    });
    this.lasers.push({
      x: this.x + this.width - 12,
      y: this.y - 6,
      width: 4,
      height: 16,
      vy: -750
    });

    if (audioEngine) audioEngine.playLaserShot();
    return true;
  }

  draw(ctx, powerupManager) {
    ctx.save();
    const hasLaser = powerupManager && powerupManager.hasEffect('laser');
    const isWide = powerupManager && powerupManager.hasEffect('wide');

    // Glow effects
    const glowColor = hasLaser ? '#ff007f' : (isWide ? '#00ff88' : '#00f0ff');
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 14;

    // Paddle body gradient
    const grad = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, glowColor);
    grad.addColorStop(1, '#080816');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.width, this.height, 7);
    ctx.fill();

    // Border highlight
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Laser cannons rendering
    if (hasLaser) {
      ctx.fillStyle = '#ff007f';
      ctx.shadowColor = '#ff007f';
      ctx.shadowBlur = 10;
      // Left turret
      ctx.fillRect(this.x + 4, this.y - 7, 6, 7);
      // Right turret
      ctx.fillRect(this.x + this.width - 10, this.y - 7, 6, 7);
    }

    // Render flying laser beams
    ctx.fillStyle = '#ff007f';
    ctx.shadowColor = '#ff007f';
    ctx.shadowBlur = 12;
    for (const laser of this.lasers) {
      ctx.beginPath();
      ctx.roundRect(laser.x, laser.y, laser.width, laser.height, 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
