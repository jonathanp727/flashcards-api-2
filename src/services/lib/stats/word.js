import { NUM_CATEGORIES } from './auxiliary';

function WordStats (other = null) {
  if (other) {
    this.inc = other.inc;
    this.card = other.card;
    this.exp = other.exp;
  } else {
    this.inc = {
      count: 0,
      dates: [],
    };
    this.card = {
      curStreak: 0,
      maxStreak: 0,
      history: [],
    };
    this.exp = 0; // Max 100
  }
}

const MAX_WORD_EXP = 100;

// All word exp logic is in these functions
const calculateCurrentCategory = exp => exp / (100 / NUM_CATEGORIES);
const calculateWordExpGains = (exp, reponse) => exp + 10 < MAX_WORD_EXP ? exp + 10 : MAX_WORD_EXP;
const calculateWordExpLosses = (exp, reponse) => exp - 50 > 0 ? exp - 50 : 0;
const calculateWordKindaKnewIncrement = exp => exp - 50 > 0 ? exp - 50 : 0;
const calculateWordDidntKnowIncrement = exp => 0;

WordStats.prototype = {
  constructor: WordStats,
  processDoCard: function (response) {
    this.card.history.push({ date: new Date().getTime(), response });
    if (!isReponseCorrect(response)) {
      this.exp = calculateWordExpLosses(this.exp, response);
      this.card.curStreak = 0;
    } else {
      this.exp = calculateWordExpGains(this.exp, response);
      this.card.curStreak += 1;
      this.card.maxStreak = Math.max(this.curStreak, this.maxStreak);
    }
  },
  processIncrement: function (kindaKnew) {
    this.curStreak = 0;
    this.inc.dates.push({ date: new Date().getTime(), kindaKnew });
    this.inc.count += 1;
    if (kindaKnew) {
      this.exp = calculateWordKindaKnewIncrement(this.exp);
    } else {
      this.exp = calculateWordDidntKnowIncrement(this.exp);
    }
  },
  // Calculation that determines the category (level) of the word
  getCategory: function() {
    return calculateCurrentCategory(this.exp);
  }
}

export default WordStats;
