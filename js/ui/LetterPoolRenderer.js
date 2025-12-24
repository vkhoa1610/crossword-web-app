/**
 * LetterPoolRenderer - Renders the available letters pool
 */
import { gameState } from '../models/GameState.js';

export class LetterPoolRenderer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.countElement = document.getElementById('letter-count');
    this.setupListeners();
  }

  setupListeners() {
    gameState.on('letterPoolChanged', (letters) => this.render(letters));
  }

  render(letters = gameState.letterPool) {
    this.container.innerHTML = '';

    // Update count display
    if (this.countElement) {
      this.countElement.textContent = `${letters.length} remaining`;
    }

    letters.forEach((letter, index) => {
      const div = document.createElement('div');
      div.className = 'letter-tile';
      div.textContent = letter;
      div.draggable = true;
      div.dataset.letter = letter;
      div.dataset.index = index;
      div.dataset.source = 'pool';

      this.container.appendChild(div);
    });
  }

  getLetterElements() {
    return this.container.querySelectorAll('.letter-tile');
  }
}
