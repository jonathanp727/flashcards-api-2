import Logger from '../../loaders/logger';
import UserModel from '../../models/user';
/**
 * Attach user to req.user
 */
const attachCurrentUser = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.token._id);
    if (!user) return res.sendStatus(401);

    Reflect.deleteProperty(user, 'password');
    Reflect.deleteProperty(user, 'salt');
    req.currentUser = user;
    
    return next();
  } catch (e) {
    Logger.error('Error attaching user to req: %o', e);
    return next(e);
  }
};

export default attachCurrentUser;
