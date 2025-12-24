/**
 * HighlightController - Manages highlighting between grid and clues
 */
import { gameState } from '../models/GameState.js';

export class HighlightController {
  constructor(gridRenderer, clueRenderer) {
    this.gridRenderer = gridRenderer;
    this.clueRenderer = clueRenderer;
    this.setupListeners();
  }

  setupListeners() {
    // When a cell is selected, highlight its words in grid and clues
    gameState.on('cellSelected', ({ words }) => {
      this.gridRenderer.clearHighlights();
      words.forEach(word => {
        this.gridRenderer.highlightWord(word);
      });
    });

    // When a clue is selected, highlight its word in grid
    gameState.on('wordSelected', (word) => {
      this.gridRenderer.clearHighlights();
      this.gridRenderer.highlightWord(word);
    });

    // Clear highlights when selection is cleared
    gameState.on('selectionCleared', () => {
      this.gridRenderer.clearHighlights();
      this.clueRenderer.clearHighlights();
    });
  }
}
