import { Router } from 'express';
import { celebrate, Joi, Segments } from 'celebrate';

import DictService from '../../services/dict';
import middlewares from '../middlewares';
import Logger from '../../loaders/logger';

const route = Router();

export default (app) => {
  app.use('/dict', route);

  route.get(
    '/:query',
    middlewares.isAuth,
    async (req, res, next) => {
      const decodedQuery = decodeURIComponent(req.params.query);
      Logger.debug('Calling Lookup endpoint with query: ', decodedQuery);
      try {
        const result = await DictService.lookup(req.token._id, decodedQuery);
        return res.status(200).json(result);
      } catch (e) {
        Logger.error('%o', e);
        return next(e);
      }
    },
  );

  route.post(
    '/inc',
    middlewares.isAuth,
    celebrate({
      [Segments.BODY]: Joi.object({
        wordId: Joi.number().required(),
        kindaKnew: Joi.boolean().required(),
        jlpt: Joi.object({
          level: Joi.number().required(),
          index: Joi.number().required(),
        }).required(),
      }),
    }),
    async (req, res, next) => {
      Logger.debug('Calling Increment endpoint with body: ', req.body);
      try {
        const updatedWord = await DictService.increment(req.token._id, req.body.wordId, req.body.kindaKnew, req.body.jlpt);
        return res.status(200).json({ updatedWord });
      } catch (e) {
        Logger.error('%o', e);
        return next(e);
      }
    },
  );
};
