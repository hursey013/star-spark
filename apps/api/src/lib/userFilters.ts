export interface UserFilters {
  languages?: string[];
  topics?: string[];
  minimumStars?: number;
  includeArchived?: boolean;
}

export const serializeUserFilters = (
  filters: UserFilters | null | undefined
): string | null | undefined => {
  if (filters === undefined) {
    return undefined;
  }

  if (filters === null) {
    return null;
  }

  if (Object.keys(filters).length === 0) {
    return null;
  }

  return JSON.stringify(filters);
};

export const deserializeUserFilters = (filters: string | null): UserFilters | null => {
  if (!filters) {
    return null;
  }

  try {
    const parsed = JSON.parse(filters) as UserFilters;
    return parsed;
  } catch {
    return null;
  }
};
