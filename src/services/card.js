import UserModel from '../models/user';
import WordModel from '../models/word';
import DictModel from '../models/dict';
import CardHandler from './lib/CardHandler';
import StatsHandler from './lib/StatsHandler';
import UpcomingHandler from './lib/UpcomingHandler';

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
async function startCardSession(userId) {
  const user = await UserModel.findById(userId);
  const cardsToDo = await WordModel.findTodaysCards(userId);
  const upcomingEntries = await DictModel.findByIds(user.upcoming.map((el) => el.wordId));

  const detailedUpcoming = /* Join upcomingEntries and user.upcoming arrays on wordId */;

  const inProgEntries = await DictModel.findByIds(cardsToDo.map((el) => el.wordId));

  const { dirty, upcoming } = UpcomingHandler.handleStartSession(detailedUpcoming);
  if (dirty) {
    await UserModel.update(userId, { $set: { upcoming } });
  }

  return [...upcomingEntries, ...inProgEntries];
}

export default {
  doCard,
  startCardSession,
};
