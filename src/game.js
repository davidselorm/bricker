/**
 * Core Tactical Game Engine for BRICKER.
 * Zero emojis. Gamepad API, Combo Gauge, Moving Hazards & Dynamic Warp.
 */
import { Paddle } from './paddle.js';
import { Ball } from './ball.js';
import { ParticleEngine } from './particles.js';
import { PowerupManager } from './powerups.js';
import { LEVELS, parseLevelGrid, generateProceduralLevel, BRICK_COLORS } from './levels.js';
import { audio } from './audio.js';

export const GAME_STATES = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  LEVEL_CLEAR: 'LEVEL_CLEAR',
  GAMEOVER: 'GAMEOVER',
  VICTORY: 'VICTORY'
};

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;

    this.state = GAME_STATES.MENU;
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('bricker_highscore') || '0', 10);
    this.lives = 4;
    this.maxLives = 5;
    this.currentLevelIndex = 0;
    this.combo = 1;
    this.maxComboInLevel = 1;
    this.bricksBrokenInLevel = 0;
    this.totalBricksBroken = 0;
    this.levelStartTime = 0;

    this.customLevel = null;

    // Subsystems
    this.paddle = new Paddle(this.width, this.height);
    this.balls = [];
    this.particles = new ParticleEngine(this.width, this.height);
    this.powerups = new PowerupManager();
    this.bricks = [];

    // Keys pressed
    this.keys = {};

    this.initInputs();
  }

  initInputs() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      if (e.code === 'KeyP' || e.code === 'Escape') {
        this.togglePause();
      }

      if (e.code === 'KeyM') {
        const soundOn = audio.toggleSound();
        const btn = document.getElementById('btn-sound');
        if (btn) btn.classList.toggle('muted', !soundOn);
      }

      if (e.code === 'KeyN') {
        const musicOn = audio.toggleMusic();
        const btn = document.getElementById('btn-music');
        if (btn) btn.classList.toggle('muted', !musicOn);
      }

      if (e.code === 'Space') {
        if (this.state === GAME_STATES.PLAYING) {
          this.balls.forEach(b => b.launch(this.paddle));
          if (this.powerups.hasEffect('laser')) {
            this.paddle.fireLaser(audio);
          }
        }
      }

      if (e.code === 'Enter') {
        if (this.state === GAME_STATES.LEVEL_CLEAR) {
          this.nextLevel();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Mouse movement
    this.canvas.addEventListener('mousemove', (e) => {
      if (this.state !== GAME_STATES.PLAYING) return;
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.width / rect.width;
      const mouseX = (e.clientX - rect.left) * scaleX;
      this.paddle.setTargetX(mouseX);
    });

    // Mouse click
    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0 && this.state === GAME_STATES.PLAYING) {
        this.balls.forEach(b => b.launch(this.paddle));
        if (this.powerups.hasEffect('laser')) {
          this.paddle.fireLaser(audio);
        }
      }
    });

    // Touch support
    this.canvas.addEventListener('touchmove', (e) => {
      if (this.state !== GAME_STATES.PLAYING) return;
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const scaleX = this.width / rect.width;
      const touchX = (touch.clientX - rect.left) * scaleX;
      this.paddle.setTargetX(touchX);
    }, { passive: false });

    this.canvas.addEventListener('touchstart', (e) => {
      if (this.state !== GAME_STATES.PLAYING) return;
      this.balls.forEach(b => b.launch(this.paddle));
      if (this.powerups.hasEffect('laser')) {
        this.paddle.fireLaser(audio);
      }
    });
  }

  pollGamepad(dt) {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    if (!gamepads) return;

    for (const gp of gamepads) {
      if (!gp) continue;

      // Stick X
      const stickX = gp.axes[0] || 0;
      if (Math.abs(stickX) > 0.15) {
        this.paddle.targetX += stickX * this.paddle.speed * dt;
        this.paddle.targetX = Math.max(0, Math.min(this.width - this.paddle.width, this.paddle.targetX));
      }

      // D-Pad
      if (gp.buttons[14]?.pressed) this.paddle.moveLeft(dt);
      if (gp.buttons[15]?.pressed) this.paddle.moveRight(dt);

      // A Button (0) or Right Trigger (7)
      if (gp.buttons[0]?.pressed || gp.buttons[7]?.pressed) {
        this.balls.forEach(b => b.launch(this.paddle));
        if (this.powerups.hasEffect('laser')) {
          this.paddle.fireLaser(audio);
        }
      }

      // Start Button (9)
      if (gp.buttons[9]?.pressed) {
        this.togglePause();
      }
      break;
    }
  }

  startNewGame(levelIndex = 0) {
    this.score = 0;
    this.lives = 4;
    this.currentLevelIndex = levelIndex;
    this.customLevel = null;
    this.totalBricksBroken = 0;
    this.loadLevel(this.currentLevelIndex);
    this.setState(GAME_STATES.PLAYING);
  }

  playCustomLevel(customLevelData) {
    this.score = 0;
    this.lives = 4;
    this.customLevel = customLevelData;
    this.loadLevelData(customLevelData);
    this.setState(GAME_STATES.PLAYING);
  }

  loadLevel(index) {
    let levelData;
    if (index < LEVELS.length) {
      levelData = LEVELS[index];
    } else {
      levelData = generateProceduralLevel(index);
    }
    this.loadLevelData(levelData);
  }

  loadLevelData(levelData) {
    this.combo = 1;
    this.maxComboInLevel = 1;
    this.bricksBrokenInLevel = 0;
    this.levelStartTime = performance.now();

    this.powerups.clear();
    this.particles.clear();
    this.paddle.reset();

    // Spawn initial ball
    const ball = new Ball(this.width, this.height);
    ball.attachToPaddle(this.paddle);
    this.balls = [ball];

    // Build bricks
    this.bricks = parseLevelGrid(levelData.grid, this.width);

    this.updateHUD();
  }

  nextLevel() {
    if (this.customLevel) {
      this.setState(GAME_STATES.MENU);
      return;
    }
    this.currentLevelIndex++;
    if (this.currentLevelIndex >= LEVELS.length) {
      this.setState(GAME_STATES.VICTORY);
      audio.playLevelComplete();
    } else {
      this.loadLevel(this.currentLevelIndex);
      this.setState(GAME_STATES.PLAYING);
    }
  }

  togglePause() {
    if (this.state === GAME_STATES.PLAYING) {
      this.setState(GAME_STATES.PAUSED);
    } else if (this.state === GAME_STATES.PAUSED) {
      this.setState(GAME_STATES.PLAYING);
    }
  }

  setState(newState) {
    this.state = newState;

    const screens = {
      [GAME_STATES.MENU]: 'screen-menu',
      [GAME_STATES.PAUSED]: 'screen-pause',
      [GAME_STATES.LEVEL_CLEAR]: 'screen-clear',
      [GAME_STATES.GAMEOVER]: 'screen-gameover',
      [GAME_STATES.VICTORY]: 'screen-victory'
    };

    document.querySelectorAll('.overlay-screen').forEach(el => {
      if (el.id !== 'screen-editor' && el.id !== 'screen-levels' && el.id !== 'screen-guide') {
        el.classList.remove('active');
      }
    });

    if (screens[newState]) {
      const activeEl = document.getElementById(screens[newState]);
      if (activeEl) activeEl.classList.add('active');
    }

    if (newState === GAME_STATES.LEVEL_CLEAR) {
      const durationSec = Math.max(1, Math.round((performance.now() - this.levelStartTime) / 1000));
      const timeBonus = Math.max(0, 1000 - durationSec * 15);
      this.score += timeBonus;

      document.getElementById('clear-score').textContent = this.score;
      document.getElementById('clear-combo').textContent = `x${this.maxComboInLevel}`;
      document.getElementById('clear-time').textContent = `+${timeBonus} (${durationSec}s)`;
      this.saveHighScore();
    }

    if (newState === GAME_STATES.GAMEOVER) {
      document.getElementById('gameover-score').textContent = this.score;
      document.getElementById('gameover-bricks').textContent = this.totalBricksBroken;
      document.getElementById('gameover-highscore').textContent = this.highScore;
      audio.playGameOver();
      this.saveHighScore();
    }

    if (newState === GAME_STATES.VICTORY) {
      document.getElementById('victory-score').textContent = this.score;
      this.saveHighScore();
    }
  }

  saveHighScore() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('bricker_highscore', this.highScore.toString());
      const menuHs = document.getElementById('menu-high-score-val');
      if (menuHs) menuHs.textContent = this.highScore;
    }
  }

  update(dt) {
    if (this.state !== GAME_STATES.PLAYING) return;

    // Gamepad controller input
    this.pollGamepad(dt);

    // Keyboard paddle control
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
      this.paddle.moveLeft(dt);
    }
    if (this.keys['ArrowRight'] || this.keys['KeyD']) {
      this.paddle.moveRight(dt);
    }

    // Update paddle
    this.paddle.update(dt, this.powerups);

    // Update moving hazard bricks
    for (const b of this.bricks) {
      if (b.moving && !b.destroyed) {
        b.moveOffset += b.moveDir * dt * 40;
        if (Math.abs(b.moveOffset) > b.moveRange) {
          b.moveDir *= -1;
        }
        b.x = b.baseX + b.moveOffset;
      }
    }

    // Update balls
    for (let i = this.balls.length - 1; i >= 0; i--) {
      const ball = this.balls[i];
      ball.update(dt, this.paddle, this.powerups, this.particles, audio);

      // Check ball collisions with bricks
      this.handleBallBrickCollisions(ball);

      // Check ball death
      if (ball.isDead()) {
        this.balls.splice(i, 1);
      }
    }

    // Check laser beam collisions with bricks
    this.handleLaserCollisions();

    // Check if all balls were lost
    if (this.balls.length === 0) {
      this.lives--;
      this.combo = 1;
      audio.playLifeLost();
      this.particles.triggerShake(10, 0.35);

      if (this.lives <= 0) {
        this.setState(GAME_STATES.GAMEOVER);
        return;
      } else {
        const ball = new Ball(this.width, this.height);
        ball.attachToPaddle(this.paddle);
        this.balls = [ball];
      }
    }

    // Update power-up drops & timers
    this.powerups.update(dt, this.paddle, (type, x, y) => {
      audio.playPowerupCollect();
      this.particles.addFloatingText(`[${type.label}]`, x, y, type.color);
      this.particles.addSparks(x, y, type.color, 15);

      if (type.id === 'multiball') {
        this.spawnMultiBalls();
      } else if (type.id === 'life') {
        if (this.lives < this.maxLives) {
          this.lives++;
        }
      }
    });

    // Update FX & Warp Starfield
    this.particles.update(dt, this.combo);

    // Check level complete
    const remainingBricks = this.bricks.filter(b => !b.destroyed);
    if (remainingBricks.length === 0) {
      this.setState(GAME_STATES.LEVEL_CLEAR);
      audio.playLevelComplete();
      this.particles.addCelebration(this.width, this.height);
    }

    this.updateHUD();
  }

  spawnMultiBalls() {
    const newBalls = [];
    for (const b of this.balls) {
      if (b.stuckToPaddle) continue;
      [-0.45, 0.45].forEach(angleOffset => {
        const extraBall = new Ball(this.width, this.height);
        extraBall.x = b.x;
        extraBall.y = b.y;
        extraBall.speed = b.speed;
        extraBall.stuckToPaddle = false;

        const currentAngle = Math.atan2(b.vx, -b.vy);
        const newAngle = currentAngle + angleOffset;
        extraBall.vx = b.speed * Math.sin(newAngle);
        extraBall.vy = -b.speed * Math.cos(newAngle);
        newBalls.push(extraBall);
      });
    }
    this.balls.push(...newBalls);
  }

  handleBallBrickCollisions(ball) {
    if (ball.stuckToPaddle) return;
    const isFireball = this.powerups.hasEffect('fireball');

    for (const brick of this.bricks) {
      if (brick.destroyed) continue;

      const closestX = Math.max(brick.x, Math.min(ball.x, brick.x + brick.width));
      const closestY = Math.max(brick.y, Math.min(ball.y, brick.y + brick.height));
      const distX = ball.x - closestX;
      const distY = ball.y - closestY;
      const distSq = distX * distX + distY * distY;

      if (distSq <= ball.radius * ball.radius) {
        this.damageBrick(brick, isFireball ? 99 : 1);
        ball.accelerate(1.012);

        if (!isFireball) {
          const overlapX = ball.radius - Math.abs(distX);
          const overlapY = ball.radius - Math.abs(distY);

          if (overlapX < overlapY) {
            ball.vx = distX > 0 ? Math.abs(ball.vx) : -Math.abs(ball.vx);
          } else {
            ball.vy = distY > 0 ? Math.abs(ball.vy) : -Math.abs(ball.vy);
          }
          break;
        }
      }
    }
  }

  handleLaserCollisions() {
    for (let i = this.paddle.lasers.length - 1; i >= 0; i--) {
      const laser = this.paddle.lasers[i];
      let hit = false;

      for (const brick of this.bricks) {
        if (brick.destroyed) continue;

        if (
          laser.x + laser.width >= brick.x &&
          laser.x <= brick.x + brick.width &&
          laser.y <= brick.y + brick.height &&
          laser.y + laser.height >= brick.y
        ) {
          this.damageBrick(brick, 1);
          this.particles.addSparks(laser.x, laser.y, '#ff007f', 8);
          hit = true;
          break;
        }
      }

      if (hit) {
        this.paddle.lasers.splice(i, 1);
      }
    }
  }

  damageBrick(brick, damage = 1) {
    brick.hitsLeft -= damage;

    if (brick.hitsLeft <= 0) {
      brick.destroyed = true;
      this.bricksBrokenInLevel++;
      this.totalBricksBroken++;

      this.combo++;
      if (this.combo > this.maxComboInLevel) {
        this.maxComboInLevel = this.combo;
      }

      const points = brick.score * this.combo;
      this.score += points;

      this.particles.addFloatingText(
        `+${points}`,
        brick.x + brick.width / 2,
        brick.y,
        brick.color
      );

      if (brick.type === 4) {
        audio.playTntExplosion();
        this.particles.addTntExplosion(brick.x + brick.width / 2, brick.y + brick.height / 2);
        this.triggerTntExplosion(brick);
      } else {
        audio.playBrickHit(this.combo);
        audio.playBrickExplode();
        this.particles.addBrickExplosion(brick.x, brick.y, brick.width, brick.height, brick.color);
      }

      if (brick.type === 5) {
        this.powerups.spawnDrop(brick.x + brick.width / 2, brick.y + brick.height / 2);
      } else if (Math.random() < 0.22) {
        this.powerups.spawnDrop(brick.x + brick.width / 2, brick.y + brick.height / 2);
      }
    } else {
      audio.playBrickHit(this.combo);
      this.particles.addSparks(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.color, 6);
    }
  }

  triggerTntExplosion(tntBrick) {
    const explosionRadius = 110;
    const centerX = tntBrick.x + tntBrick.width / 2;
    const centerY = tntBrick.y + tntBrick.height / 2;

    for (const b of this.bricks) {
      if (b === tntBrick || b.destroyed) continue;
      const bx = b.x + b.width / 2;
      const by = b.y + b.height / 2;
      const dist = Math.hypot(bx - centerX, by - centerY);

      if (dist <= explosionRadius) {
        this.damageBrick(b, 3);
      }
    }
  }

  draw() {
    const shake = this.particles.getShakeOffset();
    this.ctx.save();
    this.ctx.translate(shake.x, shake.y);

    this.ctx.clearRect(-20, -20, this.width + 40, this.height + 40);

    // Draw Warp Stars
    this.particles.drawBackgroundStars(this.ctx);

    // Draw Cyberpunk Floor Lines
    this.drawBackgroundGrid();

    // Draw Kinetic Shield Floor
    if (this.powerups.hasEffect('shield')) {
      this.drawSafetyShield();
    }

    // Draw Bricks
    this.drawBricks();

    // Draw Power-ups
    this.powerups.draw(this.ctx);

    // Draw Paddle
    this.paddle.draw(this.ctx, this.powerups);

    // Draw Balls
    for (const ball of this.balls) {
      ball.draw(this.ctx, this.powerups);
    }

    // Draw Particles & Floating numbers
    this.particles.draw(this.ctx);

    this.ctx.restore();
  }

  drawBackgroundGrid() {
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
    this.ctx.lineWidth = 1;

    for (let y = 0; y < this.height; y += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  drawSafetyShield() {
    this.ctx.save();
    this.ctx.strokeStyle = '#9d00ff';
    this.ctx.lineWidth = 4;
    this.ctx.shadowColor = '#9d00ff';
    this.ctx.shadowBlur = 15;

    const y = this.height - 12;
    this.ctx.beginPath();
    this.ctx.moveTo(0, y);
    this.ctx.lineTo(this.width, y);
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawBricks() {
    for (const b of this.bricks) {
      if (b.destroyed) continue;

      this.ctx.save();
      this.ctx.shadowColor = b.color;
      this.ctx.shadowBlur = 8;
      this.ctx.fillStyle = b.color;

      this.ctx.beginPath();
      this.ctx.roundRect(b.x, b.y, b.width, b.height, 4);
      this.ctx.fill();

      // Top shine
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      this.ctx.beginPath();
      this.ctx.roundRect(b.x + 2, b.y + 2, b.width - 4, 3, 2);
      this.ctx.fill();

      // Fracture cracks
      if (b.hitsLeft < b.maxHits) {
        this.ctx.strokeStyle = '#050510';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(b.x + 8, b.y + 4);
        this.ctx.lineTo(b.x + b.width / 2, b.y + b.height - 4);
        this.ctx.lineTo(b.x + b.width - 10, b.y + 8);
        this.ctx.stroke();
      }

      // Alphanumeric Labels
      if (b.type === 4 || b.type === 5) {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '700 10px Orbitron, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(b.type === 4 ? 'TNT' : 'POW', b.x + b.width / 2, b.y + b.height / 2 + 1);
      }

      this.ctx.restore();
    }
  }

  updateHUD() {
    // Score
    const scoreEl = document.getElementById('score-val');
    if (scoreEl) scoreEl.textContent = this.score;

    // Combo
    const comboEl = document.getElementById('combo-val');
    if (comboEl) comboEl.textContent = `x${this.combo}`;

    // Combo meter bar
    const meterBar = document.getElementById('combo-meter-bar');
    if (meterBar) {
      const fillPct = Math.min(100, (this.combo / 10) * 100);
      meterBar.style.width = `${fillPct}%`;
    }

    // Sector
    const levelEl = document.getElementById('level-val');
    if (levelEl) {
      levelEl.textContent = this.customLevel ? 'CUSTOM' : (this.currentLevelIndex + 1);
    }

    // Shield Cells (Lives)
    const livesBox = document.getElementById('lives-icons');
    if (livesBox) {
      livesBox.innerHTML = '';
      for (let i = 0; i < this.maxLives; i++) {
        const cell = document.createElement('span');
        cell.className = `energy-cell ${i >= this.lives ? 'depleted' : ''}`;
        livesBox.appendChild(cell);
      }
    }

    // Active power-up pills
    const tray = document.getElementById('powerup-tray');
    if (tray) {
      tray.innerHTML = '';
      for (const [id, timeLeft] of this.powerups.activeEffects.entries()) {
        const pill = document.createElement('div');
        pill.className = 'powerup-pill';
        const label = id.toUpperCase();
        const durationText = timeLeft < 9000 ? ` [${Math.ceil(timeLeft)}s]` : '';
        pill.textContent = `${label}${durationText}`;
        pill.style.color = '#fff';
        pill.style.borderColor = '#00f0ff';
        pill.style.background = 'rgba(0, 240, 255, 0.2)';
        tray.appendChild(pill);
      }
    }
  }
}
