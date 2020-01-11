import DictModel from '../../models/dict';
import WordModel from '../../models/word';
import WordHandler from './WordHandler';
import CardHandler from './CardHandler';
import StatsHandler from './StatsHandler';

function createUpcomingEl(wordId, wasAutofilled) {
  return { wordId, wasAutofilled };
}

async function removeExpiredCards(upcoming, wordData, userId) {
  const expiredIds = [];
  upcoming.forEach((el, i) => {
    
    // -- TODO: Write expired check --

    if (false) {
      expiredIds.push(el.wordId);
      upcoming.splice(i, 1);
    }
  });
  if (expiredIds.length > 0) {
    await UserModel.update(userId, { $pull: { 'upcoming.wordId': { $in: wordIds } } });
    await WordModel.updateMany(userId, wordIds, { $set: { card: null } });
  }
  return upcoming;
}

async function doAutofill(upcoming, numCardsToAdd, userId) {
  if(upcoming.length >= numCardsToAdd) return upcoming;

  const cursor = await DictModel.getNextWordsByJlpt(user.stats.jlpt);
  let newUserJlpt = {};
  while (upcoming.length < numCardsToAdd) {
    const word = await cursor.next();
    // If there is no existing card for word, push
    const userWord = await WordModel.findUserWord(userId, word._id);
    if (!userWord || !userWord.card) {
      upcoming.push(createUpcomingEl(word._id, true));

      if (userWord) await WordModel.update(userId, word._id, { $set: card: CardHandler.createCard() });
      else await WordModel.create(WordHandler.createWord({
        userId,
        wordId,
        stats: StatsHandler.createWordStats(),
        card: CardHandler.createCard(),
        jlpt: word.jlpt,
      }));

      // If this is the last word to be added, record jlpt stats for updating user's level
      if(newWords.length === numCardsToAdd) {
        newUserJlpt = { level: word.jlpt.level, index: word.jlpt.index + 1 };
      }
    }
  }
  
  await UserModel.update(userId, { $set: { 'stats.jlpt': newUserJlpt, upcoming } });
  return upcoming;
}

export default {
  getExpiredCards,
  doAutofill,
};
