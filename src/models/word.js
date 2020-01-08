import { ObjectId } from 'mongo';

import { db, client } from '../loaders/mongo';

const USER = 'word';

const create = (schema) => db.collection(USER).insertOne(schema).then(res => res.ops[0]);
const findUserWord = (userId, wordId) => db.collection(USER).findOne({
  userId: ObjectId(userId),
  wordId: ObjectId(wordId),
});
const findUserWords = (userId, wordIds) => db.collection(USER).find({
  userId: ObjectId(userId),
  wordId: {
    $in: [
      wordIds.map(wordId => ObjectId(wordId)),
    ],
  },
});

export default {
  create,
  findUserWord,
  findUserWords,
};
