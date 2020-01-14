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
};
