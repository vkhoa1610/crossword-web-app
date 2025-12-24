/**
 * ClueRenderer - Renders the Across and Down clue sections
 */
import { gameState } from '../models/GameState.js';

export class ClueRenderer {
  constructor(acrossContainerId, downContainerId) {
    this.acrossContainer = document.getElementById(acrossContainerId);
    this.downContainer = document.getElementById(downContainerId);
    this.onClueClick = null;
    this.setupListeners();
  }

  setupListeners() {
    gameState.on('wordsChanged', () => this.render());
    gameState.on('wordSelected', (word) => this.highlightClue(word));
    gameState.on('cellSelected', ({ words }) => this.highlightCluesForWords(words));
    gameState.on('selectionCleared', () => this.clearHighlights());
  }

  setOnClueClick(callback) {
    this.onClueClick = callback;
  }

  render() {
    this.renderClueList(this.acrossContainer, gameState.getAcrossWords(), 'across');
    this.renderClueList(this.downContainer, gameState.getDownWords(), 'down');
  }

  renderClueList(container, words, direction) {
    container.innerHTML = '';

    const ul = document.createElement('ul');
    ul.className = 'clue-list';

    words.forEach(word => {
      const li = document.createElement('li');
      li.className = 'clue-list__item';
      li.dataset.clueNumber = word.clueNumber;
      li.dataset.direction = direction;
      li.innerHTML = `<span class="clue-list__number">${word.clueNumber}.</span> ${word.definition}`;

      li.addEventListener('click', () => {
        if (this.onClueClick) {
          this.onClueClick(word.clueNumber, direction);
        }
        gameState.selectWord(word);
      });

      ul.appendChild(li);
    });

    container.appendChild(ul);
  }

  highlightClue(word) {
    this.clearHighlights();
    
    const container = word.direction === 'across' ? this.acrossContainer : this.downContainer;
    const li = container.querySelector(`[data-clue-number="${word.clueNumber}"]`);
    if (li) {
      li.classList.add('clue-list__item--highlighted');
    }
  }

  highlightCluesForWords(words) {
    this.clearHighlights();
    
    words.forEach(word => {
      const container = word.direction === 'across' ? this.acrossContainer : this.downContainer;
      const li = container.querySelector(`[data-clue-number="${word.clueNumber}"]`);
      if (li) {
        li.classList.add('clue-list__item--highlighted');
      }
    });
  }

  clearHighlights() {
    const allItems = document.querySelectorAll('.clue-list__item--highlighted');
    allItems.forEach(item => item.classList.remove('clue-list__item--highlighted'));
  }
}
