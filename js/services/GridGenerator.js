/**
 * GridGenerator - Generates crossword puzzle grids
 * Places words with valid intersections
 */
import { CellModel } from '../models/CellModel.js';
import { WordModel } from '../models/WordModel.js';

export class GridGenerator {
  constructor() {
    this.grid = new Map(); // Map<row, Map<col, char>>
    this.placedWords = [];
    this.wordIdCounter = 0;
  }

  reset() {
    this.grid = new Map();
    this.placedWords = [];
    this.wordIdCounter = 0;
  }

  /**
   * Generate a crossword puzzle from given words
   * @param {Array} words - Array of {word, definition}
   * @returns {Object} - { cells, words, width, height, letterPool }
   */
  generate(words) {
    this.reset();
    const MAX_ACROSS = 10;
    // Sort by length descending for better placement
    const sortedWords = [...words].sort((a, b) => b.word.length - a.word.length);
    
    // Place first word horizontally at origin
    if (sortedWords.length > 0) {
      const firstWord = sortedWords[0];
      const direction =
        firstWord.word.length > MAX_ACROSS ? 'down' : 'across';
      this.placeWord(firstWord, 0, 0, direction);
    }

    // Try to place remaining words
    for (let i = 1; i < sortedWords.length; i++) {
      const placements = this.findPossiblePlacements(sortedWords[i].word);
      
      if (placements.length > 0) {
        // Sort by number of intersections (prefer more connections)
        placements.sort((a, b) => b.intersections - a.intersections);
        const best = placements[0];
        this.placeWord(sortedWords[i], best.row, best.col, best.direction);
      }
    }

    return this.buildResult();
  }

  placeWord(wordData, row, col, direction) {
    const word = wordData.word.toUpperCase();
    const wordModel = new WordModel(
      this.wordIdCounter++,
      word,
      wordData.definition,
      row,
      col,
      direction
    );
    // Place each character in grid
    for (let i = 0; i < word.length; i++) {
      const r = direction === 'down' ? row + i : row;
      const c = direction === 'across' ? col + i : col;
      
      if (!this.grid.has(r)) {
        this.grid.set(r, new Map());
      }
      this.grid.get(r).set(c, word[i]);
    }

    this.placedWords.push(wordModel);
    return wordModel;
  }

  findPossiblePlacements(word) {
    const placements = [];
    const MAX_COL = 10;
    word = word.toUpperCase();

    // Iterate over all placed characters
    for (const [r, rowMap] of this.grid.entries()) {
      for (const [c, existingChar] of rowMap.entries()) {
        // Check each position in the new word
        for (let i = 0; i < word.length; i++) {
          if (word[i] !== existingChar) continue;
          const acrossStartCol = c - i;
          // Try placing horizontally (across)
          if (word.length <= MAX_COL &&
            acrossStartCol >= 0 &&
            acrossStartCol + word.length <= MAX_COL) {
            const acrossStart = { row: r, col: c - i };
            if (this.canPlace(word, acrossStart.row, acrossStart.col, 'across')) {
              const intersections = this.countIntersections(word, acrossStart.row, acrossStart.col, 'across');
              if (intersections > 0) {
                placements.push({
                  row: acrossStart.row,
                  col: acrossStart.col,
                  direction: 'across',
                  intersections
                });
              }
            }
          }


          // Try placing vertically (down)
          const downStart = { row: r - i, col: c };
          if (this.canPlace(word, downStart.row, downStart.col, 'down')) {
            const intersections = this.countIntersections(word, downStart.row, downStart.col, 'down');
            if (intersections > 0) {
              placements.push({
                row: downStart.row,
                col: downStart.col,
                direction: 'down',
                intersections
              });
            }
          }
        }
      }
    }

    return placements;
  }

  canPlace(word, row, col, direction) {
    for (let i = 0; i < word.length; i++) {
      const r = direction === 'down' ? row + i : row;
      const c = direction === 'across' ? col + i : col;
      
      // Check if position conflicts with existing character
      if (this.grid.has(r) && this.grid.get(r).has(c)) {
        if (this.grid.get(r).get(c) !== word[i]) {
          return false;
        }
      } else {
        // Check adjacent cells for parallel words
        if (!this.checkAdjacent(r, c, direction, i, word.length)) {
          return false;
        }
      }
    }
    
    // Check cells before and after the word
    const beforeR = direction === 'down' ? row - 1 : row;
    const beforeC = direction === 'across' ? col - 1 : col;
    const afterR = direction === 'down' ? row + word.length : row;
    const afterC = direction === 'across' ? col + word.length : col;
    
    if (this.grid.has(beforeR) && this.grid.get(beforeR).has(beforeC)) {
      return false;
    }
    if (this.grid.has(afterR) && this.grid.get(afterR).has(afterC)) {
      return false;
    }
    
    return true;
  }

  checkAdjacent(row, col, direction, index, wordLength) {
    // For horizontal words, check above and below
    // For vertical words, check left and right
    if (direction === 'across') {
      const above = this.grid.get(row - 1)?.get(col);
      const below = this.grid.get(row + 1)?.get(col);
      if (above || below) return false;
    } else {
      const left = this.grid.get(row)?.get(col - 1);
      const right = this.grid.get(row)?.get(col + 1);
      if (left || right) return false;
    }
    return true;
  }

  countIntersections(word, row, col, direction) {
    let count = 0;
    for (let i = 0; i < word.length; i++) {
      const r = direction === 'down' ? row + i : row;
      const c = direction === 'across' ? col + i : col;
      
      if (this.grid.has(r) && this.grid.get(r).has(c)) {
        count++;
      }
    }
    return count;
  }

  buildResult() {
    if (this.placedWords.length === 0) {
      return null;
    }

    // Find grid bounds
    let minRow = Infinity, maxRow = -Infinity;
    let minCol = Infinity, maxCol = -Infinity;

    for (const [r, rowMap] of this.grid.entries()) {
      minRow = Math.min(minRow, r);
      maxRow = Math.max(maxRow, r);
      for (const c of rowMap.keys()) {
        minCol = Math.min(minCol, c);
        maxCol = Math.max(maxCol, c);
      }
    }

    const height = maxRow - minRow + 1;
    const width = maxCol - minCol + 1;

    // Create cell matrix
    const cells = [];
    for (let r = 0; r < height; r++) {
      cells[r] = [];
      for (let c = 0; c < width; c++) {
        const actualR = r + minRow;
        const actualC = c + minCol;
        const char = this.grid.get(actualR)?.get(actualC) || null;
        cells[r][c] = new CellModel(r, c, char);
      }
    }

    // Adjust word positions
    const adjustedWords = this.placedWords.map(w => {
      const newWord = new WordModel(
        w.id,
        w.word,
        w.definition,
        w.row - minRow,
        w.col - minCol,
        w.direction
      );
      return newWord;
    });

    // Assign clue numbers
    this.assignClueNumbers(cells, adjustedWords, width, height);

    // Link cells to words
    adjustedWords.forEach(word => {
      const positions = word.getCellPositions();
      positions.forEach(pos => {
        const cell = cells[pos.row][pos.col];
        cell.wordIds.push(word.id);
        word.cells.push(cell);
      });
    });

    // Collect all letters for pool
    const letterPool = [];
    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        if (cells[r][c].correctChar) {
          letterPool.push(cells[r][c].correctChar);
        }
      }
    }
    // Shuffle letter pool
    letterPool.sort(() => Math.random() - 0.5);

    return {
      cells,
      words: adjustedWords,
      width,
      height,
      letterPool
    };
  }

  assignClueNumbers(cells, words, width, height) {
    let clueNum = 1;
    
    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        const cell = cells[r][c];
        if (cell.isBlack) continue;

        // Check if this is start of any word
        const startsWord = words.some(w => w.row === r && w.col === c);
        
        if (startsWord) {
          cell.clueNumber = clueNum;
          // Assign to all words starting here
          words.forEach(w => {
            if (w.row === r && w.col === c) {
              w.clueNumber = clueNum;
            }
          });
          clueNum++;
        }
      }
    }
  }
}

// Singleton instance
export const gridGenerator = new GridGenerator();
