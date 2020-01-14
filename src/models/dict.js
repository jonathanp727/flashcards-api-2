import { ObjectId } from 'mongodb';

import { db, client } from '../loaders/mongo';

const DICTIONARY = 'dictionary';

const findById = (id) => db.collection(DICTIONARY).findOne({ _id: id });
const findByIds = (ids) => {
  if (ids.length === 0) return [];

  return db.collection(DICTIONARY).find({ _id: { $in: ids } }).toArray();
}
const lookup = (query) => db.collection(DICTIONARY).find({
  $or: [
    { 'r_ele.reb': query },
    { 'k_ele.keb': query },
  ],
}).project({ sentences: 0 });
const getNextWordsByJlpt = (jlpt) => (
  db.collection(DICTIONARY).find({
    $or: [
      { 'jlpt.level': { $lt: jlpt.level } },
      { 'jlpt.level': { $eq: jlpt.level }, 'jlpt.index': { $gte: jlpt.index } },
    ],
  }).sort(
    { 'jlpt.level': -1, 'jlpt.index': 1 }
  ).hint(
    { 'jlpt.level': -1, 'jlpt.index': 1 }
  ).project({ _id: 1, jlpt: 1 })
);


export default {
  findById,
  findByIds,
  lookup,
  getNextWordsByJlpt,
};
