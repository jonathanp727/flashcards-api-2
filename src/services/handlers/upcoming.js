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

/**
 * Processes an Increment operation of a word that is currently in upcoming.  Changes user and
 * word in place and logs every change in the operations object for later db updates.
 *
 * @param   user                    User 
 * @param   word                    Word
 * @param   unorderedUpcomingWords  Array   The queried word data for all words in upcoming
 * @param   kindaKnew               Boolean 
 * @param   operations              Object  { user: UpdateOperation, word: UpdateOperation }
 */
function processIncrement(user, word, unorderedUpcomingWords, kindaKnew, operations) {
  user.upcoming = new Upcoming(user.upcoming);

  const index = user.upcoming.getWordIndex(word._id);
  const upcomingData = normalize(unorderedUpcomingWords);

  const newIndex = user.upcoming.processIncrement(index, upcomingData);

  // Create set statement if word was shifted
  if (index !== newIndex) {
    const updateStatement = {};
    for (let i = newIndex; i <= index; i++) {
      updateStatement[`upcoming.words.${i}`] = user.upcoming.words[i];
    }
    operations.user.addStatement('$set', updateStatement);
  }
}

/**
 * Processes an Increment operation of a word that has no card and is not in upcoming.  Changes user
 * and word in place and logs every change in the operations object for later db updates.
 *
 * @param   user                    User 
 * @param   word                    Word
 * @param   unorderedUpcomingWords  Array   The queried word data for all words in upcoming
 * @param   kindaKnew               Boolean 
 * @param   operations              Object  { user: UpdateOperation, word: UpdateOperation } 
 */
function processShouldCreateCard(user, word, unorderedUpcomingWords, kindaKnew, operations) {
  user.upcoming = new Upcoming(user.upcoming);

  const upcomingData = normalize(unorderedUpcomingWords);

  const { newIndex, straightToCard } = user.upcoming.shouldCreateCard(word, upcomingData, kindaKnew, user.stats.jlpt);
  if (straightToCard) {
    word.card = new Card(null, true);
    operations.word.addStatement('$set', { card: word.card });
  } else if (newIndex !== -1) {
    const updateStatement = {};
    for (let i = newIndex; i < user.upcoming.words.length; i++) {
      updateStatement[`upcoming.words.${i}`] = user.upcoming.words[i];
    }
    operations.user.addStatement('$set', updateStatement);
    word.card = new Card(null);
    operations.word.addStatement('$set', { card: word.card });
  }
}

function normalize(words) {
  const ids = {};
  words.forEach((w) => ids[w.wordId] = w);  
  return ids;
}

export default {
  doSessionPreprocessing,
  processIncrement,
  processShouldCreateCard,
};
