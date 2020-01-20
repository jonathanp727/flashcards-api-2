import UserModel from '../models/user';
import WordModel from '../models/word';
import DictModel from '../models/dict';
import CardHandler from './handlers/card';
import StatsHandler from './handlers/stats';
import UpcomingHandler from './handlers/upcoming';
import HistoryHandler from './handlers/history';

/**
 * Fetches user.
 *
 * @param   userId  ObjectId
 * @return          User
 */
async function get(userId) {
  const user = await UserModel.findById(userId);
  return user;
}

export default {
  get,
}
