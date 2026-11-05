/**
 * Level Definitions & Procedural Generator for BRICKER.
 * 
 * Brick Types:
 * 0 = Empty
 * 1 = Standard Neon Brick (1 Hit)
 * 2 = Reinforced Brick (2 Hits)
 * 3 = Armored Brick (3 Hits)
 * 4 = TNT Explosive Brick (Clears 3x3 surrounding zone)
 * 5 = Mystery Brick (Guaranteed Power-up drop)
 */

export const BRICK_COLORS = {
  1: ['#00f0ff', '#ff007f', '#00ff88', '#9d00ff', '#ffd700'], // Neon spectrum
  2: '#3a86ff', // Reinforced Blue
  3: '#b5179e', // Armored Purple
  4: '#ff3344', // Explosive Red TNT
  5: '#ffbe0b'  // Mystery Gold
};

export const LEVELS = [
  {
    name: "Sector 1: Neon Dawn",
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 5, 1, 1, 1, 1, 1, 1, 5, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 4, 1, 1, 4, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0]
    ]
  },
  {
    name: "Sector 2: Crystal Fortress",
    grid: [
      [3, 3, 3, 2, 2, 2, 2, 3, 3, 3],
      [3, 2, 1, 1, 5, 5, 1, 1, 2, 3],
      [2, 1, 4, 1, 2, 2, 1, 4, 1, 2],
      [2, 1, 1, 1, 1, 1, 1, 1, 1, 2],
      [0, 2, 2, 0, 0, 0, 0, 2, 2, 0]
    ]
  },
  {
    name: "Sector 3: Detonation Grid",
    grid: [
      [4, 1, 1, 4, 1, 1, 4, 1, 1, 4],
      [1, 2, 2, 1, 2, 2, 1, 2, 2, 1],
      [1, 2, 5, 2, 4, 4, 2, 5, 2, 1],
      [4, 1, 2, 1, 2, 2, 1, 2, 1, 4],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
  },
  {
    name: "Sector 4: Space Invader",
    grid: [
      [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
      [0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
      [0, 0, 3, 3, 3, 3, 3, 3, 0, 0],
      [0, 2, 2, 5, 2, 2, 5, 2, 2, 0],
      [1, 1, 4, 1, 1, 1, 1, 4, 1, 1],
      [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
      [0, 1, 0, 1, 1, 1, 1, 0, 1, 0]
    ]
  },
  {
    name: "Sector 5: Quantum Core",
    grid: [
      [3, 2, 1, 1, 4, 4, 1, 1, 2, 3],
      [2, 3, 2, 1, 5, 5, 1, 2, 3, 2],
      [1, 2, 3, 2, 1, 1, 2, 3, 2, 1],
      [1, 1, 2, 3, 4, 4, 3, 2, 1, 1],
      [2, 3, 2, 1, 5, 5, 1, 2, 3, 2],
      [3, 2, 1, 1, 1, 1, 1, 1, 2, 3]
    ]
  },
  {
    name: "Sector 6: The Citadel",
    grid: [
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      [3, 4, 2, 2, 5, 5, 2, 2, 4, 3],
      [3, 2, 1, 1, 2, 2, 1, 1, 2, 3],
      [3, 2, 1, 4, 1, 1, 4, 1, 2, 3],
      [3, 5, 1, 1, 1, 1, 1, 1, 5, 3],
      [0, 3, 3, 2, 2, 2, 2, 3, 3, 0]
    ]
  }
];

export function generateProceduralLevel(levelIndex) {
  const rows = Math.min(5 + Math.floor(levelIndex / 2), 8);
  const cols = 10;
  const grid = [];

  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      const rand = Math.random();
      if (rand < 0.15) {
        row.push(0); // Empty
      } else if (rand < 0.55) {
        row.push(1); // Standard
      } else if (rand < 0.75) {
        row.push(2); // Reinforced
      } else if (rand < 0.88) {
        row.push(3); // Armored
      } else if (rand < 0.94) {
        row.push(4); // TNT
      } else {
        row.push(5); // Mystery
      }
    }
    grid.push(row);
  }

  return {
    name: `Sector ${levelIndex + 1}: Infinite Anomaly`,
    grid
  };
}

export function parseLevelGrid(grid, canvasWidth = 800) {
  const bricks = [];
  const cols = 10;
  const brickWidth = 68;
  const brickHeight = 22;
  const gapX = 10;
  const gapY = 10;
  const totalWidth = cols * brickWidth + (cols - 1) * gapX;
  const offsetX = (canvasWidth - totalWidth) / 2;
  const offsetY = 50;

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const type = grid[r][c];
      if (type === 0) continue;

      let maxHits = 1;
      let score = 100;
      let color = BRICK_COLORS[1][r % BRICK_COLORS[1].length];

      if (type === 2) {
        maxHits = 2;
        score = 250;
        color = BRICK_COLORS[2];
      } else if (type === 3) {
        maxHits = 3;
        score = 500;
        color = BRICK_COLORS[3];
      } else if (type === 4) {
        maxHits = 1;
        score = 300;
        color = BRICK_COLORS[4];
      } else if (type === 5) {
        maxHits = 1;
        score = 200;
        color = BRICK_COLORS[5];
      }

      bricks.push({
        id: `${r}-${c}`,
        row: r,
        col: c,
        type,
        x: offsetX + c * (brickWidth + gapX),
        y: offsetY + r * (brickHeight + gapY),
        width: brickWidth,
        height: brickHeight,
        hitsLeft: maxHits,
        maxHits,
        score,
        color,
        destroyed: false
      });
    }
  }

  return bricks;
}
