import sgMail from '@sendgrid/mail';

import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';
import { ReminderDigest } from './reminderService.js';
import { renderReminderEmail } from '../email/templates.js';

if (env.SENDGRID_API_KEY) {
  sgMail.setApiKey(env.SENDGRID_API_KEY);
} else {
  logger.warn('SENDGRID_API_KEY is not configured; reminder emails will be skipped.');
}

interface SendReminderOptions {
  to: string;
  digest: ReminderDigest;
  username: string;
}

export const sendReminderEmail = async ({ to, digest, username }: SendReminderOptions) => {
  if (!env.SENDGRID_API_KEY) {
    logger.warn({ to }, 'Skipping reminder email because SENDGRID_API_KEY is not set');
    return;
  }

  const html = renderReminderEmail({ digest, username });

  try {
    await sgMail.send({
      to,
      from: env.EMAIL_FROM,
      subject: `✨ Your Star Spark digest is ready`,
      html: html
        .replace('{{openAppUrl}}', `${env.APP_BASE_URL}/dashboard`)
        .replace('{{settingsUrl}}', `${env.APP_BASE_URL}/settings`)
        .replace('{{goodbyeUrl}}', `${env.APP_BASE_URL}/account`)
    });
  } catch (error) {
    logger.error({ error }, 'Failed to send reminder email');
    throw error;
  }
};
