import UserModel from '../models/user';
import WordModel from '../models/word';
import DictModel from '../models/dict';
import CardHandler from './handlers/card';
import StatsHandler from './handlers/stats';
import UpcomingHandler from './handlers/upcoming';
import HistoryHandler from './handlers/history';
import { isActiveCard, isUpcomingCard } from './lib/card/auxiliary';
import UpdateOperation from '../helpers/UpdateOperation';
import Word from './schema/word';

/**
 * Increments the lookup counter of a word for a particular user and determines
 * if the word should be added to the "upcoming" flashcards array.
 *
 * @param userId     ObjectId
 * @param wordId     ObjectId
 * @param wordJlpt   { level: Number, index: Number }
 * @param kindaKnew  boolean   // Marks whether the user kind of knew the word or didn't at all
 */
async function increment(userId, wordId, kindaKnew, wordJlpt) {
  const user = await UserModel.findById(userId);
  let word = await WordModel.findUserWord(userId, wordId);
  const operations = { user: new UpdateOperation(), word: new UpdateOperation() };

  let isInsertOp = false;
  if (!word) {
    word = new Word({ userId, wordId, jlpt: wordJlpt });
    isInsertOp = true;
  }

  StatsHandler.processIncrement(user, word, kindaKnew, operations);
  HistoryHandler.processIncrement(user, word, operations);

  if (isActiveCard(word.card)) {
    CardHandler.processIncrement(word, kindaKnew, operations);
  } else {
    const unordedUpcomingWords = await WordModel.findUserWords(userId, user.upcoming.words.map((el) => el.wordId));
    if (isUpcomingCard(word.card)) {
      UpcomingHandler.processIncrement(user, word, unordedUpcomingWords, kindaKnew, operations);
    } else {
      UpcomingHandler.processShouldCreateCard(user, word, unordedUpcomingWords, kindaKnew, operations);
    }
  }

  await UserModel.update(userId, operations.user.generate());
  if (isInsertOp) {
    word.prepareForDb();
    await WordModel.create(word);
  }
  else await WordModel.update(userId, wordId, operations.word.generate());
}

/**
 * Gets all words in a dictionary that matches a query and updates user lookup history.
 *
 * @param userId     ObjectId
 * @param wordId     ObjectId
 * @param wordJlpt   { level: Number, index: Number }
 * @param kindaKnew  boolean   // Marks whether the user kind of knew the word or didn't at all
 */
async function lookup(userId, query) {
  const lookupResults = await DictModel.lookup(query);
  const userWords = await WordModel.findUserWords(userId, lookupResults.map((res) => res._id));
  console.log(lookupResults)

  /* Join lookupResults and userWords arrays on wordId */
  const joinedResults = joinWords(lookupResults, userWords);

  return joinedResults;
}

function joinWords(entries, words) {
  const d = {};
  words.forEach(w => d[w.wordId] = w);
  entries.forEach(e => e.data = d[e._id]);
  return entries;
}

export default {
  increment,
  lookup,
};
