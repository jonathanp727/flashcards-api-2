import { Router } from 'express';
import { celebrate, Joi, Segments } from 'celebrate';

import UserService from '../../services/user';
import middlewares from '../middlewares';
import Logger from '../../loaders/logger';

const route = Router();

export default (app) => {
  app.use('/user', route);

  route.get(
    '/',
    middlewares.isAuth,
    async (req, res, next) => {
      Logger.debug('Calling User GET endpoint');
      try {
        const result = await UserService.get(req.token._id);
        return res.status(200).json({ user: result });
      } catch (e) {
        Logger.error('%o', e);
        return next(e);
      }
    },
  );
};
