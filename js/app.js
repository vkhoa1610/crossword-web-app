/**
 * App Entry Point
 * Initializes all modules and starts the game
 */
import { gameController } from './services/GameController.js';
import { GridRenderer } from './ui/GridRenderer.js';
import { ClueRenderer } from './ui/ClueRenderer.js';
import { LetterPoolRenderer } from './ui/LetterPoolRenderer.js';
import { DragDropHandler } from './ui/DragDropHandler.js';
import { HighlightController } from './ui/HighlightController.js';
import { ClickFillHandler } from './ui/ClickFillHandler.js';

class CrosswordApp {
  constructor() {
    this.gridRenderer = null;
    this.clueRenderer = null;
    this.letterPoolRenderer = null;
    this.dragDropHandler = null;
    this.highlightController = null;
    this.clickFillHandler = null;
    this.isPinned = false;
  }

  async init() {
    try {
      // Initialize renderers
      this.gridRenderer = new GridRenderer('grid-container');
      this.clueRenderer = new ClueRenderer('across-clues', 'down-clues');
      this.letterPoolRenderer = new LetterPoolRenderer('letter-pool');

      // Initialize interaction handlers
      this.dragDropHandler = new DragDropHandler(
        this.gridRenderer,
        this.letterPoolRenderer
      );
      this.highlightController = new HighlightController(
        this.gridRenderer,
        this.clueRenderer
      );
      
      // Initialize click-to-fill handler
      this.clickFillHandler = new ClickFillHandler();

      // Set up clue click handler
      this.clueRenderer.setOnClueClick((clueNumber, direction) => {
        gameController.selectClue(clueNumber, direction);
      });

      // Set up button handlers
      this.setupButtons();
      
      // Set up pin button
      this.setupPinButton();

      // Initialize game controller and start
      await gameController.initialize();
      await gameController.startNewGame();

      console.log('Crossword App initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Crossword App:', error);
      this.showError('Failed to load the game. Please refresh the page.');
    }
  }

  setupButtons() {
    const checkBtn = document.getElementById('btn-check');
    const resetBtn = document.getElementById('btn-reset');

    checkBtn.addEventListener('click', () => {
      gameController.checkAnswers();
    });

    resetBtn.addEventListener('click', async () => {
      resetBtn.disabled = true;
      resetBtn.textContent = 'Loading...';
      
      try {
        await gameController.resetGame();
      } catch (error) {
        console.error('Reset failed:', error);
      } finally {
        resetBtn.disabled = false;
        resetBtn.textContent = '↻ New Game';
      }
    });
  }

  setupPinButton() {
    const pinBtn = document.getElementById('btn-pin');
    const wrapper = document.querySelector('.letter-pool-wrapper');
    
    if (!pinBtn || !wrapper) return;

    pinBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.isPinned = !this.isPinned;
      
      if (this.isPinned) {
        wrapper.classList.add('is-pinned');
        pinBtn.classList.add('is-active');
        pinBtn.textContent = '📍';
        pinBtn.title = 'Unpin panel';
      } else {
        wrapper.classList.remove('is-pinned');
        pinBtn.classList.remove('is-active');
        pinBtn.textContent = '📌';
        pinBtn.title = 'Pin panel open';
      }
    });
  }

  showError(message) {
    const container = document.getElementById('grid-container');
    container.innerHTML = `
      <div class="status-message status-message--error">
        ${message}
      </div>
    `;
  }
}

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new CrosswordApp();
  app.init();
});

