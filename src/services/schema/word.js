import WordStats from '../lib/stats/word';
import Card from '../lib/card';

// Default word schema to be used whenever creating a new word in the db
function Word({ userId, wordId, jlpt = null, withCard = false }) {
  this.userId = userId,
  this.wordId = wordId,
  this.jlpt = jlpt,
  this.auxiliaryData = {
    sentences: [],
    notes: "",
  };
  this.stats = new WordStats();
  if (withCard) this.card = new Card();
}

export default Word;
