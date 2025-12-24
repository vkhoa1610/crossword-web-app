/**
 * CellModel - Represents a single cell in the crossword grid
 * Tracks position, correct answer, user input, and state
 */
export class CellModel {
  constructor(row, col, correctChar = null) {
    this.row = row;
    this.col = col;
    this.correctChar = correctChar;
    this.userInput = "";
    this.status = "empty"; // empty, filled, correct, incorrect
    this.isBlack = correctChar === null;
    this.clueNumber = null;
    this.wordIds = []; // IDs of words this cell belongs to
  }

  setUserInput(char) {
    this.userInput = char.toUpperCase();
    this.status = this.userInput ? "filled" : "empty";
  }

  clearInput() {
    this.userInput = "";
    this.status = "empty";
  }

  validate() {
    if (!this.userInput) {
      this.status = "empty";
      return false;
    }
    const isCorrect = this.userInput === this.correctChar;
    this.status = isCorrect ? "correct" : "incorrect";
    return isCorrect;
  }

  resetStatus() {
    this.status = this.userInput ? "filled" : "empty";
  }

  toJSON() {
    return {
      row: this.row,
      col: this.col,
      correctChar: this.correctChar,
      userInput: this.userInput,
      status: this.status,
      isBlack: this.isBlack,
      clueNumber: this.clueNumber,
      wordIds: this.wordIds,
    };
  }
}
