import express from 'express';

import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const accountRouter = express.Router();

accountRouter.use(requireAuth);

accountRouter.delete('/', async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.userId! } });
    if (req.session) {
      req.session = null;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
