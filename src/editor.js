/**
 * Built-in Interactive Level Editor for BRICKER.
 * Clean alphanumeric markers with zero emojis.
 */
import { BRICK_COLORS } from './levels.js';

export class LevelEditor {
  constructor(canvas, onPlayCustomLevel) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onPlayCustomLevel = onPlayCustomLevel;

    this.rows = 8;
    this.cols = 10;
    this.brickWidth = 68;
    this.brickHeight = 22;
    this.gapX = 10;
    this.gapY = 10;
    this.totalWidth = this.cols * this.brickWidth + (this.cols - 1) * this.gapX;
    this.offsetX = (this.canvas.width - this.totalWidth) / 2;
    this.offsetY = 40;

    this.selectedType = 1;
    this.isMouseDown = false;

    // Initialize blank grid
    this.grid = Array(this.rows).fill(null).map(() => Array(this.cols).fill(0));

    this.initEvents();
    this.render();
  }

  setSelectedType(type) {
    this.selectedType = parseInt(type, 10);
  }

  initEvents() {
    this.canvas.addEventListener('mousedown', (e) => {
      this.isMouseDown = true;
      this.handlePaint(e);
    });

    window.addEventListener('mouseup', () => {
      this.isMouseDown = false;
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isMouseDown) {
        this.handlePaint(e);
      }
    });
  }

  handlePaint(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Find grid row and col
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const bx = this.offsetX + c * (this.brickWidth + this.gapX);
        const by = this.offsetY + r * (this.brickHeight + this.gapY);

        if (x >= bx && x <= bx + this.brickWidth && y >= by && y <= by + this.brickHeight) {
          this.grid[r][c] = this.selectedType;
          this.render();
          return;
        }
      }
    }
  }

  clear() {
    this.grid = Array(this.rows).fill(null).map(() => Array(this.cols).fill(0));
    this.render();
  }

  exportJSON() {
    const jsonStr = JSON.stringify(this.grid, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
      alert("Sector configuration JSON copied to clipboard.");
    }).catch(() => {
      prompt("Copy sector configuration JSON:", jsonStr);
    });
  }

  importJSON() {
    const input = prompt("Paste sector configuration JSON grid:");
    if (!input) return;
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed) && parsed.length > 0) {
        this.grid = parsed;
        this.rows = parsed.length;
        this.render();
      } else {
        alert("Invalid sector data format.");
      }
    } catch (err) {
      alert("Failed to parse JSON: " + err.message);
    }
  }

  play() {
    const hasBricks = this.grid.some(row => row.some(cell => cell > 0));
    if (!hasBricks) {
      alert("Please construct at least one defense brick before simulating.");
      return;
    }
    if (this.onPlayCustomLevel) {
      this.onPlayCustomLevel({
        name: "Custom Sector",
        grid: JSON.parse(JSON.stringify(this.grid))
      });
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const bx = this.offsetX + c * (this.brickWidth + this.gapX);
        const by = this.offsetY + r * (this.brickHeight + this.gapY);
        const type = this.grid[r][c];

        if (type === 0) {
          this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(bx, by, this.brickWidth, this.brickHeight);
        } else {
          let color = BRICK_COLORS[1][r % BRICK_COLORS[1].length];
          let label = '';
          if (type === 2) { color = BRICK_COLORS[2]; label = '2'; }
          if (type === 3) { color = BRICK_COLORS[3]; label = '3'; }
          if (type === 4) { color = BRICK_COLORS[4]; label = 'TNT'; }
          if (type === 5) { color = BRICK_COLORS[5]; label = 'POW'; }

          this.ctx.save();
          this.ctx.shadowColor = color;
          this.ctx.shadowBlur = 6;
          this.ctx.fillStyle = color;
          this.ctx.fillRect(bx, by, this.brickWidth, this.brickHeight);

          if (label) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '700 10px Orbitron, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(label, bx + this.brickWidth / 2, by + this.brickHeight / 2);
          }
          this.ctx.restore();
        }
      }
    }
  }
}
