# 🧱 BRICKER

> **Neon Arcade Brick-Breaker** built with pure Vanilla JavaScript, HTML5 Canvas, and procedural Web Audio API. Zero external runtime dependencies.

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-Canvas-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-Neon_Synthwave-1572B6?logo=css3&logoColor=white)
![Audio](https://img.shields.io/badge/Web_Audio-Procedural_Synth-9d00ff)
![License](https://img.shields.io/badge/License-MIT-00f0ff)

---

## ⚡ Highlights

- **🕹️ Fluid Retro-Modern Physics:** Dynamic ball bounce angles, paddle curve deflection, and high-velocity collisions.
- **🔊 Procedural Web Audio Engine:** Synthesized chiptune sound effects and progressive pentatonic combo scales with zero external sound files.
- **✨ Vibrant Neon Visuals:** Particle explosion engine, screen shake, trail effects, scanlines, and floating score milestones.
- **🚀 7 Tactical Power-Ups:** Multi-ball, laser blasters, fireball penetration, wide paddle, safety shield floor, slow motion, and extra lives.
- **🧱 Varied Brick Types:** 1-hit Neon, 2-hit Reinforced, 3-hit Armored, explosive TNT chain reactions, and Mystery drop blocks.
- **🛠️ Built-in Level Designer:** Interactive grid editor allowing players to paint custom levels, test play instantly, and export/import JSON maps.
- **📱 Responsive & Touch-Ready:** Seamless keyboard, mouse, and mobile touch controls.

---

## 🎮 Controls

| Action | Keyboard | Mouse / Touch |
| :--- | :--- | :--- |
| **Move Paddle** | `←` / `→` or `A` / `D` | Move mouse / drag finger |
| **Launch Sphere / Fire Lasers** | `Space` | Left Click / Tap |
| **Pause Game** | `P` or `Esc` | Click `⏸` icon |
| **Toggle Sound Effects** | `M` | Click `🔊` icon |
| **Toggle Background Synth** | `N` | Click `🎵` icon |

---

## ⚡ Power-Up Arsenal

| Power-Up | Type | Description |
| :---: | :---: | :--- |
| **MULTI** | `⚡` | Spawns multiple angled energy balls |
| **LASER** | `🚀` | Mounts twin blasters to paddle (shoot with `Space` or Click) |
| **FIRE** | `🔥` | Sphere burns straight through all bricks without bouncing |
| **WIDE** | `↔️` | Expands paddle shield width by 45% |
| **BARRIER** | `🛡️` | Emergency energy floor at the bottom to absorb fallen balls |
| **SLOW** | `⏱️` | Decelerates balls for precision targeting |
| **LIFE** | `❤️` | Restores 1 lost shield integrity life |

---

## 🧱 Brick Types

- **Neon (1 Hit):** Standard colorful defensive blocks.
- **Reinforced (2 Hits):** Cracks on initial impact before shattering.
- **Armored (3 Hits):** Heavy plating requiring concentrated hits.
- **TNT (Explosive):** Detonates on impact, causing a blast radius that destroys adjacent bricks.
- **Mystery (?):** Guaranteed tactical power-up drop when destroyed.

---

## 🚀 Quick Start

### Option 1: Direct in Browser (No installation needed)
Simply open `index.html` in any modern web browser or serve via:
```bash
# Using Python
python -m http.server 8000

# Or using npx
npx serve .
```

### Option 2: Node.js / Vite Dev Server
```bash
# Install development tooling
npm install

# Start local dev server with hot reload
npm run dev
```

---

## 🛠️ Level Designer

Click **LEVEL EDITOR** on the main menu to:
1. Select a brick type from the palette (`Neon`, `Reinforced`, `Armored`, `TNT`, `Mystery`, or `Clear`).
2. Click and drag across the 10x8 grid to design your layout.
3. Click **TEST PLAY** to jump directly into your custom sector!
4. Use **EXPORT JSON** / **IMPORT JSON** to share maps with friends.

---

## 📄 License

MIT License. Created by [davidselorm](https://github.com/davidselorm).
