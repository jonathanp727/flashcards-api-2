import { Router } from 'express';
import auth from './routes/auth';
import card from './routes/card';
import dict from './routes/dict';
import user from './routes/user';

const app = Router();
auth(app);
card(app);
dict(app);
user(app);

export default app;
