import DictModel from '../../models/dict';
import WordModel from '../../models/word';
import UserModel from '../../models/user';
import Word from '../schema/word';
import Card from '../lib/card';

import Upcoming from '../lib/upcoming';
import { checkLimitIsFresh } from '../lib/upcoming/auxiliary';

/**
 * Called before a user starts doing flashcards.  Makes any necessary updates to the upcoming
 * array then returns the upcoming cards to be done today.
 *
 * @param   user                    User 
 * @param   unorderedUpcomingWords  Array   The queried word data for all words in upcoming
 * @param   numUpcomingLeftToday    Number  
 * @return                          array   An array containing only the upcoming words due today
 */
async function doSessionPreprocessing(user, unordedUpcomingWords, numUpcomingLeftToday) {
  user.upcoming = new Upcoming(user.upcoming);
  // A check to see if a user has already done a session today since this
  // preprocesser only needs to be run once a day (unless limit is changed)
  if (!user.upcoming.isLimitFresh() && numUpcomingLeftToday !== user.upcoming.dailyNewCardLimit) return user.upcoming.words.slice(0, numUpcomingLeftToday);

  // Normalize upcoming words by wordId for easy access in upcominghandler
  const upcomingData = normalize(unordedUpcomingWords);

  const expiredIds = user.upcoming.removeExpiredCards(upcomingData);
  if (expiredIds.length > 0) {
    await UserModel.update(user._id, { $pull: { 'upcoming.wordId': { $in: wordIds } } });
    await WordModel.updateMany(user._id, wordIds, { $set: { card: null } });
  }

  // Functions for doAutofill to call that append additional db operations
  // Done in order to keep all db updates away from strict business logic files
  const createWordsOperation = [];
  const createWord = (wordId, jlpt) => createWordsOperation.push(new Word({
    userId: user._id,
    wordId,
    jlpt,
    withCard: true,
  }));
  const addCardWordIds = []
  const addCardToWord = (wordId) => addCardWordIds.push(wordId);
  const { numAdded, updatedJlpt } = await user.upcoming.doAutofill(createWord, addCardToWord, user._id, user.stats.jlpt);
  if (numAdded > 0) {
    await WordModel.createMany(createWordsOperation);
    await WordModel.updateMany(user._id, addCardWordIds, { $set: { card: new Card() } });
    await UserModel.update(user._id, { $set: { 'stats.jlpt': updatedJlpt }, $push: { 'upcoming.words': { $each: user.upcoming.words.slice(-1 * numAdded) } } });
  }

  return user.upcoming.words.slice(0, user.settings.dailyNewCardLimit);
}

function normalize(words) {
  const ids = {};
  words.forEach((w) => ids[w.wordId] = w);  
  return ids;
}

export default {
  doSessionPreprocessing,
};
