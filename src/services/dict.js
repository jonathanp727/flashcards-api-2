import UserModel from '../models/user';
import WordModel from '../models/word';
import DictModel from '../models/dict';
import CardHandler from './lib/CardHandler';
import StatsHandler from './lib/StatsHandler';
import UpcomingHandler from './lib/UpcomingHandler';

/**
 * Increments the lookup counter of a word for a particular user and determines
 * if the word should be added to the "upcoming" flashcards array.
 *
 * @param userId     ObjectId
 * @param wordId     ObjectId
 * @param wordJlpt   { level: Number, index: Number }
 * @param kindaKnew  boolean   // Marks whether the user kind of knew the word or didn't at all
 */
async function increment(userId, wordId) {
  const user = await UserModel.findById(userId);
  const word = await WordModel.findUserWord(userId, wordId);

  const userUpdateQuery = {};
  const wordUpdateQuery = {};
  if (CardHandler.isCardAlready(word.card)) {
    const wasMovedFromUpcoming = CardHandler.increment(word.card);
    if (wasMovedFromUpcoming) {
      userUpdateQuery.$pull = { upcoming: { wordId } };
    }
  } else {
    const { shouldAdd, index, element } = UpcomingHandler.checkShouldAddToUpcoming(word, user.upcoming);
    if (shouldAdd) {
      userUpdateQuery.$push = {
        upcoming: {
          $each: [element],
          $position: index,
        },
      };
    }
  }

  const { userStats, wordStats } = StatsHandler.processIncrement(user.stats, word.stats);
  wordUpdateQuery.$set.stats = wordStats;
  userUpdateQuery.$set.stats = userStats;

  await UserModel.update(userId, userUpdateQuery);
  await WordModel.update(word._id, wordUpdateQuery);
}

/**
 * Gets all words in a dictionary that matches a query and updates user lookup history.
 *
 * @param userId     ObjectId
 * @param wordId     ObjectId
 * @param wordJlpt   { level: Number, index: Number }
 * @param kindaKnew  boolean   // Marks whether the user kind of knew the word or didn't at all
 */
async function lookup(query) {
  // https://stackoverflow.com/questions/29932723/how-to-limit-an-array-size-in-mongodb
  // ^ for pushing to user recent lookups
}

export default {
  increment,
  lookup,
};
