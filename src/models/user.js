import { db, client } from '../loaders/mongo';

const USER = 'user';

const create = (schema) => db.collection(USER).insertOne(schema).then(res => res.ops[0]);
const findById = (id) => db.collection(USER).findOne({ _id: ObjectId(id) });
const findByEmail = (email) => db.collection(USER).findOne({ email });

export default {
  create,
  findById,
  findByEmail,
};
