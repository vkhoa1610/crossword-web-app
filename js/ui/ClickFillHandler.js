/**
 * ClickFillHandler - Handles click-to-fill and double-click-to-remove
 * Allows users to select a cell, then click a letter to fill it
 */
import { gameState } from '../models/GameState.js';
import { gameController } from '../services/GameController.js';

export class ClickFillHandler {
  constructor() {
    this.selectedCell = null;
    this.setupListeners();
  }

  setupListeners() {
    // Listen for cell selection from GameState
    gameState.on('cellSelected', ({ row, col }) => {
      this.selectCell(row, col);
    });

    // Listen for grid changes to clear selection if game resets
    gameState.on('gridChanged', () => {
      this.clearSelection();
    });

    // Set up letter pool click handler
    this.setupLetterPoolClicks();

    // Set up double-click on cells
    this.setupCellDoubleClick();
  }

  selectCell(row, col) {
    const cell = gameState.cells[row]?.[col];
    if (!cell || cell.isBlack) return;

    // Clear previous visual selection
    this.clearVisualSelection();

    this.selectedCell = { row, col };

    // Add visual selection to the cell
    const cellEl = document.querySelector(`td[data-row="${row}"][data-col="${col}"]`);
    if (cellEl) {
      cellEl.classList.add('cell--selected');
    }
  }

  clearSelection() {
    this.clearVisualSelection();
    this.selectedCell = null;
  }

  clearVisualSelection() {
    document.querySelectorAll('.cell--selected').forEach(el => {
      el.classList.remove('cell--selected');
    });
  }

  setupLetterPoolClicks() {
    const letterPool = document.getElementById('letter-pool');
    if (!letterPool) return;

    letterPool.addEventListener('click', (e) => {
      const tile = e.target.closest('.letter-tile');
      if (!tile) return;

      // If we have a selected cell, fill it with this letter
      if (this.selectedCell) {
        const letter = tile.dataset.letter;
        const { row, col } = this.selectedCell;
        
        // Check if cell already has a letter - if so, return it first
        const cell = gameState.cells[row]?.[col];
        if (cell && cell.userInput) {
          gameController.removeLetter(row, col);
        }
        
        // Place the new letter
        gameController.placeLetter(row, col, letter);
        
        // Clear selection after placing
        this.clearSelection();
      }
    });
  }

  setupCellDoubleClick() {
    const gridContainer = document.getElementById('grid-container');
    if (!gridContainer) return;

    gridContainer.addEventListener('dblclick', (e) => {
      const cell = e.target.closest('.cell--white');
      if (!cell) return;

      const row = parseInt(cell.dataset.row);
      const col = parseInt(cell.dataset.col);

      // Remove letter from this cell and return to pool
      const cellData = gameState.cells[row]?.[col];
      if (cellData && cellData.userInput) {
        gameController.removeLetter(row, col);
        this.clearSelection();
      }
    });
  }
}
