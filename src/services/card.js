import UserModel from '../models/user';
import WordModel from '../models/word';
import DictModel from '../models/dict';
import CardHandler from './handlers/card';
import StatsHandler from './handlers/stats';
import UpcomingHandler from './handlers/upcoming';
import { getUpcomingLeftToday } from './lib/upcoming/auxiliary';
import UpdateOperation from '../helpers/UpdateOperation';

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
  const isUpcoming = CardHandler.getIsUpcoming(word.card);

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
 * To be called when a user starts a flashcard session Checks and updates upcoming
 * array then returns entries for every card due today.
 *
 * @param   userId  ObjectId
 * @return          Object   { upcoming: [Entry], inProg: [Entry] }
 */
async function startCardSession(userId) {
  const user = await UserModel.findById(userId);

  const numUpcomingLeftToday = getUpcomingLeftToday(user.history.lastSession, user.upcoming.dailyNewCardLimit);

  let upcomingEntries = [];
  if (numUpcomingLeftToday > 0) {
    const unordedUpcomingWords = await WordModel.findUserWords(userId, user.upcoming.words.map((el) => el.wordId));

    const todaysUpcoming = await UpcomingHandler.doSessionPreprocessing(user, unordedUpcomingWords, numUpcomingLeftToday);
    upcomingEntries = await DictModel.findByIds(todaysUpcoming.map((el) => el.wordId));
  }

  const cardsToDo = await WordModel.findTodaysCards(userId);
  const inProgEntries = await DictModel.findByIds(cardsToDo.map((el) => el.wordId));

  return { upcoming: upcomingEntries, inProg: inProgEntries };
}

export default {
  doCard,
  startCardSession,
};
