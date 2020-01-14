import { Router } from 'express';
import auth from './routes/auth';
import card from './routes/card';

const app = Router();
auth(app);
card(app);

export default app;
