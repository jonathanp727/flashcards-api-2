import UserModel from '../models/user';
import WordModel from '../models/word';
import DictModel from '../models/dict';
import CardHandler from './lib/CardHandler';
import StatsHandler from './lib/StatsHandler';
import UpcomingHandler from './lib/UpcomingHandler';
import { isSameDay } from '../helpers/date';

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

  const numUpcomingLeftToday = isSameDay(user.history.lastSession.date) ?
    user.settings.dailyNewCardLimit - user.history.lastSession.upcomingCardsDone :
    user.settings.dailyNewCardLimit;

  let upcomingEntries = [];
  if (numUpcomingLeftToday > 0) {
    const unordedUpcomingWords = await WordModel.findUserWords(user.upcoming.map((el) => el.wordId));

    const todaysUpcoming = doUpcomingPreProcessing(user, unordedUpcomingWords, numUpcomingLeftToday);
    upcomingEntries = await DictModel.findByIds(todaysUpcoming.map((el) => el.wordId));
  }

  const cardsToDo = await WordModel.findTodaysCards(userId);
  const inProgEntries = await DictModel.findByIds(cardsToDo.map((el) => el.wordId));

  return { upcoming: upcomingEntries, inProg: inProgEntries };
}

async function doUpcomingPreProcessing(user, unordedUpcomingWords, numUpcomingLeftToday) {
  let upcoming = user.upcoming;
  // A check to see if a user has already done a session today since this
  // preprocesser only needs to be run once a day
  if (numUpcomingLeftToday !== user.settings.dailyNewCardLimit) return upcoming.slice(0, numUpcomingLeftToday);

  // Normalize upcoming words by wordId for easy access in upcominghandler
  const upcomingData = normalize(unordedUpcomingWords);

  upcoming = UpcomingHandler.removeExpiredCards(upcoming, upcomingData, user._id);

  upcoming = UpcomingHandler.doAutofill(upcoming, user.settings.dailyNewCardLimit);

  return upcoming.slice(0, user.settings.dailyNewCardLimit);
}

function normalize(words) {
  const ids = {};
  words.forEach((w) => ids[w.wordId] = w);  
  return ids;
}

export default {
  doCard,
  startCardSession,
};
