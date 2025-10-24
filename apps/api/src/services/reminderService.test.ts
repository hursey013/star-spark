import { describe, expect, it } from 'vitest';

import { cadenceToDays, userIsDueForDigest } from './reminderService.js';
import { CADENCE_VALUES } from '../domain/cadence.js';

const [DAILY, WEEKLY, BIWEEKLY, MONTHLY] = CADENCE_VALUES;

describe('reminderService', () => {
  it('maps cadence to the expected number of days', () => {
    expect(cadenceToDays(DAILY)).toBe(1);
    expect(cadenceToDays(WEEKLY)).toBe(7);
    expect(cadenceToDays(BIWEEKLY)).toBe(14);
    expect(cadenceToDays(MONTHLY)).toBe(30);
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
        cadence: WEEKLY,
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
        cadence: WEEKLY,
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
        cadence: WEEKLY,
        filters: null,
        lastDigestSentAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        createdAt: now,
        updatedAt: now
      } as any)
    ).toBe(false);
  });
});
