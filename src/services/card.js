import UserModel from '../models/user';
import WordModel from '../models/word';
import DictModel from '../models/dict';
import CardHandler from './handlers/card';
import StatsHandler from './handlers/stats';
import UpcomingHandler from './handlers/upcoming';
import HistoryHandler from './handlers/history';
import { getUpcomingLeftToday } from './lib/upcoming/auxiliary';
import { isUpcomingCard, isReponseCorrect } from './lib/card/auxiliary';
import UpdateOperation from '../helpers/UpdateOperation';

/**
 * Determines new interval for flashcard based on responseQuality (1-5).
 *
 * @param userId            ObjectId
 * @param wordId            ObjectId
 * @param responseQuality   Number    (from 1 to 5)
 * @return                  Boolean   Returns whether or not the card was answered incorrectly and
 *                                    needs to be redone.  (i.e. True -> must redo card)
 */
async function doCard(userId, wordId, responseQuality) {
  const user = await UserModel.findById(userId);
  const word = await WordModel.findUserWord(userId, wordId);
  const operations = { user: new UpdateOperation(), word: new UpdateOperation() };

  if (isUpcomingCard(word.card)) {
    operations.user.addStatement('$pull', { 'upcoming.words': { wordId } });
    HistoryHandler.incTodaysUpcomingCount(operations);
  }

  CardHandler.processDoCard(word, responseQuality, operations);
  StatsHandler.processDoCard(user, word, responseQuality, operations);

  await UserModel.update(userId, operations.user.generate());
  await WordModel.update(userId, wordId, operations.word.generate());

  return !isReponseCorrect(responseQuality);
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
  const operations = { user: new UpdateOperation() };

  const upcomingDoneToday = HistoryHandler.processSessionStart(user, operations);
  const numUpcomingLeftToday = getUpcomingLeftToday(user.upcoming.dailyNewCardLimit, upcomingDoneToday);

  let todaysUpcoming = [];
  if (numUpcomingLeftToday > 0) {
    const unorderedUpcomingWords = await WordModel.findUserWords(userId, user.upcoming.words.map((el) => el.wordId));
    const normalizedUpcomingWords = normalize(unorderedUpcomingWords, 'wordId');

    todaysUpcoming = await UpcomingHandler.doSessionPreprocessing(user, normalizedUpcomingWords, numUpcomingLeftToday);
    const upcomingEntries = await DictModel.findByIds(todaysUpcoming.map((el) => el.wordId));
    todaysUpcoming = serializeUpcoming(todaysUpcoming, upcomingEntries, normalizedUpcomingWords);
  }

  const cardsToDo = await WordModel.findTodaysCards(userId);
  const inProgEntries = await DictModel.findByIds(cardsToDo.map((el) => el.wordId));
  const todaysInProg = serializeInProg(cardsToDo, inProgEntries);

  if (operations.user.isDirty()) {
    await UserModel.update(userId, operations.user.generate());
  }

  return { upcoming: todaysUpcoming, inProg: todaysInProg };
}

function normalize(words, identifier) {
  const ids = {};
  words.forEach((w) => ids[w[identifier]] = w);  
  return ids;
}

function serializeUpcoming(upcoming, entries, normalizedUpcomingWords) {
  const normalizedEntries = normalize(entries, '_id');

  const ret = [];
  upcoming.forEach((el) => {
    const word = normalizedUpcomingWords[el.wordId];
    word.entry = normalizedEntries[el.wordId];
    word.upcoming = el;
    ret.push(word);
  });

  return ret;
}

function serializeInProg(userWords, entries) {
  normalize(entries, '_id');
  userWords.forEach((el) => {
    el.entry = entries[el.wordId];
  });
  return userWords;
}

export default {
  doCard,
  startCardSession,
};
