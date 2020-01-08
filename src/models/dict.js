import { db, client } from '../loaders/mongo';

const DICTIONARY = 'dictionary';

const findById = (id) => db.collection(DICTIONARY).findOne({ _id: id });
const findByIds = (ids) => db.collection(DICTIONARY).find({ _id: { $in: ids } });
const lookup = (query) => db.collection(DICTIONARY).find({
  $or: [
    { 'r_ele.reb': query },
    { 'k_ele.keb': query },
  ],
}).project({ sentences: 0 });

export default {
  findById,
  findByIds,
  lookup,
};
