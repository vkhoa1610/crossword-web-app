/**
 * DragDropHandler - Handles drag and drop for desktop and touch for mobile
 */
import { gameState } from '../models/GameState.js';
import { gameController } from '../services/GameController.js';

export class DragDropHandler {
  constructor(gridRenderer, letterPoolRenderer) {
    this.gridRenderer = gridRenderer;
    this.letterPoolRenderer = letterPoolRenderer;
    this.poolContainer = letterPoolRenderer.container;
    this.gridContainer = gridRenderer.container;
    
    // Touch drag state
    this.draggedElement = null;
    this.dragClone = null;
    this.dragData = null;
    
    // Magnifier for touch
    this.magnifier = document.getElementById('drag-magnifier');
    this.magnifierCellClone = document.getElementById('magnifier-cell-clone');
    
    this.init();
  }

  init() {
    this.setupDesktopDragDrop();
    this.setupTouchDragDrop();
  }

  // ============ DESKTOP DRAG & DROP ============
  setupDesktopDragDrop() {
    // Pool letter drag start
    this.poolContainer.addEventListener('dragstart', (e) => {
      if (e.target.classList.contains('letter-tile')) {
        e.dataTransfer.setData('text/plain', e.target.dataset.letter);
        e.dataTransfer.setData('source', 'pool');
        e.target.classList.add('letter-tile--dragging');
      }
    });

    this.poolContainer.addEventListener('dragend', (e) => {
      if (e.target.classList.contains('letter-tile')) {
        e.target.classList.remove('letter-tile--dragging');
      }
    });

    // Grid cell drag start (for letters already in cells)
    this.gridContainer.addEventListener('dragstart', (e) => {
      const cell = e.target.closest('.cell--white');
      if (cell && cell.dataset.hasLetter === 'true') {
        const letter = cell.querySelector('.cell__letter').textContent;
        e.dataTransfer.setData('text/plain', letter);
        e.dataTransfer.setData('source', 'cell');
        e.dataTransfer.setData('fromRow', cell.dataset.row);
        e.dataTransfer.setData('fromCol', cell.dataset.col);
        cell.classList.add('cell--dragging');
      }
    });

    this.gridContainer.addEventListener('dragend', (e) => {
      const cell = e.target.closest('.cell--white');
      if (cell) {
        cell.classList.remove('cell--dragging');
      }
    });

    // Make cells with letters draggable
    gameState.on('cellChanged', ({ row, col, cell }) => {
      const td = this.gridRenderer.getCellElement(row, col);
      if (td && !cell.isBlack) {
        td.draggable = !!cell.userInput;
      }
    });

    // Grid drop handling
    this.gridContainer.addEventListener('dragover', (e) => {
      const cell = e.target.closest('.cell--white');
      if (cell) {
        e.preventDefault();
        cell.classList.add('cell--drag-over');
      }
    });

    this.gridContainer.addEventListener('dragleave', (e) => {
      const cell = e.target.closest('.cell--white');
      if (cell) {
        cell.classList.remove('cell--drag-over');
      }
    });

    this.gridContainer.addEventListener('drop', (e) => {
      e.preventDefault();
      const cell = e.target.closest('.cell--white');
      if (!cell) return;
      
      cell.classList.remove('cell--drag-over');
      
      const letter = e.dataTransfer.getData('text/plain');
      const source = e.dataTransfer.getData('source');
      const toRow = parseInt(cell.dataset.row);
      const toCol = parseInt(cell.dataset.col);

      if (source === 'pool') {
        gameController.placeLetter(toRow, toCol, letter);
      } else if (source === 'cell') {
        const fromRow = parseInt(e.dataTransfer.getData('fromRow'));
        const fromCol = parseInt(e.dataTransfer.getData('fromCol'));
        gameController.moveLetterBetweenCells(fromRow, fromCol, toRow, toCol);
      }
    });

    // Pool drop handling (return letter to pool)
    this.poolContainer.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.poolContainer.classList.add('letter-pool--drag-over');
    });

    this.poolContainer.addEventListener('dragleave', () => {
      this.poolContainer.classList.remove('letter-pool--drag-over');
    });

    this.poolContainer.addEventListener('drop', (e) => {
      e.preventDefault();
      this.poolContainer.classList.remove('letter-pool--drag-over');
      
      const source = e.dataTransfer.getData('source');
      if (source === 'cell') {
        const fromRow = parseInt(e.dataTransfer.getData('fromRow'));
        const fromCol = parseInt(e.dataTransfer.getData('fromCol'));
        gameController.removeLetter(fromRow, fromCol);
      }
    });
  }

  // ============ TOUCH DRAG & DROP ============
  setupTouchDragDrop() {
    // Pool letters touch
    this.poolContainer.addEventListener('touchstart', (e) => this.handleTouchStart(e, 'pool'), { passive: false });
    
    // Grid cells touch
    this.gridContainer.addEventListener('touchstart', (e) => this.handleTouchStart(e, 'cell'), { passive: false });
    
    document.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    document.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    document.addEventListener('touchcancel', () => this.cleanupDrag());
  }

  handleTouchStart(e, source) {
    let target;
    let letter;
    let fromRow, fromCol;

    if (source === 'pool') {
      target = e.target.closest('.letter-tile');
      if (!target) return;
      letter = target.dataset.letter;
    } else {
      target = e.target.closest('.cell--white');
      if (!target || target.dataset.hasLetter !== 'true') return;
      letter = target.querySelector('.cell__letter').textContent;
      fromRow = parseInt(target.dataset.row);
      fromCol = parseInt(target.dataset.col);
    }

    if (!letter) return;

    e.preventDefault();
    
    this.draggedElement = target;
    this.dragData = { letter, source, fromRow, fromCol };
    
    // Create visual clone
    this.createDragClone(target, e.touches[0]);
    target.classList.add('letter-tile--dragging', 'cell--dragging');
    
    // Show magnifier for touch
    this.showMagnifier(letter, e.touches[0]);
  }

  handleTouchMove(e) {
    if (!this.dragClone) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    this.dragClone.style.left = `${touch.clientX - 20}px`;
    this.dragClone.style.top = `${touch.clientY - 20}px`;

    // Temporarily hide drag clone to get element underneath
    this.dragClone.style.pointerEvents = 'none';
    const elementUnder = document.elementFromPoint(touch.clientX, touch.clientY);
    this.dragClone.style.pointerEvents = '';
    
    // Update magnifier to show target cell info
    this.updateMagnifierWithTarget(elementUnder, touch);

    // Highlight drop target
    this.updateDropHighlight(elementUnder);
  }

  handleTouchEnd(e) {
    if (!this.dragData) return;

    const touch = e.changedTouches[0];
    const elementUnder = document.elementFromPoint(touch.clientX, touch.clientY);
    
    // Determine drop target
    const cell = elementUnder?.closest('.cell--white');
    const pool = elementUnder?.closest('.letter-pool');

    if (cell) {
      const toRow = parseInt(cell.dataset.row);
      const toCol = parseInt(cell.dataset.col);
      
      if (this.dragData.source === 'pool') {
        gameController.placeLetter(toRow, toCol, this.dragData.letter);
      } else {
        gameController.moveLetterBetweenCells(
          this.dragData.fromRow, 
          this.dragData.fromCol, 
          toRow, 
          toCol
        );
      }
    } else if (pool && this.dragData.source === 'cell') {
      gameController.removeLetter(this.dragData.fromRow, this.dragData.fromCol);
    }

    this.cleanupDrag();
  }

  createDragClone(target, touch) {
    this.dragClone = document.createElement('div');
    this.dragClone.className = 'drag-clone';
    this.dragClone.textContent = this.dragData.letter;
    this.dragClone.style.left = `${touch.clientX - 20}px`;
    this.dragClone.style.top = `${touch.clientY - 20}px`;
    document.body.appendChild(this.dragClone);
  }

  updateDropHighlight(element) {
    // Remove previous highlights
    document.querySelectorAll('.cell--drag-over, .letter-pool--drag-over')
      .forEach(el => el.classList.remove('cell--drag-over', 'letter-pool--drag-over'));

    if (!element) return;

    const cell = element.closest('.cell--white');
    const pool = element.closest('.letter-pool');

    if (cell) {
      cell.classList.add('cell--drag-over');
    } else if (pool) {
      pool.classList.add('letter-pool--drag-over');
    }
  }

  cleanupDrag() {
    if (this.dragClone) {
      this.dragClone.remove();
      this.dragClone = null;
    }
    if (this.draggedElement) {
      this.draggedElement.classList.remove('letter-tile--dragging', 'cell--dragging');
      this.draggedElement = null;
    }
    this.dragData = null;

    // Hide magnifier
    this.hideMagnifier();

    document.querySelectorAll('.cell--drag-over, .letter-pool--drag-over')
      .forEach(el => el.classList.remove('cell--drag-over', 'letter-pool--drag-over'));
  }

  // ============ MAGNIFIER METHODS ============
  showMagnifier(letter, touch) {
    if (!this.magnifier || !this.magnifierCellClone) return;
    
    // Position offset above finger (80px up for larger magnifier)
    const x = touch.clientX;
    const y = touch.clientY - 85;
    
    this.magnifier.style.left = `${x}px`;
    this.magnifier.style.top = `${y}px`;
    this.magnifier.style.transform = 'translate(-50%, -50%)';
    
    // Show with active class
    this.magnifier.classList.add('is-active');
  }

  updateMagnifierWithTarget(elementUnder, touch) {
    if (!this.magnifier || !this.magnifier.classList.contains('is-active')) return;
    
    // Update position
    const x = touch.clientX;
    const y = touch.clientY - 85;
    
    this.magnifier.style.left = `${x}px`;
    this.magnifier.style.top = `${y}px`;
    
    // Check if hovering over a grid cell
    const targetCell = elementUnder?.closest('.cell');
    
    if (targetCell && this.magnifierCellClone) {
      // Clone the target cell visually
      this.magnifierCellClone.innerHTML = '';
      
      // Create a div instead of cloning the td directly to avoid invalid HTML nesting
      const cellClone = document.createElement('div');
      
      // Copy classes
      cellClone.className = targetCell.className;
      cellClone.classList.remove('cell--drag-over', 'cell--dragging');
      // Do NOT add cell--highlighted as it overrides the background color
      
      // Copy content (letters, numbers)
      cellClone.innerHTML = targetCell.innerHTML;
      
      // Explicitly copy important computed styles
      const computedStyle = window.getComputedStyle(targetCell);
      cellClone.style.backgroundColor = computedStyle.backgroundColor;
      cellClone.style.backgroundImage = computedStyle.backgroundImage; // For black cells with patterns
      cellClone.style.borderColor = computedStyle.borderColor;
      
      this.magnifierCellClone.appendChild(cellClone);
    }
  }

  hideMagnifier() {
    if (!this.magnifier) return;
    this.magnifier.classList.remove('is-active');
    
    // Clear cloned content
    if (this.magnifierCellClone) {
      this.magnifierCellClone.innerHTML = '';
    }
  }
}
