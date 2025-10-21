import express from 'express';

import { accountRouter } from './account.js';
import { authRouter } from './auth.js';
import { settingsRouter } from './settings.js';
import { starsRouter } from './stars.js';

export const router = express.Router();

router.use('/auth', authRouter);
router.use('/settings', settingsRouter);
router.use('/stars', starsRouter);
router.use('/account', accountRouter);

router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});
