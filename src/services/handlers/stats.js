import UserStats from '../lib/stats/user';
import WordStats from '../lib/stats/word';

/**
 * Processes an Increment operation of a word that is currently in upcoming.  Changes user and
 * word in place and logs every change in the operations object for later db updates.
 *
 * @param   user          User 
 * @param   word          Word
 * @param   kindaKnew     Boolean
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

/**
 * Processes the stat changes for a word that has just been done.  Modifies user and word in
 * place and logs every change in operations object for later db updates.
 *
 * @param   user              User 
 * @param   word              Word
 * @param   responseQuality   Number   Rating of how well user knew the answer (from 1-5)
 * @param   operations    { user: UpdateOperation, word: UpdateOperation } 
 */
function processDoCard(user, word, responseQuality, operations) {
  word.stats = new WordStats(word.stats);
  user.stats = new UserStats(user.stats);

  const initialCategory = word.stats.getCategory();
  word.stats.processDoCard(responseQuality);
  user.stats.processWordDiff(initialCategory, word.stats.getCategory());

  operations.word.addStatement('$set', { stats: word.stats });
  operations.user.addStatement('$set', { stats: user.stats });
}

export default {
  processIncrement,
  processDoCard,
};
