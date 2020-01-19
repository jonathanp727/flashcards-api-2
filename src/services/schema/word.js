import WordStats from '../lib/stats/word';
import Card from '../lib/card';
import { ObjectId } from 'mongodb';

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
  this.card = withCard ? new Card() : null;
}

Word.prototype = {
  constructor: Word,
  // Function to be called before saving a User to db.  Transforms all data
  // to necessary formats as stored in db
  prepareForDb: function () {
    this.userId = ObjectId(this.userId);
  }
}

export default Word;
