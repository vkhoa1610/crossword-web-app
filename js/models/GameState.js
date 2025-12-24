/**
 * GameState - Central state manager with event emitter pattern
 * Manages grid, words, letter pool, and selected states
 */
export class GameState {
  constructor() {
    this.reset();
    this.listeners = new Map();
  }

  reset() {
    this.width = 0;
    this.height = 0;
    this.cells = []; // 2D array of CellModel
    this.words = []; // Array of WordModel
    this.letterPool = []; // Available letters
    this.selectedCell = null; // { row, col }
    this.selectedWord = null; // WordModel reference
    this.isChecked = false;
  }

  // Event emitter methods
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) callbacks.splice(index, 1);
  }

  emit(event, data) {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event).forEach(cb => cb(data));
  }

  // Grid setup
  setGrid(width, height, cells) {
    this.width = width;
    this.height = height;
    this.cells = cells;
    this.emit('gridChanged', { width, height, cells });
  }

  setWords(words) {
    this.words = words;
    this.emit('wordsChanged', words);
  }

  setLetterPool(letters) {
    this.letterPool = [...letters];
    this.emit('letterPoolChanged', this.letterPool);
  }

  // Letter pool operations
  removeFromPool(letter) {
    const index = this.letterPool.indexOf(letter);
    if (index > -1) {
      this.letterPool.splice(index, 1);
      this.emit('letterPoolChanged', this.letterPool);
      return true;
    }
    return false;
  }

  addToPool(letter) {
    this.letterPool.push(letter);
    this.emit('letterPoolChanged', this.letterPool);
  }

  // Cell operations
  getCell(row, col) {
    if (row >= 0 && row < this.height && col >= 0 && col < this.width) {
      return this.cells[row][col];
    }
    return null;
  }

  setCellInput(row, col, letter) {
    const cell = this.getCell(row, col);
    if (cell && !cell.isBlack) {
      const oldInput = cell.userInput;
      cell.setUserInput(letter);
      this.emit('cellChanged', { row, col, cell, oldInput });
      return oldInput;
    }
    return null;
  }

  clearCellInput(row, col) {
    const cell = this.getCell(row, col);
    if (cell && !cell.isBlack) {
      const oldInput = cell.userInput;
      cell.clearInput();
      this.emit('cellChanged', { row, col, cell, oldInput });
      return oldInput;
    }
    return null;
  }

  // Selection
  selectCell(row, col) {
    this.selectedCell = { row, col };
    const cell = this.getCell(row, col);
    // Find words containing this cell
    const relatedWords = this.words.filter(w => w.cells.includes(cell));
    this.emit('cellSelected', { row, col, cell, words: relatedWords });
  }

  selectWord(word) {
    this.selectedWord = word;
    this.emit('wordSelected', word);
  }

  clearSelection() {
    this.selectedCell = null;
    this.selectedWord = null;
    this.emit('selectionCleared');
  }

  // Validation
  checkAnswers() {
    this.isChecked = true;
    const results = this.words.map(word => ({
      word,
      isCorrect: word.validate()
    }));
    this.emit('answersChecked', results);
    return results;
  }

  clearValidation() {
    this.isChecked = false;
    this.cells.forEach(row => row.forEach(cell => cell.resetStatus()));
    this.emit('validationCleared');
  }

  // Get words by direction
  getAcrossWords() {
    return this.words
      .filter(w => w.direction === 'across')
      .sort((a, b) => a.clueNumber - b.clueNumber);
  }

  getDownWords() {
    return this.words
      .filter(w => w.direction === 'down')
      .sort((a, b) => a.clueNumber - b.clueNumber);
  }
}

// Singleton instance
export const gameState = new GameState();
