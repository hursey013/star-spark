import cookieSession from 'cookie-session';
import cors from 'cors';
import express from 'express';
import createHttpError from 'http-errors';
import morgan from 'morgan';

import { env } from './config/env.js';
import { githubPassport } from './config/passport.js';
import { logger } from './lib/logger.js';
import { router } from './routes/index.js';

export const createApp = () => {
  const app = express();

  app.set('trust proxy', 1);
  app.use(
    cors({
      origin: env.APP_BASE_URL,
      credentials: true
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(
    cookieSession({
      name: 'star-spark-session',
      secret: env.SESSION_SECRET,
      secure: env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 30
    })
  );

  if (env.NODE_ENV !== 'test') {
    app.use(morgan('tiny'));
  }

  app.use(githubPassport.initialize());
  app.use(githubPassport.session());

  app.use('/api', router);

  app.use((_req, _res, next) => {
    next(createHttpError(404, 'Route not found'));
  });

  app.use((error: createHttpError.HttpError, _req, res, _next) => {
    logger.error({ error }, 'Unhandled application error');
    res.status(error.status ?? 500).json({
      message: error.message,
      status: error.status ?? 500
    });
  });

  return app;
};
