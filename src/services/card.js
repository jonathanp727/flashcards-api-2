import UserModel from '../models/user';
import WordModel from '../models/word';
import DictModel from '../models/dict';
import CardHandler from './handlers/card';
import StatsHandler from './handlers/stats';
import UpcomingHandler from './handlers/upcoming';
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

  if (isUpcomingCard(word.card)) operations.user.addStatement('$pull', { 'upcoming.words': { wordId } });

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
