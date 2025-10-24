import { DEFAULT_CADENCE, Cadence, isCadence } from '../domain/cadence.js';
import { deserializeUserFilters, UserFilters } from './userFilters.js';

type WithRawPreferences = {
  cadence: string;
  filters: string | null;
};

type PresentedPreferences = {
  cadence: Cadence;
  filters: UserFilters | null;
};

export const presentUser = <T extends WithRawPreferences>(
  user: T
): Omit<T, keyof WithRawPreferences> & PresentedPreferences => {
  return {
    ...user,
    cadence: isCadence(user.cadence) ? user.cadence : DEFAULT_CADENCE,
    filters: deserializeUserFilters(user.filters)
  };
};
