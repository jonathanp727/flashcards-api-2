import expressLoader from './express';
import mongoLoader from './mongo';
import Logger from './logger';

export default async ({ expressApp }) => {
  await mongoLoader();
  Logger.info('DB loaded and connected!');

  await expressLoader({ app: expressApp });
  Logger.info('Express loaded');
};
