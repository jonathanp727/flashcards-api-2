import { isSameDay } from '../../helpers/date'
/**
 * Processes an Increment operation of a word that is currently in upcoming.  Changes user and
 * word in place and logs every change in the operations object for later db updates.
 *
 * @param   user          User 
 * @param   word          Word
 * @param   operations    { user: UpdateOperation, word: UpdateOperation } 
 */
function processIncrement(user, word, operations) {
  // https://stackoverflow.com/questions/29932723/how-to-limit-an-array-size-in-mongodb
  // ^ for pushing to user recent lookups
  operations.user.addStatement('$push', { 'history.recentLookups': { $each: [word.wordId], $slice: -10 } });
}

/**
 * Called when a user starts a card session.  Updates the last session date to today.
 *
 * @param   user          User
 * @param   operations    { user: UpdateOperation, word: UpdateOperation }
 * @return                Number    The number of upcoming cards already done today
 */
function processSessionStart(user, operations) {
  if (isSameDay(user.history.lastSession.date)) return user.history.lastSession.upcomingCardsDone;
  const today = new Date().getTime();
  user.history.lastSession = { date: today, upcomingCardsDone: 0 };
  operations.user.addStatement('$set', {
    'history.lastSession.date': today,
    'history.lastSession.upcomingCardsDone': 0
  });
  return 0;
}

/**
 * Increments the upcoming count done for todays session.
 *
 * @param   operations    { user: UpdateOperation, word: UpdateOperation } 
 */
function incTodaysUpcomingCount(operations) {
  operations.user.addStatement('$inc', { 'history.lastSession.upcomingCardsDone': 1 });
}

export default {
  processIncrement,
  processSessionStart,
  incTodaysUpcomingCount,
};
