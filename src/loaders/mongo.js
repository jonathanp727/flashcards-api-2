import { MongoClient } from 'mongodb';

import config from '../config';

let db = null;
let client = null;

export function getDb() {
  if (db === null) {
    throw new Error("Must connect to DB before first access");
  }
  return db;
}

export function getClient() {
  if (client === null) {
    throw new Error("Must connect to DB before first access");
  }
  return client;
}

export default async function connectToServer() {
    const _client = await MongoClient.connect(config.database.uri, { useNewUrlParser: true, useUnifiedTopology: true });
    db = _client.db(config.database.name);
    client = _client;
}
