import { isReponseCorrect } from '../card';
import { NUM_CATEGORIES } from './auxiliary';

function UserStats(other = null, jlptLevel) {
  if (other) {
    this.categories = other.categories;
    this.exp = other.exp;
    this.level = other.level;
    this.jlpt = other.jlpt;
  } else {
    // Count of all words in each category
    this.jlpt = { level: jlptLevel, index: 0 };
    this.categories = new Array(NUM_CATEGORIES).fill(0);
    this.exp = 0;
    this.level = 1;
  }
}

// All user exp logic is in these functions
const calculateUserExpGains = newCategory => newCategory / NUM_CATEGORIES * 10;
const calculateExpToNextLevel = level => level * 50;

UserStats.prototype = {
  constructor: UserStats,
  /**
   * To be called whenever a word has it's exp modified.  If the word has a change in category
   * then calculates new user exp
   */
  processWordDiff: function (prevCategory, newCategory) {
    if (prevCategory === newCategory) return;
    this.categories[prevCategory] -= 1;
    this.categories[newCategory] += 1;

    if (newCategory > prevCategory) {

      this.exp += calculateUserExpGains(newCategory);

      const expNeeded = calculateExpToNextLevel(user.level);
      if (this.exp >= expNeeded) {
        this.level += 1;
        this.exp -= expNeeded;
      }
    }
  },
}

export default UserStats;
