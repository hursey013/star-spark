import { z } from 'zod';

export const CADENCE_VALUES = ['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY'] as const;

export type Cadence = (typeof CADENCE_VALUES)[number];

export const DEFAULT_CADENCE: Cadence = 'WEEKLY';

export const cadenceSchema = z.enum(CADENCE_VALUES);

export const isCadence = (value: unknown): value is Cadence => {
  return typeof value === 'string' && (CADENCE_VALUES as readonly string[]).includes(value as Cadence);
};
