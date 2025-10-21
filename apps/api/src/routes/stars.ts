import express from 'express';
import { z } from 'zod';

import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { fetchStarredRepositories } from '../services/githubService.js';
import { generateReminderDigest } from '../services/reminderService.js';

export const starsRouter = express.Router();

starsRouter.use(requireAuth);

starsRouter.get('/', async (req, res, next) => {
  const querySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    perPage: z.coerce.number().min(1).max(100).default(30)
  });

  try {
    const query = querySchema.parse(req.query);
    const items = await fetchStarredRepositories(req.userId!, query);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

starsRouter.get('/digest-preview', async (req, res, next) => {
  try {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.userId! } });
    const digest = await generateReminderDigest(user);
    res.json({ digest });
  } catch (error) {
    next(error);
  }
});
