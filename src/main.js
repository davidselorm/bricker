/**
 * Entry Point for BRICKER.
 */
import { Game, GAME_STATES } from './game.js';
import { LevelEditor } from './editor.js';
import { LEVELS } from './levels.js';
import { audio } from './audio.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  const editorCanvas = document.getElementById('editor-canvas');

  const game = new Game(canvas);

  // Setup Level Editor
  const editor = new LevelEditor(editorCanvas, (customLevelData) => {
    // Hide editor modal and launch custom game
    document.getElementById('screen-editor').classList.remove('active');
    game.playCustomLevel(customLevelData);
  });

  // Display initial high score
  const menuHs = document.getElementById('menu-high-score-val');
  if (menuHs) menuHs.textContent = game.highScore;

  // Build Level Selection cards
  const levelGrid = document.getElementById('level-grid');
  if (levelGrid) {
    levelGrid.innerHTML = '';
    LEVELS.forEach((lvl, idx) => {
      const card = document.createElement('div');
      card.className = 'level-card';
      card.innerHTML = `<strong>Sector ${idx + 1}</strong><br><small style="color:#7f8ca3">${lvl.name.split(': ')[1]}</small>`;
      card.addEventListener('click', () => {
        document.getElementById('screen-levels').classList.remove('active');
        game.startNewGame(idx);
      });
      levelGrid.appendChild(card);
    });
  }

  // --- UI BUTTON LISTENERS ---

  // Main Menu Buttons
  document.getElementById('btn-start')?.addEventListener('click', () => {
    game.startNewGame(0);
  });

  document.getElementById('btn-level-select')?.addEventListener('click', () => {
    document.getElementById('screen-levels').classList.add('active');
  });

  document.getElementById('btn-levels-back')?.addEventListener('click', () => {
    document.getElementById('screen-levels').classList.remove('active');
  });

  document.getElementById('btn-how-to-play')?.addEventListener('click', () => {
    document.getElementById('screen-guide').classList.add('active');
  });

  document.getElementById('btn-guide-back')?.addEventListener('click', () => {
    document.getElementById('screen-guide').classList.remove('active');
  });

  // Level Editor Buttons
  document.getElementById('btn-editor')?.addEventListener('click', () => {
    document.getElementById('screen-editor').classList.add('active');
    editor.render();
  });

  document.getElementById('btn-editor-exit')?.addEventListener('click', () => {
    document.getElementById('screen-editor').classList.remove('active');
  });

  document.getElementById('btn-editor-play')?.addEventListener('click', () => {
    editor.play();
  });

  document.getElementById('btn-editor-clear')?.addEventListener('click', () => {
    editor.clear();
  });

  document.getElementById('btn-editor-export')?.addEventListener('click', () => {
    editor.exportJSON();
  });

  document.getElementById('btn-editor-import')?.addEventListener('click', () => {
    editor.importJSON();
  });

  // Editor Palette Buttons
  document.querySelectorAll('.palette-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.palette-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      editor.setSelectedType(btn.dataset.type);
    });
  });

  // Pause Screen Buttons
  document.getElementById('btn-pause')?.addEventListener('click', () => {
    game.togglePause();
  });

  document.getElementById('btn-resume')?.addEventListener('click', () => {
    game.togglePause();
  });

  document.getElementById('btn-restart')?.addEventListener('click', () => {
    game.loadLevel(game.currentLevelIndex);
    game.setState(GAME_STATES.PLAYING);
  });

  document.getElementById('btn-quit')?.addEventListener('click', () => {
    game.setState(GAME_STATES.MENU);
  });

  // Level Clear Button
  document.getElementById('btn-next-level')?.addEventListener('click', () => {
    game.nextLevel();
  });

  // Game Over Buttons
  document.getElementById('btn-retry')?.addEventListener('click', () => {
    game.startNewGame(game.currentLevelIndex);
  });

  document.getElementById('btn-gameover-menu')?.addEventListener('click', () => {
    game.setState(GAME_STATES.MENU);
  });

  // Victory Buttons
  document.getElementById('btn-victory-replay')?.addEventListener('click', () => {
    game.startNewGame(0);
  });

  document.getElementById('btn-victory-menu')?.addEventListener('click', () => {
    game.setState(GAME_STATES.MENU);
  });

  // Sound and Music Toggles
  const btnSound = document.getElementById('btn-sound');
  btnSound?.addEventListener('click', () => {
    const on = audio.toggleSound();
    btnSound.textContent = on ? '🔊' : '🔇';
  });

  const btnMusic = document.getElementById('btn-music');
  btnMusic?.addEventListener('click', () => {
    const on = audio.toggleMusic();
    btnMusic.textContent = on ? '🎵' : '🔇';
  });

  // --- GAME LOOP ---
  let lastTime = performance.now();

  function gameLoop(currentTime) {
    const dt = Math.min((currentTime - lastTime) / 1000, 0.1); // Clamp dt to prevent spiral
    lastTime = currentTime;

    game.update(dt);
    game.draw();

    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);
});
