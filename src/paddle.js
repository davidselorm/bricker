/**
 * Upgraded Tactical Paddle Controller & Laser System for BRICKER.
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
    this.prevX = this.x;
    this.vx = 0;
    this.targetX = this.x;
    this.speed = 750; // pixels per second
    this.lasers = [];
    this.laserCooldown = 0;
    this.recoil = 0;
  }

  reset() {
    this.width = this.baseWidth;
    this.x = (this.canvasWidth - this.width) / 2;
    this.prevX = this.x;
    this.targetX = this.x;
    this.vx = 0;
    this.lasers = [];
    this.laserCooldown = 0;
    this.recoil = 0;
  }

  setTargetX(mouseX) {
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
    this.width += (targetWidth - this.width) * Math.min(1, dt * 10);

    // Calculate paddle velocity for spin mechanics
    this.prevX = this.x;
    this.x += (this.targetX - this.x) * Math.min(1, dt * 26);
    this.x = Math.max(0, Math.min(this.canvasWidth - this.width, this.x));
    this.vx = dt > 0 ? (this.x - this.prevX) / dt : 0;

    // Laser firing cooldown and recoil recovery
    if (this.laserCooldown > 0) {
      this.laserCooldown -= dt;
    }
    if (this.recoil > 0) {
      this.recoil = Math.max(0, this.recoil - dt * 18);
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
    this.laserCooldown = 0.22;
    this.recoil = 3.5; // Slight downward recoil kick

    // Twin lasers from left and right turrets
    this.lasers.push({
      x: this.x + 8,
      y: this.y - 8,
      width: 4,
      height: 18,
      vy: -780
    });
    this.lasers.push({
      x: this.x + this.width - 12,
      y: this.y - 8,
      width: 4,
      height: 18,
      vy: -780
    });

    if (audioEngine) audioEngine.playLaserShot();
    return true;
  }

  draw(ctx, powerupManager) {
    ctx.save();
    const hasLaser = powerupManager && powerupManager.hasEffect('laser');
    const isWide = powerupManager && powerupManager.hasEffect('wide');

    const glowColor = hasLaser ? '#ff007f' : (isWide ? '#00ff88' : '#00f0ff');
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 14;

    const drawY = this.y + this.recoil;

    // Paddle chassis gradient
    const grad = ctx.createLinearGradient(this.x, drawY, this.x, drawY + this.height);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.28, glowColor);
    grad.addColorStop(1, '#060614');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(this.x, drawY, this.width, this.height, 6);
    ctx.fill();

    // Chassis border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Subtle center energy core
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 8;
    ctx.fillRect(this.x + this.width / 2 - 10, drawY + 4, 20, 2);

    // Twin Laser Turrets
    if (hasLaser) {
      ctx.fillStyle = '#ff007f';
      ctx.shadowColor = '#ff007f';
      ctx.shadowBlur = 12;
      ctx.fillRect(this.x + 4, drawY - 7, 6, 7);
      ctx.fillRect(this.x + this.width - 10, drawY - 7, 6, 7);
    }

    // Flying plasma laser bolts
    ctx.fillStyle = '#ff007f';
    ctx.shadowColor = '#ff007f';
    ctx.shadowBlur = 14;
    for (const laser of this.lasers) {
      ctx.beginPath();
      ctx.roundRect(laser.x, laser.y, laser.width, laser.height, 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
