import createHttpError from 'http-errors';
import type { RequestHandler } from 'express';

export const requireAuth: RequestHandler = (req, _res, next) => {
  if (!req.session?.userId) {
    return next(createHttpError(401, 'Authentication required'));
  }

  req.userId = req.session.userId;
  return next();
};
