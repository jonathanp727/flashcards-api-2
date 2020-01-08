import UserModel from '../models/user';
import WordModel from '../models/word';
import CardHandler from './lib/CardHandler';

/**
 * Determines new interval for flashcard based on responseQuality (1-5).
 *
 * @param userId          ObjectId
 * @param wordId          ObjectId
 * @param upcoming        Boolean  True if card is in upcoming arr and not in cards arr
 * @param responseQuality Number (from 1 to 5)
 * @return    { user, redo (boolean that states whether card needs to be redone)}
 */
async function doCard(userId, wordId) {
  const user = await UserModel.findById(userId);
  const word = await WordModel.findUserWord(userId, wordId);
  const isUpcoming = CardHandler.getIsUpcoming(word);

  const wordUpdateQuery = { $set: {} };
  const userUpdateQuery = { $set: {} };

  wordUpdateQuery.$set.card = CardHandler.processCard(user.card);
  const { userStats, wordStats } = StatsHandler.processDoCard(user.stats, word.stats);
  wordUpdateQuery.$set.stats = wordStats;
  userUpdateQuery.$set.stats = userStats;

  if (isUpcoming) {
    userUpdateQuery.$pull = { upcoming: { wordId } };
  }

  await UserModel.update(userId, userUpdateQuery);
  await WordModel.update(word._id, wordUpdateQuery);
}

/**
 * Checks and updates upcoming array and then returns all words to be done today.
 *
 * @param userId          ObjectId
 * @param wordId          ObjectId
 * @param upcoming        Boolean  True if card is in upcoming arr and not in cards arr
 * @param responseQuality Number (from 1 to 5)
 * @return    { user, redo (boolean that states whether card needs to be redone)}
 */
async function startCardSession() {

}

export default {
  doCard,
  startCardSession,
};
