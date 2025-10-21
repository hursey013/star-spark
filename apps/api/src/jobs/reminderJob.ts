import cron from 'node-cron';

import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';
import { prisma } from '../lib/prisma.js';
import { sendReminderEmail } from '../services/emailService.js';
import { markDigestSent, generateReminderDigest, userIsDueForDigest } from '../services/reminderService.js';

export const startReminderJob = () => {
  const schedule = env.NODE_ENV === 'production' ? '0 14 * * *' : '0 * * * *';

  cron.schedule(schedule, async () => {
    logger.info('Running reminder job');

    const users = await prisma.user.findMany({
      where: {
        notificationEmail: {
          not: null
        }
      }
    });

    for (const user of users) {
      if (!user.notificationEmail) {
        continue;
      }

      if (!userIsDueForDigest(user)) {
        continue;
      }

      const digest = await generateReminderDigest(user);
      if (!digest.highlights.length) {
        logger.info({ userId: user.id }, 'No highlights available for user');
        continue;
      }

      await sendReminderEmail({
        to: user.notificationEmail,
        digest,
        username: user.username
      });

      const repos = digest.highlights.flatMap((highlight) => highlight.items);
      await markDigestSent(user.id, repos);
    }
  });
};
