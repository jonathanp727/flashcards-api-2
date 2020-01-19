import UserStats from '../lib/stats/user';
import WordStats from '../lib/stats/word';

/**
 * Processes an Increment operation of a word that is currently in upcoming.  Changes user and
 * word in place and logs every change in the operations object for later db updates.
 *
 * @param   user          User 
 * @param   word          Word
 * @param   kindaKenw     Boolean
 * @param   operations    { user: UpdateOperation, word: UpdateOperation } 
 */
function processIncrement(user, word, kindaKnew, operations) {
  word.stats = new WordStats(word.stats);
  user.stats = new UserStats(user.stats);

  const initialCategory = word.stats.getCategory();
  word.stats.processIncrement(kindaKnew);
  user.stats.processWordDiff(initialCategory, word.stats.getCategory());

  operations.word.addStatement('$set', { stats: word.stats });
  operations.user.addStatement('$set', { stats: user.stats });
}

export default {
  processIncrement,
};
