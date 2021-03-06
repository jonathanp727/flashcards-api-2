import { ObjectId } from 'mongodb';
import moment from 'moment';

import { db, client } from '../loaders/mongo';

const WORD = 'word';

const create = (schema) => db.collection(WORD).insertOne(schema).then(res => res.ops[0]);
const createMany = (schemas) => db.collection(WORD).insertMany(schemas);
const findUserWord = (userId, wordId) => db.collection(WORD).findOne({
  userId: ObjectId(userId),
  wordId: wordId,
});
const findUserWords = (userId, wordIds) => {
  if (wordIds.length === 0) return [];

  return db.collection(WORD).find({
    userId: ObjectId(userId),
    wordId: { $in: wordIds },
  }).toArray();
}
const findTodaysCards = (userId) => {
  const today = moment();
  today.startOf('day');

  return db.collection(WORD).find({
    userId: ObjectId(userId),
    'card.date': today.valueOf(),
  }).toArray();
}
const update = (userId, wordId, query) => db.collection(WORD).updateOne({
  userId: ObjectId(userId),
  wordId: wordId,
}, query);
const updateMany = (userId, wordIds, query) => db.collection(WORD).updateMany({
  userId: ObjectId(userId),
  wordId: { $in: wordIds },
}, query);

export default {
  create,
  createMany,
  findUserWord,
  findUserWords,
  findTodaysCards,
  update,
  updateMany,
};
