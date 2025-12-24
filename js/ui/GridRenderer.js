/**
 * GridRenderer - Renders the crossword grid
 */
import { gameState } from '../models/GameState.js';

export class GridRenderer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.cellElements = [];
    this.setupListeners();
  }

  setupListeners() {
    gameState.on('gridChanged', () => this.render());
    gameState.on('cellChanged', ({ row, col, cell }) => this.updateCell(row, col, cell));
    gameState.on('answersChecked', (results) => this.showResults(results));
    gameState.on('validationCleared', () => this.clearResults());
  }

  render() {
    this.container.innerHTML = '';
    this.cellElements = [];

    const table = document.createElement('table');
    table.className = 'crossword-grid';
    table.id = 'crossword-table';

    for (let r = 0; r < gameState.height; r++) {
      const tr = document.createElement('tr');
      this.cellElements[r] = [];

      for (let c = 0; c < gameState.width; c++) {
        const cell = gameState.cells[r][c];
        const td = this.createCellElement(cell, r, c);
        tr.appendChild(td);
        this.cellElements[r][c] = td;
      }

      table.appendChild(tr);
    }

    this.container.appendChild(table);
  }

  createCellElement(cell, row, col) {
    const td = document.createElement('td');
    td.dataset.row = row;
    td.dataset.col = col;

    if (cell.isBlack) {
      td.className = 'cell cell--black';
    } else {
      td.className = 'cell cell--white';
      td.setAttribute('data-droppable', 'true');

      // Clue number
      if (cell.clueNumber) {
        const numSpan = document.createElement('span');
        numSpan.className = 'cell__number';
        numSpan.textContent = cell.clueNumber;
        td.appendChild(numSpan);
      }

      // Letter content
      const letterSpan = document.createElement('span');
      letterSpan.className = 'cell__letter';
      letterSpan.textContent = cell.userInput || '';
      letterSpan.dataset.letter = cell.userInput || '';
      td.appendChild(letterSpan);

      // Click handler
      td.addEventListener('click', () => {
        gameState.selectCell(row, col);
      });
    }

    return td;
  }

  updateCell(row, col, cell) {
    const td = this.cellElements[row]?.[col];
    if (!td || cell.isBlack) return;

    const letterSpan = td.querySelector('.cell__letter');
    if (letterSpan) {
      letterSpan.textContent = cell.userInput || '';
      letterSpan.dataset.letter = cell.userInput || '';
    }

    // Update draggable state
    td.setAttribute('data-has-letter', cell.userInput ? 'true' : 'false');
  }

  showResults(results) {
    // Clear previous results
    this.clearResults();

    results.forEach(({ word, isCorrect }) => {
      word.cells.forEach(cell => {
        const td = this.cellElements[cell.row]?.[cell.col];
        if (td) {
          td.classList.add(isCorrect ? 'cell--correct' : 'cell--incorrect');
        }
      });
    });
  }

  clearResults() {
    for (let r = 0; r < this.cellElements.length; r++) {
      for (let c = 0; c < this.cellElements[r].length; c++) {
        const td = this.cellElements[r][c];
        td.classList.remove('cell--correct', 'cell--incorrect');
      }
    }
  }

  highlightWord(word) {
    // Clear previous highlights
    this.clearHighlights();
    
    word.cells.forEach(cell => {
      const td = this.cellElements[cell.row]?.[cell.col];
      if (td) {
        td.classList.add('cell--highlighted');
      }
    });
  }

  clearHighlights() {
    for (let r = 0; r < this.cellElements.length; r++) {
      for (let c = 0; c < this.cellElements[r].length; c++) {
        const td = this.cellElements[r][c];
        td.classList.remove('cell--highlighted');
      }
    }
  }

  getCellElement(row, col) {
    return this.cellElements[row]?.[col];
  }
}
