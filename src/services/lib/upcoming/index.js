import DictModel from '../../../models/dict';
import WordModel from '../../../models/word';

import { checkLimitIsFresh, markLimitNotFresh } from './auxiliary';

// The number of days of new cards to be held in upcoming
const UPCOMING_CAPACITY_MULTIPLIER = 5;
const DEFAULT_DAILYNEWCARDLIMIT = 5;

function Upcoming(upcoming) {
  if (upcoming) {
    this.words = upcoming.words;
    this.dailyNewCardLimit = upcoming.dailyNewCardLimit;
  } else {
    this.words = [];
    this.dailyNewCardLimit = DEFAULT_DAILYNEWCARDLIMIT;
  }
}

function UpcomingEl(wordId, wasAutofilled) {
  this.wordId = wordId;
  this.wasAutofilled = wasAutofilled;
}

Upcoming.prototype = {
  constructor: Upcoming,
  /**
   * Removes cards determined to be no longer worth learning at the moment.
   *
   * @param   wordData  Object    A mapping of wordIds to wordData needed to analyze each word in upcoming.
   * @return            Array     An array containing the wordIds of every el removed.
   */
  removeExpiredCards: function (wordData) {
    const expiredIds = [];
    this.words.forEach((el, i) => {
      
      // -- TODO: Write expired check --
      const isExpired = false;

      if (isExpired) {
        expiredIds.push(el.wordId);
        this.words.splice(i, 1);
      }
    });

    return expiredIds;
  },
  /**
   * Autofills upcoming if there aren't enough cards in it already to perform todays session.
   *
   * @param   createWord      function  Functions are used to keep db interaction separate from business
   *                                    logic.  Called whenever a new word is added to upcoming.
   * @param   addCardToWord   function  Called whenever a previously defined word without a card is added
   *                                    to upcoming.
   * @param   userId          mongoId   Normally this wouldn't be allowed, but this function is an
   *                                    exception. Used to query for userwords to test for existence.
   * @param   userJlpt        jlpt      Used to find next words to autofill based.
   * @return                  Object    { numAdded: Number, updatedJlpt: jlpt }
   */
  doAutofill: async function (createWord, addCardToWord, userId, userJlpt) {
    if(this.words.length >= this.dailyNewCardLimit) return { numAdded: 0 };

    const cursor = await DictModel.getNextWordsByJlpt(userJlpt);
    let updatedJlpt = {};
    let numAdded = 0;
    while (this.words.length < this.dailyNewCardLimit) {
      const word = await cursor.next();
      if (!word) {
        // Reached end of current resource

        // -- TODO: Properly handle this by switching resources --
        break;
      }
      const userWord = await WordModel.findUserWord(userId, word._id);
      if (!userWord || !userWord.card) {
        this._addWord(word._id, true);
        numAdded += 1;
        if (userWord) addCardToWord(word._id);
        else createWord(word._id, word.jlpt);
      }
      updatedJlpt = { level: word.jlpt.level, index: word.jlpt.index + 1 };
    }
    return { numAdded, updatedJlpt };
  },
  /**
   * Determines whether an incremented word should move within upcoming then shifts the element
   * if necessary.  Returns new index of word or same index if word didn't shift.
   *
   * @param   incrementedIndex  Number  Index of word being incremented.
   * @param   wordData          Object  A mapping of wordIds to wordData needed to analyze each word in upcoming.
   * @return                    Number  The new index of the word or the same index if it didn't shift.
   */
  processIncrement: function (incrementedIndex, wordData) {
    return incrementedIndex;
  },
  /**
   * Determines whether an incremented word that does not have a card should be placed in upcoming
   * or if it should skip upcoming and be placed directly into card deck with a delayed date.  
   *
   * @param   word              Word    The word that was incremented and is being tested.
   * @param   upcomingWordData  Object  A mapping of wordIds to wordData needed to analyze each word in upcoming.
   * @param   kindaKnew         Boolean Whether or not the increment was a kindaKnew increment.
   * @param   userJlpt          Jlpt
   * @return                    Object  { newIndex: Number, straightToCard: Boolean }
   */
  shouldCreateCard: function (word, upcomingWordData, kindaKnew, userJlpt) {
    if (kindaKnew) {
      return { newIndex: -1, straightToCard: true };
    } else if(!this._isFull()) {
      // if word jlpt is at or above the user's level, OR it's at the next level
      if (word.jlpt.level >= userJlpt.level || word.stats.inc.count > 3) {
        this._addWord(word.wordId, false);
        return { newIndex: this.words.length - 1, straightToCard: false };
      }
    }
    return { newIndex: -1, straightToCard: false };
  },
  // Checks and returns if dailyNewCardLimit is fresh.  Also sets it to not be fresh.
  isLimitFresh: function () {
    const isFresh = checkLimitIsFresh(this.dailyNewCardLimit);
    if (isFresh) this.dailyNewCardLimit = markLimitNotFresh(this.dailyNewCardLimit);
    return isFresh;
  },
  // Returns index of word in upcoming arr, or undefined if it doesn't exist
  getWordIndex: function (wordId) {
    return this.words.find(el => el.wordId === wordId);
  },
  // Push a word to the end of the upcoming arr
  _addWord: function (wordId, wasAutofilled) {
    if (this._isFull()) {
      throw new Error('Attempted to push to a full Upcoming object');
    }
    this.words.push(new UpcomingEl(wordId, wasAutofilled));
  },
  _isFull: function () {
    return this.words.length >= this.dailyNewCardLimit * UPCOMING_CAPACITY_MULTIPLIER;
  }
}

export default Upcoming;
