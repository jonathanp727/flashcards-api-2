import moment from 'moment';

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

function UpcomingEl(wordId, wasAutofilled, priority) {
  this.wordId = wordId;
  this.wasAutofilled = wasAutofilled;
  this.priority = priority;
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
        this._addWord(word._id, true, calcPriority(userJlpt.level, userJlpt.level));
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
   * @param   word              Word
   * @return                    Number  The new index of the word or the same index if it didn't shift.
   */
  processIncrement: function (incrementedIndex, word, userJlpt) {
    const newPrio = calcPriority(userJlpt.level, word.jlpt.level, word.stats.inc.dates);
    if (incrementedIndex === 0 || newPrio <= this.words[incrementedIndex - 1].priority) return incrementedIndex;

    // @TODO: Make this more efficient
    this.words.splice(incrementedIndex, 1);
    return this._addWord(word.wordId, false, newPrio);
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
      const priority = calcPriority(userJlpt.level, word.jlpt.level, word.stats.inc.dates);

      if (this._sufficientPriority(priority)) {
        const newIndex = this._addWord(word.wordId, false, priority);
        return { newIndex, straightToCard: false };
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
    return this.words.findIndex(el => el.wordId === wordId);
  },
  // Add word to upcoming based on priority 
  _addWord: function (wordId, wasAutofilled, priority) {
    if (this._isFull()) {
      throw new Error('Attempted to push to a full Upcoming object');
    }

    // @TODO: Change position search to binary
    let i = 0;
    while(i < this.words.length && priority < this.words[i].priority) {
      i += 1;
    }

    this.words.splice(i, 0, new UpcomingEl(wordId, wasAutofilled, priority));
    if (this._isFull()) {
      this.pop();
    }
    return i;
  },
  _isFull: function () {
    return this.words.length >= this.dailyNewCardLimit * UPCOMING_CAPACITY_MULTIPLIER;
  },
  _sufficientPriority: function (priority) {
    let isHigherThanMinEl = true;
    if (this._isFull()) isHigherThanMinEl = priority >= this.words[this.words.length - 1].priority
    return priority > 0 && isHigherThanMinEl;
  },
}

const JLPT_DIFF_MULTIPLIER = 4; //x
const DAYS_SINCE_INC_MULTIPLIER = 2; //y
const DAYS_SINCE_INC_RANGE = 3; //z
const DAYS_SINCE_INC_INVERSE_ADDITION = 2; //w
const calcPriority = (userJlpt, wordJlpt, incrementDates = [], autofillPolicy) => {
  const jlptTerm = JLPT_DIFF_MULTIPLIER * Math.max((wordJlpt - userJlpt) + 1, 0);
  const today = moment();
  const incTerm = incrementDates.reduce((acc, cur) => {
    const daysSince = today.diff(cur.date, 'days');
    return acc + DAYS_SINCE_INC_MULTIPLIER / ((daysSince / DAYS_SINCE_INC_RANGE) + DAYS_SINCE_INC_INVERSE_ADDITION);
  }, 0);
  return jlptTerm + incTerm;
}

export default Upcoming;
