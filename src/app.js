import express from 'express';

import config from './config';
import initLoaders from './loaders';
import Logger from './loaders/logger';

async function startServer() {
  const app = express();

  await initLoaders({ expressApp: app });

  app.listen(config.port, err => {
    if (err) {
      Logger.error(err);
      process.exit(1);
      return;
    }
    Logger.info(`Server listening on port: ${config.port}`);
  });
}

startServer();
