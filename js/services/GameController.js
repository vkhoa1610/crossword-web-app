/**
 * GameController - Core game logic controller
 * Manages game flow, letter placement, and validation
 */
import { gameState } from '../models/GameState.js';
import { dictionaryService } from './DictionaryService.js';
import { gridGenerator } from './GridGenerator.js';

export class GameController {
  constructor() {
    this.minWords = 4;
    this.maxWords = 6;
    this.maxAttempts = 50;
  }

  async initialize() {
    await dictionaryService.load();
  }

  async startNewGame() {
    gameState.reset();
    
    let puzzle = null;
    let attempts = 0;

    // Try generating until we get a good puzzle
    while (!puzzle && attempts < this.maxAttempts) {
      attempts++;
      console.log(attempts);
      // Random word count between min and max
      const wordCount = Math.floor(Math.random() * (this.maxWords - this.minWords + 1)) + this.minWords;
      const words = dictionaryService.getRandomWords(wordCount + 4); // Get extra for fallback
      
      puzzle = gridGenerator.generate(words);
      
      // Validate puzzle has enough words
      if (puzzle && puzzle.words.length < this.minWords) {
        puzzle = null;
      }
    }

    if (!puzzle) {
      throw new Error('Failed to generate puzzle after maximum attempts');
    }

    // Update game state
    gameState.setGrid(puzzle.width, puzzle.height, puzzle.cells);
    gameState.setWords(puzzle.words);
    gameState.setLetterPool(puzzle.letterPool);

    return puzzle;
  }

  placeLetter(row, col, letter) {
    const cell = gameState.getCell(row, col);
    if (!cell || cell.isBlack) return false;

    // If cell already has input, return it to pool
    if (cell.userInput) {
      gameState.addToPool(cell.userInput);
    }

    // Remove letter from pool and place in cell
    const removed = gameState.removeFromPool(letter.toUpperCase());
    if (removed) {
      gameState.setCellInput(row, col, letter.toUpperCase());
      return true;
    }
    return false;
  }

  moveLetterBetweenCells(fromRow, fromCol, toRow, toCol) {
    const fromCell = gameState.getCell(fromRow, fromCol);
    const toCell = gameState.getCell(toRow, toCol);

    if (!fromCell || !toCell || fromCell.isBlack || toCell.isBlack) {
      return false;
    }

    if (!fromCell.userInput) return false;

    const letter = fromCell.userInput;

    // If target has letter, return it to pool
    if (toCell.userInput) {
      gameState.addToPool(toCell.userInput);
    }

    // Move letter
    gameState.clearCellInput(fromRow, fromCol);
    gameState.setCellInput(toRow, toCol, letter);

    return true;
  }

  removeLetter(row, col) {
    const oldLetter = gameState.clearCellInput(row, col);
    if (oldLetter) {
      gameState.addToPool(oldLetter);
      return true;
    }
    return false;
  }

  selectCell(row, col) {
    gameState.selectCell(row, col);
  }

  selectClue(clueNumber, direction) {
    const word = gameState.words.find(
      w => w.clueNumber === clueNumber && w.direction === direction
    );
    if (word) {
      gameState.selectWord(word);
    }
  }

  checkAnswers() {
    return gameState.checkAnswers();
  }

  resetGame() {
    return this.startNewGame();
  }

  // Get current state info
  getAcrossClues() {
    return gameState.getAcrossWords();
  }

  getDownClues() {
    return gameState.getDownWords();
  }
}

// Singleton instance
export const gameController = new GameController();
