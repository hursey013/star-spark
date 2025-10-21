import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';

import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { env } from './env.js';

export const githubScopes = ['read:user', 'user:email', 'repo'] as const;

passport.serializeUser((user: Express.User, done) => {
  done(null, (user as { id: string }).id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user ?? null);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GitHubStrategy(
    {
      clientID: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      callbackURL: env.GITHUB_CALLBACK_URL,
      scope: githubScopes
    },
    async (accessToken, refreshToken, params, profile, done) => {
      try {
        const primaryEmail = profile.emails?.find((email) => email.primary) ?? profile.emails?.[0];
        const email = primaryEmail?.value ?? `${profile.username ?? profile.id}@users.noreply.github.com`;
        const avatarUrl = profile.photos?.[0]?.value ?? '';
        const username = profile.username ?? profile.displayName ?? profile.id;

        const user = await prisma.user.upsert({
          where: { githubId: profile.id },
          update: {
            username,
            avatarUrl,
            email,
            notificationEmail: email
          },
          create: {
            githubId: profile.id,
            username,
            avatarUrl,
            email,
            notificationEmail: email
          }
        });

        const existingToken = await prisma.oAuthToken.findFirst({
          where: { userId: user.id }
        });

        const expiresIn = typeof params.expires_in === 'number' ? params.expires_in : undefined;
        const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : undefined;

        if (existingToken) {
          await prisma.oAuthToken.update({
            where: { id: existingToken.id },
            data: {
              accessToken,
              refreshToken: refreshToken || existingToken.refreshToken,
              scopes: params.scope ?? githubScopes.join(','),
              expiresAt
            }
          });
        } else {
          await prisma.oAuthToken.create({
            data: {
              userId: user.id,
              accessToken,
              refreshToken: refreshToken || null,
              scopes: params.scope ?? githubScopes.join(','),
              expiresAt
            }
          });
        }

        done(null, { id: user.id, username: user.username });
      } catch (error) {
        logger.error({ error }, 'Failed to process GitHub authentication');
        done(error as Error);
      }
    }
  )
);

export const githubPassport = passport;
