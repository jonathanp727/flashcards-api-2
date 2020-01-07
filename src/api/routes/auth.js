import { Router } from 'express';
import { celebrate, Joi, Segments } from 'celebrate';

import AuthService from '../../services/auth';
import middlewares from '../middlewares';
import Logger from '../../loaders/logger';

const route = Router();

export default (app) => {
  app.use('/auth', route);

  route.post(
    '/signup',
    celebrate({
      [Segments.BODY]: Joi.object({
        name: Joi.string().required(),
        email: Joi.string().required(),
        password: Joi.string().required(),
      }),
    }),
    async (req, res, next) => {
      Logger.debug('Calling Sign-Up endpoint with body: %o', req.body )
      try {
        const { user, token } = await AuthService.signUp(req.body);
        return res.status(201).json({ user, token });
      } catch (e) {
        Logger.error('%o', e);
        return next(e);
      }
    },
  );

  route.post(
    '/signin',
    celebrate({
      [Segments.BODY]: Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required(),
      }),
    }),
    async (req, res, next) => {
      Logger.debug('Calling Sign-In endpoint with body: %o', req.body)
      try {
        const { email, password } = req.body;
        const { user, token } = await AuthService.signIn(email, password);
        return res.json({ user, token }).status(200);
      } catch (e) {
        Logger.error('%o',  e );
        return next(e);
      }
    },
  );
};
