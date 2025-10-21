import { createServer } from 'http';

import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { startReminderJob } from './jobs/reminderJob.js';

const app = createApp();
const server = createServer(app);

server.listen(env.PORT, () => {
  logger.info(`Star Spark API listening on port ${env.PORT}`);
  startReminderJob();
});
