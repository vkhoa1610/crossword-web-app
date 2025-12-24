/**
 * WordModel - Represents a word placed in the crossword grid
 * Contains word info, position, direction, and cell references
 */
export class WordModel {
  constructor(id, word, definition, row, col, direction) {
    this.id = id;
    this.word = word.toUpperCase();
    this.definition = definition;
    this.row = row;
    this.col = col;
    this.direction = direction; // 'across' or 'down'
    this.clueNumber = null;
    this.cells = []; // References to CellModel instances
  }

  get length() {
    return this.word.length;
  }

  getCellPositions() {
    const positions = [];
    for (let i = 0; i < this.length; i++) {
      const r = this.direction === 'down' ? this.row + i : this.row;
      const c = this.direction === 'across' ? this.col + i : this.col;
      positions.push({ row: r, col: c, char: this.word[i] });
    }
    return positions;
  }

  validate() {
    return this.cells.every(cell => cell.userInput === cell.correctChar);
  }

  getUserWord() {
    return this.cells.map(cell => cell.userInput || ' ').join('');
  }

  toJSON() {
    return {
      id: this.id,
      word: this.word,
      definition: this.definition,
      row: this.row,
      col: this.col,
      direction: this.direction,
      clueNumber: this.clueNumber,
      cells: this.cells.map(cell => cell.toJSON()),
    };
  }
}
