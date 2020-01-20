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

  route.post(
    '/do',
    middlewares.isAuth,
    celebrate({
      [Segments.BODY]: Joi.object({
        wordId: Joi.number().required(),
        quality: Joi.number().required(),
      }).required(),
    }),
    async (req, res, next) => {
      Logger.debug('Calling Do-Card endpoint with body: %o', req.body);
      try {
        const { wordId, quality } = req.body;
        const redo = await CardService.doCard(req.token._id, wordId, quality);
        return res.json({ redo }).status(200);
      } catch (e) {
        Logger.error('%o',  e );
        return next(e);
      }
    },
  );
};
