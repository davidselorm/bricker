/**
 * Ball Physics, Trail & Collision Engine for BRICKER.
 */
export class Ball {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.radius = 7;
    this.baseSpeed = 440; // Pixels per second
    this.speed = this.baseSpeed;
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.stuckToPaddle = true;
    this.stuckOffset = 0;
    this.trail = [];
    this.maxTrail = 10;
  }

  attachToPaddle(paddle, offset = 0) {
    this.stuckToPaddle = true;
    this.stuckOffset = offset;
    this.x = paddle.x + paddle.width / 2 + offset;
    this.y = paddle.y - this.radius - 1;
    this.vx = 0;
    this.vy = 0;
    this.trail = [];
  }

  launch(paddle) {
    if (!this.stuckToPaddle) return;
    this.stuckToPaddle = false;

    // Launch angle slightly tilted based on offset
    const angleRatio = this.stuckOffset / (paddle.width / 2);
    const angle = angleRatio * 0.45; // Max ~25 degrees on launch

    this.vx = this.speed * Math.sin(angle);
    this.vy = -this.speed * Math.cos(angle);
  }

  update(dt, paddle, powerupManager, particleEngine, audioEngine) {
    // If stuck to paddle, follow it
    if (this.stuckToPaddle) {
      this.x = paddle.x + paddle.width / 2 + this.stuckOffset;
      this.y = paddle.y - this.radius - 1;
      return;
    }

    // Speed adjustments (slow motion powerup)
    const isSlow = powerupManager && powerupManager.hasEffect('slow');
    const targetSpeed = isSlow ? this.baseSpeed * 0.65 : this.baseSpeed;
    const currentSpeed = Math.hypot(this.vx, this.vy);
    if (currentSpeed > 0) {
      const scale = targetSpeed / currentSpeed;
      this.vx *= scale;
      this.vy *= scale;
    }

    // Update trail
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTrail) {
      this.trail.shift();
    }

    // Position integration
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Wall collisions (Left & Right)
    if (this.x - this.radius <= 0) {
      this.x = this.radius;
      this.vx = Math.abs(this.vx);
      if (audioEngine) audioEngine.playWallHit();
      if (particleEngine) particleEngine.addSparks(this.x, this.y, '#00f0ff');
    } else if (this.x + this.radius >= this.canvasWidth) {
      this.x = this.canvasWidth - this.radius;
      this.vx = -Math.abs(this.vx);
      if (audioEngine) audioEngine.playWallHit();
      if (particleEngine) particleEngine.addSparks(this.x, this.y, '#00f0ff');
    }

    // Top wall collision
    if (this.y - this.radius <= 0) {
      this.y = this.radius;
      this.vy = Math.abs(this.vy);
      if (audioEngine) audioEngine.playWallHit();
      if (particleEngine) particleEngine.addSparks(this.x, this.y, '#00f0ff');
    }

    // Bottom safety shield barrier check
    if (powerupManager && powerupManager.hasEffect('shield')) {
      if (this.y + this.radius >= this.canvasHeight - 10) {
        this.y = this.canvasHeight - 10 - this.radius;
        this.vy = -Math.abs(this.vy);
        powerupManager.consumeShield();
        if (audioEngine) audioEngine.playShieldHit();
        if (particleEngine) {
          particleEngine.triggerShake(8, 0.25);
          particleEngine.addSparks(this.x, this.y, '#9d00ff', 20);
          particleEngine.addFloatingText('SHIELD SAVED!', this.x, this.y - 30, '#9d00ff');
        }
      }
    }

    // Paddle collision
    if (
      this.vy > 0 &&
      this.y + this.radius >= paddle.y &&
      this.y - this.radius <= paddle.y + paddle.height &&
      this.x >= paddle.x - this.radius &&
      this.x <= paddle.x + paddle.width + this.radius
    ) {
      // Calculate normalized bounce angle based on hit location
      const paddleCenter = paddle.x + paddle.width / 2;
      const offset = (this.x - paddleCenter) / (paddle.width / 2); // -1 to 1
      const clampedOffset = Math.max(-0.95, Math.min(0.95, offset));

      // Maximum angle is 65 degrees (1.13 radians)
      const maxAngle = 65 * (Math.PI / 180);
      const angle = clampedOffset * maxAngle;

      const currentMag = Math.hypot(this.vx, this.vy);
      this.vx = currentMag * Math.sin(angle);
      this.vy = -currentMag * Math.cos(angle);
      this.y = paddle.y - this.radius - 1;

      if (audioEngine) audioEngine.playPaddleHit(clampedOffset);
      if (particleEngine) particleEngine.addSparks(this.x, this.y, '#00f0ff', 6);
    }
  }

  isDead() {
    return this.y - this.radius > this.canvasHeight;
  }

  draw(ctx, powerupManager) {
    ctx.save();
    const isFire = powerupManager && powerupManager.hasEffect('fireball');
    const ballColor = isFire ? '#ff4500' : '#ffffff';
    const glowColor = isFire ? '#ff2200' : '#00f0ff';

    // Draw comet trail
    for (let i = 0; i < this.trail.length; i++) {
      const pt = this.trail[i];
      const alpha = (i + 1) / (this.trail.length + 1) * 0.45;
      const size = this.radius * (alpha * 0.8 + 0.3);

      ctx.fillStyle = glowColor;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw Ball
    ctx.globalAlpha = 1;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = isFire ? 18 : 12;

    ctx.fillStyle = ballColor;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Inner bright core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.x - 2, this.y - 2, this.radius * 0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
