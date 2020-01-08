import { db, client } from '../loaders/mongo';

const DICTIONARY = 'dictionary';

const findById = (id) => db.collection(DICTIONARY).findOne({ _id: id });
const findByIds = (ids) => db.collection(DICTIONARY).find({ _id: { $in: ids } });

export default {
  findById,
};
