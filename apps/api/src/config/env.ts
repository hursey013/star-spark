import { config as loadEnv } from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const currentDir = dirname(fileURLToPath(import.meta.url));

const envPaths = [
  resolve(currentDir, '../../../../.env'),
  resolve(currentDir, '../../.env'),
  resolve(currentDir, '../../prisma/.env')
];

for (const path of envPaths) {
  loadEnv({ path, override: false });
}

loadEnv();

const envSchema = z
  .object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(1),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  GITHUB_CALLBACK_URL: z.string().url(),
  SENDGRID_API_KEY: z.string().min(1).optional(),
  EMAIL_FROM: z.string().min(1),
  APP_BASE_URL: z.string().url(),
  API_BASE_URL: z.string().url(),
  REMINDER_WINDOW_DAYS: z.coerce.number().default(90)
  })
  .superRefine((value, ctx) => {
    if (value.NODE_ENV === 'production' && !value.SENDGRID_API_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['SENDGRID_API_KEY'],
        message: 'SENDGRID_API_KEY is required in production'
      });
    }
  });

export type AppConfig = z.infer<typeof envSchema>;

export const env: AppConfig = envSchema.parse(process.env);
