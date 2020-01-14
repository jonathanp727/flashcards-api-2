import { Router } from 'express';
import auth from './routes/auth';
import card from './routes/card';
import dict from './routes/dict';

const app = Router();
auth(app);
card(app);
dict(app);

export default app;
