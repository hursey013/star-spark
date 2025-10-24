import express from 'express';

import { env } from '../config/env.js';
import { githubPassport, githubScopes } from '../config/passport.js';
import { prisma } from '../lib/prisma.js';
import { presentUser } from '../lib/userPresenter.js';

export const authRouter = express.Router();

authRouter.get('/github', (req, res, next) => {
  githubPassport.authenticate('github', {
    scope: githubScopes,
    state: req.query.state as string | undefined
  })(req, res, next);
});

authRouter.get('/github/callback', (req, res, next) => {
  githubPassport.authenticate('github', async (error, user) => {
    if (error) {
      return res.redirect(`${env.APP_BASE_URL}/auth/error`);
    }

    if (!user) {
      return res.redirect(`${env.APP_BASE_URL}/auth/error`);
    }

    req.logIn(user as Express.User, (loginError) => {
      if (loginError) {
        return res.redirect(`${env.APP_BASE_URL}/auth/error`);
      }

      req.session = req.session ?? {};
      req.session.userId = (user as { id: string }).id;

      return res.redirect(`${env.APP_BASE_URL}/dashboard`);
    });
  })(req, res, next);
});

authRouter.post('/logout', (req, res) => {
  if (req.session) {
    req.session = null;
  }

  res.status(204).send();
});

authRouter.get('/me', async (req, res) => {
  if (!req.session?.userId) {
    return res.status(200).json({ user: null });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.session.userId },
    select: {
      id: true,
      username: true,
      avatarUrl: true,
      email: true,
      notificationEmail: true,
      cadence: true,
      filters: true,
      lastDigestSentAt: true
    }
  });

  res.json({ user: user ? presentUser(user) : null });
});
