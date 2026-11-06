# BRICKER

> Tactical Neon Arcade Brick-Breaker engineered with pure Vanilla JavaScript, HTML5 Canvas, and procedural Web Audio API. Zero external runtime dependencies.

[![Live Demo](https://img.shields.io/badge/Demo-Vercel_Live-00f0ff?style=for-the-badge&logo=vercel)](https://bricker-gamma.vercel.app)

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-Canvas-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-Neon_Synthwave-1572B6?logo=css3&logoColor=white)
![Audio](https://img.shields.io/badge/Web_Audio-Procedural_Synth-9d00ff)
![Gamepad](https://img.shields.io/badge/Gamepad_API-Supported-00f0ff)
![License](https://img.shields.io/badge/License-MIT-00f0ff)

---

## Play Online

Play immediately in your browser: **[https://bricker-gamma.vercel.app](https://bricker-gamma.vercel.app)**

---

## Technical Highlights

- **Dynamic Spin & Rebound Physics:** Paddle movement speed imparts spin and tangential deflection to the energy sphere.
- **Warp Starfield & Pulse Grid:** Dynamic parallax starfield that accelerates as the combo multiplier increases.
- **Procedural Synthesizer:** Real-time polyphonic Web Audio API synthesis for bounces, shattered nodes, and escalating pentatonic musical combos without external audio assets.
- **7 Tactical Upgrades:** Multi-Ball, Plasma Cannons, Fireball Penetration, Broad Paddle, Kinetic Barrier Floor, Time Dilation, and Shield Cells.
- **Defensive Node Hierarchy:** Standard Neon (1-hit), Reinforced (2-hit), Armored (3-hit), Explosive TNT, and Mystery drops, plus oscillating hazard units in deep sectors.
- **Combo Multiplier Gauge:** Real-time HUD gauge tracking active score multipliers.
- **Built-in Sector Designer:** In-browser interactive grid editor with JSON export and import capabilities.
- **Universal Input:** Native support for Mouse, Touch, Keyboard, and Gamepad controllers (Xbox, PlayStation, USB).

---

## Controls Reference

| Function | Keyboard | Mouse / Touch | Gamepad |
| :--- | :--- | :--- | :--- |
| **Steer Paddle** | `<-` / `->` or `A` / `D` | Cursor horizontal move / Touch drag | Left Stick / D-Pad |
| **Launch Sphere / Plasma Cannons** | `Space` | Primary Click / Tap | Button A / Right Trigger |
| **Pause Simulation** | `P` or `Esc` | Pause HUD button | Start / Menu Button |
| **Toggle Sound Effects (SFX)** | `M` | SFX HUD button | - |
| **Toggle Synthesizer Music (BGM)**| `N` | BGM HUD button | - |

---

## Tactical Upgrades

| Code | Upgrade | Effect |
| :---: | :--- | :--- |
| `MLT` | **Multi-Ball** | Clones current sphere into 3 divergent projectiles |
| `LSR` | **Plasma Cannons** | Mounts twin rapid-fire laser blasters to paddle chassis |
| `FIR` | **Fireball** | Penetrates continuous brick structures without rebounding |
| `WID` | **Broad Paddle** | Increases defensive intercept width by 45% |
| `SHD` | **Kinetic Barrier** | Emergency floor forcefield absorbing lost spheres |
| `SLW` | **Time Dilation** | Decelerates sphere velocity for surgical precision |
| `LIF` | **Shield Cell** | Restores 1 depleted hull integrity cell |

---

## Defensive Node Types

- **Neon (1 Hit):** Standard tactical energy barriers in vibrant neon frequencies.
- **Reinforced (2 Hits):** Structural integrity cracks after initial contact before node collapse.
- **Armored (3 Hits):** High-density plating requiring concentrated repeated impacts.
- **TNT (Explosive):** Radial concussive wave demolishing adjacent nodes within blast radius.
- **Mystery (Power-up):** Guaranteed tactical upgrade delivery capsule upon node destruction.
- **Oscillating Hazard:** Moving defensive drone units in advanced sectors.

---

## Quick Start

### Direct Execution
Open `index.html` in any modern web browser or serve locally:
```bash
# Via Python
python -m http.server 8000

# Via npx
npx serve .
```

### Development Environment
```bash
# Install development tooling
npm install

# Launch Vite dev server
npm run dev

# Compile production bundle
npm run build
```

---

## Sector Designer

Access the **LEVEL DESIGNER** from the main menu:
1. Select node type (`Neon`, `Reinforced`, `Armored`, `TNT`, `Mystery`, or `Clear`).
2. Paint structures across the 10x8 matrix.
3. Select **SIMULATE** to instantly test the designed sector.
4. Export or import configurations using **EXPORT JSON** and **IMPORT JSON**.

---

## License

MIT License. Authored by [davidselorm](https://github.com/davidselorm).
