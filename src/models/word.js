import { ObjectId } from 'mongodb';

import { db, client } from '../loaders/mongo';

const WORD = 'word';

const create = (schema) => db.collection(WORD).insertOne(schema).then(res => res.ops[0]);
const findUserWord = (userId, wordId) => db.collection(WORD).findOne({
  userId: ObjectId(userId),
  wordId: ObjectId(wordId),
});
const findUserWords = (userId, wordIds) => {
  if (wordIds.length === 0) return [];

  return db.collection(WORD).find({
    userId: ObjectId(userId),
    wordId: {
      $in: [
        wordIds.map(wordId => ObjectId(wordId)),
      ],
    },
  }).toArray();
}
const findTodaysCards = (userId) => {
  const today = new Date();
  today.setHours(0,0,0,0);

  return db.collection(WORD).find({
    userId: ObjectId(userId),
    'card.date': today,
  }).toArray();
}
const update = (userId, wordId, query) => db.collection(WORD).update({
  userId: ObjectId(userId),
  wordId: ObjectId(wordId),
}, query);
const updateMany = (userId, wordIds, query) => db.collection(WORD).updateMany({
  userId: ObjectId(userId),
  wordId: {
    $in: [
      wordIds.map(wordId => ObjectId(wordId)),
    ],
  },
}, query);

export default {
  create,
  findUserWord,
  findUserWords,
  findTodaysCards,
  update,
  updateMany,
};
