/**
 * DictionaryService - Loads and manages the word dictionary
 */
export class DictionaryService {
  constructor() {
    this.words = [];
    this.loaded = false;
  }

  async load(path = './data/dictionary.json') {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to load dictionary: ${response.status}`);
      }
      const data = await response.json();
      this.words = data.words.map(w => ({
        word: w.word.toUpperCase(),
        definition: w.definition
      }));
      this.loaded = true;
      return this.words;
    } catch (error) {
      console.error('DictionaryService load error:', error);
      throw error;
    }
  }

  getRandomWords(count) {
    if (!this.loaded || this.words.length === 0) {
      throw new Error('Dictionary not loaded');
    }
    
    // Shuffle and take first 'count' words
    const shuffled = [...this.words].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  getWordsByLength(minLength, maxLength) {
    return this.words.filter(w => 
      w.word.length >= minLength && w.word.length <= maxLength
    );
  }
}

// Singleton instance
export const dictionaryService = new DictionaryService();
