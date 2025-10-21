import pino from 'pino';

import { env } from '../config/env.js';

export const logger = pino({
  name: 'star-spark',
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  transport:
    env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            translateTime: 'SYS:standard',
            colorize: true
          }
        }
      : undefined
});
