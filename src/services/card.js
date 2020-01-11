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
  const unordedUpcomingWords = await WordModel.findUserWords(user.upcoming.map((el) => el.wordId));

  const todaysUpcoming = doUpcomingPreProcessing(user, unordedUpcomingWords);

  const cardsToDo = await WordModel.findTodaysCards(userId);
  const upcomingEntries = await DictModel.findByIds(todaysUpcoming.map((el) => el.wordId));
  const inProgEntries = await DictModel.findByIds(cardsToDo.map((el) => el.wordId));

  return { upcoming: upcomingEntries, inProg: inProgEntries };
}

async function doUpcomingPreProcessing(user, unordedUpcomingWords) {
  const upcoming = user.upcoming;
  // Normalize upcoming words by wordId for easy access in upcominghandler
  const upcomingData = normalize(unordedUpcomingWords);

  const expiredIndices = UpcomingHandler.removeExpiredCards(upcoming, upcomingData);
  if (expiredIndices.length > 0) {
    const wordIds = [];
    expiredIndices.forEach((i) => {
      const wordIds.push(upcoming[i].wordId);
      upcoming.splice(i, 1);
    });

    await UserModel.update(user._id, { $pull: { 'upcoming.wordId': { $in: wordIds } } });
    await WordModel.updateMany(user._id, wordIds, { $set: { card: null } });
  }

  const cardsToAdd = UpcomingHandler.loadNewCards(upcoming, user.settings.dailyNewCardLimit);
  if (cardsToAdd.length > 0) {
    const wordIds = [];
    wordsToAdd.forEach((el) => {
      upcoming.push(el);
      wordIds.push(el.wordId);
    });
    await UserModel.update(user._id, { $push: { upcoming: { $each: cardsToAdd } } });
    await WordModel.updateMany(user._id, wordIds, { $set: { card: new Card() } });
  }

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
