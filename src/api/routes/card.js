import { Router } from 'express';
import { celebrate, Joi, Segments } from 'celebrate';

import CardService from '../../services/card';
import middlewares from '../middlewares';
import Logger from '../../loaders/logger';

const route = Router();

export default (app) => {
  app.use('/card', route);

  route.get(
    '/start',
    middlewares.isAuth,
    async (req, res, next) => {
      Logger.debug('Calling Start Session endpoint')
      try {
        const cards = await CardService.startCardSession(req.token._id);
        return res.status(200).json(cards);
      } catch (e) {
        Logger.error('%o', e);
        return next(e);
      }
    },
  );

  // route.post(
  //   '/do',
  //   celebrate({
  //     [Segments.BODY]: Joi.object({
  //       email: Joi.string().required(),
  //       password: Joi.string().required(),
  //     }),
  //   }),
  //   async (req, res, next) => {
  //     Logger.debug('Calling Sign-In endpoint with body: %o', req.body)
  //     try {
  //       const { email, password } = req.body;
  //       const { user, token } = await AuthService.signIn(email, password);
  //       return res.json({ user, token }).status(200);
  //     } catch (e) {
  //       Logger.error('%o',  e );
  //       return next(e);
  //     }
  //   },
  // );
};
