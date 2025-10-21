import { describe, expect, it } from 'vitest';

import { cadenceToDays, userIsDueForDigest } from './reminderService.js';
import { Cadence } from '@prisma/client';

describe('reminderService', () => {
  it('maps cadence to the expected number of days', () => {
    expect(cadenceToDays(Cadence.DAILY)).toBe(1);
    expect(cadenceToDays(Cadence.WEEKLY)).toBe(7);
    expect(cadenceToDays(Cadence.BIWEEKLY)).toBe(14);
    expect(cadenceToDays(Cadence.MONTHLY)).toBe(30);
  });

  it('determines if user is due for digest', () => {
    const now = new Date();

    expect(
      userIsDueForDigest({
        id: '1',
        githubId: '1',
        username: 'test',
        avatarUrl: '',
        email: 'test@example.com',
        notificationEmail: 'test@example.com',
        emailVerifiedAt: null,
        cadence: Cadence.WEEKLY,
        filters: null,
        lastDigestSentAt: null,
        createdAt: now,
        updatedAt: now
      } as any)
    ).toBe(true);

    expect(
      userIsDueForDigest({
        id: '1',
        githubId: '1',
        username: 'test',
        avatarUrl: '',
        email: 'test@example.com',
        notificationEmail: 'test@example.com',
        emailVerifiedAt: null,
        cadence: Cadence.WEEKLY,
        filters: null,
        lastDigestSentAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
        createdAt: now,
        updatedAt: now
      } as any)
    ).toBe(true);

    expect(
      userIsDueForDigest({
        id: '1',
        githubId: '1',
        username: 'test',
        avatarUrl: '',
        email: 'test@example.com',
        notificationEmail: 'test@example.com',
        emailVerifiedAt: null,
        cadence: Cadence.WEEKLY,
        filters: null,
        lastDigestSentAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        createdAt: now,
        updatedAt: now
      } as any)
    ).toBe(false);
  });
});
