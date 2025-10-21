import express from 'express';
import { Cadence } from '@prisma/client';
import { z } from 'zod';

import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/requireAuth.js';

const preferencesSchema = z.object({
  notificationEmail: z.string().email().optional(),
  cadence: z.nativeEnum(Cadence).optional(),
  filters: z
    .object({
      languages: z.array(z.string()).optional(),
      topics: z.array(z.string()).optional(),
      minimumStars: z.number().int().min(0).max(200000).optional(),
      includeArchived: z.boolean().optional()
    })
    .optional()
    .nullable()
});

export const settingsRouter = express.Router();

settingsRouter.use(requireAuth);

settingsRouter.patch('/', async (req, res, next) => {
  try {
    const payload = preferencesSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        notificationEmail: payload.notificationEmail ?? undefined,
        cadence: payload.cadence ?? undefined,
        filters: payload.filters === null ? null : payload.filters ?? undefined
      },
      select: {
        id: true,
        username: true,
        notificationEmail: true,
        cadence: true,
        filters: true
      }
    });

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

settingsRouter.post('/confirm-email', async (req, res, next) => {
  try {
    const emailSchema = z.object({ email: z.string().email() });
    const { email } = emailSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        notificationEmail: email,
        emailVerifiedAt: new Date()
      },
      select: {
        id: true,
        notificationEmail: true,
        emailVerifiedAt: true
      }
    });

    res.json({ user });
  } catch (error) {
    next(error);
  }
});
