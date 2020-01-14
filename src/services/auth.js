import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import { randomBytes } from 'crypto';

import config from '../config';
import logger from '../loaders/logger';
import UserModel from '../models/user';
import StatsHandler from './lib/StatsHandler';

async function signUp(data) {
  try {
    const salt = randomBytes(32);
    const hashedPassword = await argon2.hash(data.password, { salt });

    const user = await UserModel.create({
      general: {
        username: data.name,
        email: data.email,
        passwordHash: hashedPassword,
        salt: salt.toString('hex'),
        timezone: 0,
      },
      upcoming: [],
      settings: {
        dailyNewCardLimit: 5,
      },
      stats: StatsHandler.createUserStats(),
      history: {
        lastSession: {
          date: null,
          upcomingCardsDone: 0,
        },
        recentLookups: [],
      },
    });

    const token = generateToken(user);

    /**
     * @TODO This is not the best way to deal with this
     * There should exist a 'Mapper' layer
     * that transforms data from layer to layer
     * but that's too over-engineering for now
     */
    Reflect.deleteProperty(user, 'password');
    Reflect.deleteProperty(user, 'salt');

    return { user, token };
  } catch (e) {
    logger.error('%o', e);
    throw e;
  }
}

async function signIn(email, password) {
  const user = await UserModel.findByEmail(email);
  if (!user) {
    throw new Error('User not registered');
  }
  const validPassword = await argon2.verify(user.password, password);
  if (validPassword) {
    const token = generateToken(user);
    Reflect.deleteProperty(user, 'password');
    Reflect.deleteProperty(user, 'salt');
    return { user, token };
  } else {
    throw new Error('Invalid Password');
  }
}

function generateToken(user) {
  const today = new Date();
  const exp = new Date(today);
  exp.setDate(today.getDate() + 60);
  return jwt.sign(
    {
      _id: user._id,           // Used in `isAuth` middleware
      name: user.name,
      exp: exp.getTime() / 1000,
    },
    config.jwtSecret,
  );
}

export default {
  signUp,
  signIn,
};
