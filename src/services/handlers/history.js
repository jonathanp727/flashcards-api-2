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

export default {
  processIncrement,
};
