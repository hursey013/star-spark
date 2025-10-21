import { Cadence, User } from '@prisma/client';

import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import {
  fetchStarredRepositories,
  StarredRepository
} from './githubService.js';

export interface DigestRepoItem {
  id: number;
  name: string;
  fullName: string;
  htmlUrl: string;
  description: string | null;
  language: string | null;
  stargazers: number;
  topics: string[];
  starredAt?: string;
  owner: {
    login: string;
    avatarUrl: string;
    htmlUrl: string;
  };
  vibe: string;
}

export interface DigestHighlight {
  id: string;
  title: string;
  tagline: string;
  items: DigestRepoItem[];
}

export interface ReminderDigest {
  title: string;
  intro: string;
  highlights: DigestHighlight[];
}

const cadenceDaysMap: Record<Cadence, number> = {
  DAILY: 1,
  WEEKLY: 7,
  BIWEEKLY: 14,
  MONTHLY: 30
};

const vibeLibrary = {
  fresh: [
    'You just lit this spark — keep that momentum glowing! ✨',
    'Still warm from your curiosity furnace.',
    'Brand-new inspiration, ready for first light.'
  ],
  throwback: [
    'A legendary idea waiting for its encore.',
    'Vintage brilliance you handpicked.',
    'Like vinyl for devs — still groovy, always relevant.'
  ],
  language: [
    'Your favorite syntax is calling.',
    'Dialed-in to the language you love.',
    'A familiar toolkit with fresh adventure.'
  ],
  serendipity: [
    'A whimsical detour from your star map.',
    'Unexpected delight from the cosmos.',
    'A wild card gem to tinker with tonight.'
  ]
};

const pickVibe = (group: keyof typeof vibeLibrary) => {
  const candidates = vibeLibrary[group];
  return candidates[Math.floor(Math.random() * candidates.length)];
};

const toDigestRepo = (repo: StarredRepository, vibeKey: keyof typeof vibeLibrary): DigestRepoItem => ({
  id: repo.id,
  name: repo.full_name.split('/')[1] ?? repo.full_name,
  fullName: repo.full_name,
  htmlUrl: repo.html_url,
  description: repo.description,
  language: repo.language,
  stargazers: repo.stargazers_count,
  topics: repo.topics ?? [],
  starredAt: repo.starred_at,
  owner: {
    login: repo.owner.login,
    avatarUrl: repo.owner.avatar_url,
    htmlUrl: repo.owner.html_url
  },
  vibe: pickVibe(vibeKey)
});

const applyFilters = (repos: StarredRepository[], user: User) => {
  const filters = (user.filters as Record<string, unknown>) ?? {};
  return repos.filter((repo) => {
    const languages = (filters.languages as string[] | undefined)?.map((item) =>
      item.toLowerCase()
    );
    if (languages?.length && repo.language && !languages.includes(repo.language.toLowerCase())) {
      return false;
    }

    const topics = (filters.topics as string[] | undefined)?.map((item) => item.toLowerCase());
    if (topics?.length) {
      const repoTopics = (repo.topics ?? []).map((topic) => topic.toLowerCase());
      const hasTopic = topics.some((topic) => repoTopics.includes(topic));
      if (!hasTopic) {
        return false;
      }
    }

    const minimumStars = filters.minimumStars as number | undefined;
    if (minimumStars && repo.stargazers_count < minimumStars) {
      return false;
    }

    const includeArchived = Boolean(filters.includeArchived);
    if (!includeArchived && repo.archived) {
      return false;
    }

    return true;
  });
};

const sortByStarredDate = (repos: StarredRepository[], order: 'asc' | 'desc') => {
  return [...repos].sort((a, b) => {
    const dateA = a.starred_at ? new Date(a.starred_at).getTime() : 0;
    const dateB = b.starred_at ? new Date(b.starred_at).getTime() : 0;
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
};

const createFreshHighlight = (repos: StarredRepository[]): DigestHighlight | null => {
  const fresh = sortByStarredDate(repos, 'desc').slice(0, 3);
  if (!fresh.length) {
    return null;
  }

  return {
    id: 'fresh-sparks',
    title: 'Fresh Sparks',
    tagline: 'The newest stars you saved — keep the excitement going while the glow is bright.',
    items: fresh.map((repo) => toDigestRepo(repo, 'fresh'))
  };
};

const createThrowbackHighlight = (repos: StarredRepository[]): DigestHighlight | null => {
  const threshold = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000);
  const throwbacks = sortByStarredDate(repos.filter((repo) => {
    if (!repo.starred_at) {
      return false;
    }
    return new Date(repo.starred_at) < threshold;
  }), 'asc').slice(0, 3);

  if (!throwbacks.length) {
    return null;
  }

  return {
    id: 'throwback-legends',
    title: 'Throwback Legends',
    tagline: 'Seasoned picks from your archive — perfect for a weekend deep dive.',
    items: throwbacks.map((repo) => toDigestRepo(repo, 'throwback'))
  };
};

const createLanguageHighlight = (repos: StarredRepository[]): DigestHighlight | null => {
  const languageGroups = repos.reduce<Record<string, StarredRepository[]>>((acc, repo) => {
    const language = repo.language ?? 'Polyglot';
    acc[language] = acc[language] ?? [];
    acc[language].push(repo);
    return acc;
  }, {});

  const [topLanguage, libraries] = Object.entries(languageGroups)
    .filter(([, items]) => items.length > 1)
    .sort((a, b) => b[1].length - a[1].length)[0] ?? [];

  if (!topLanguage || !libraries?.length) {
    return null;
  }

  return {
    id: 'language-lounge',
    title: `${topLanguage} Lounge`,
    tagline: `Your ${topLanguage} stack is humming — here are a few riffs worth playing.`,
    items: libraries.slice(0, 3).map((repo) => toDigestRepo(repo, 'language'))
  };
};

const createSerendipityHighlight = (repos: StarredRepository[]): DigestHighlight | null => {
  if (!repos.length) {
    return null;
  }

  const shuffled = [...repos].sort(() => Math.random() - 0.5);
  const picks = shuffled.slice(0, 3);

  return {
    id: 'cosmic-serendipity',
    title: 'Cosmic Serendipity',
    tagline: 'A whimsical trio plucked from your constellation for pure maker joy.',
    items: picks.map((repo) => toDigestRepo(repo, 'serendipity'))
  };
};

export const generateReminderDigest = async (user: User): Promise<ReminderDigest> => {
  const starred = await fetchStarredRepositories(user.id, { perPage: 100 });
  const windowStart = new Date(Date.now() - env.REMINDER_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const eligible = applyFilters(
    starred.filter((repo) => {
      if (!repo.starred_at) {
        return true;
      }
      return new Date(repo.starred_at) >= windowStart;
    }),
    user
  );

  const highlights = [
    createFreshHighlight(eligible),
    createThrowbackHighlight(eligible),
    createLanguageHighlight(eligible),
    createSerendipityHighlight(eligible)
  ].filter(Boolean) as DigestHighlight[];

  return {
    title: 'Star Spark Digest',
    intro: `Hey ${user.username}, here are a few stars ready to leap from your saved galaxy into your next build.`,
    highlights
  };
};

export const cadenceToDays = (cadence: Cadence): number => {
  return cadenceDaysMap[cadence] ?? 7;
};

export const userIsDueForDigest = (user: User): boolean => {
  if (!user.lastDigestSentAt) {
    return true;
  }

  const cadenceDays = cadenceToDays(user.cadence);
  const msSinceLast = Date.now() - user.lastDigestSentAt.getTime();
  return msSinceLast >= cadenceDays * 24 * 60 * 60 * 1000;
};

export const markDigestSent = async (userId: string, repos: DigestRepoItem[]) => {
  await prisma.user.update({
    where: { id: userId },
    data: {
      lastDigestSentAt: new Date()
    }
  });

  if (!repos.length) {
    return;
  }

  await prisma.$transaction(
    repos.map((repo) =>
      prisma.reminder.upsert({
        where: {
          userId_repoId: {
            userId,
            repoId: repo.id
          }
        },
        update: {
          repoFullName: repo.fullName,
          repoDescription: repo.description,
          starDate: repo.starredAt ? new Date(repo.starredAt) : undefined,
          topics: repo.topics,
          language: repo.language,
          htmlUrl: repo.htmlUrl,
          lastSentAt: new Date()
        },
        create: {
          userId,
          repoId: repo.id,
          repoFullName: repo.fullName,
          repoDescription: repo.description,
          starDate: repo.starredAt ? new Date(repo.starredAt) : undefined,
          topics: repo.topics,
          language: repo.language,
          htmlUrl: repo.htmlUrl,
          lastSentAt: new Date()
        }
      })
    )
  );
};
