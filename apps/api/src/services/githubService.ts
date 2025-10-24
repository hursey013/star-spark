import axios from 'axios';

import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

export interface StarredRepository {
  id: number;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  html_url: string;
  archived?: boolean;
  fork?: boolean;
  topics?: string[];
  created_at?: string;
  updated_at?: string;
  starred_at?: string;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
}

const githubApi = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Accept: 'application/vnd.github.star+json',
    'X-GitHub-Api-Version': '2022-11-28'
  }
});

githubApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message ?? error.message;
      throw new Error(`GitHub API error: ${message}`);
    }

    throw error;
  }
);

const toStarredRepository = (item: any): StarredRepository => {
  if (item.starred_at && item.repo) {
    const repo = item.repo;
    return {
      id: repo.id,
      full_name: repo.full_name,
      description: repo.description,
      language: repo.language,
      stargazers_count: repo.stargazers_count,
      html_url: repo.html_url,
      archived: repo.archived,
      fork: repo.fork,
      topics: repo.topics ?? [],
      created_at: repo.created_at,
      updated_at: repo.updated_at,
      starred_at: item.starred_at,
      owner: {
        login: repo.owner?.login ?? '',
        avatar_url: repo.owner?.avatar_url ?? '',
        html_url: repo.owner?.html_url ?? ''
      }
    };
  }

  return {
    id: item.id,
    full_name: item.full_name,
    description: item.description,
    language: item.language,
    stargazers_count: item.stargazers_count,
    html_url: item.html_url,
    archived: item.archived,
    fork: item.fork,
    topics: item.topics ?? [],
    created_at: item.created_at,
    updated_at: item.updated_at,
    starred_at: item.starred_at,
    owner: {
      login: item.owner?.login ?? '',
      avatar_url: item.owner?.avatar_url ?? '',
      html_url: item.owner?.html_url ?? ''
    }
  };
};

const resolveToken = async (userId: string) => {
  const token = await prisma.oAuthToken.findFirst({
    where: { userId }
  });

  return token?.accessToken ?? null;
};

export interface FetchStarredParams {
  page?: number;
  perPage?: number;
  since?: string;
  direction?: 'asc' | 'desc';
  sort?: 'created' | 'updated';
}

export const fetchStarredRepositories = async (
  user: { id: string; username: string },
  params: FetchStarredParams = {}
): Promise<StarredRepository[]> => {
  const accessToken = await resolveToken(user.id);

  if (accessToken) {
    try {
      logger.debug({ userId: user.id, username: user.username }, 'Fetching starred repositories via /user/starred');
      const response = await githubApi.get('/user/starred', {
        params: {
          per_page: params.perPage ?? 50,
          page: params.page ?? 1,
          sort: params.sort ?? 'created',
          direction: params.direction ?? 'desc'
        },
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      const starred = Array.isArray(response.data) ? response.data : response.data.items;
      return (starred ?? []).map(toStarredRepository);
    } catch (error) {
      logger.warn(
        {
          userId: user.id,
          username: user.username,
          error: axios.isAxiosError(error)
            ? {
                status: error.response?.status,
                message: error.response?.data?.message ?? error.message,
                headers: error.response?.headers
              }
            : { message: (error as Error).message }
        },
        'Failed to fetch /user/starred; falling back to public endpoint'
      );
    }
  }

  try {
    logger.debug(
      { userId: user.id, username: user.username },
      'Fetching starred repositories via /users/{username}/starred'
    );
    const response = await githubApi.get(`/users/${user.username}/starred`, {
      params: {
        per_page: params.perPage ?? 50,
        page: params.page ?? 1,
        sort: params.sort ?? 'created',
        direction: params.direction ?? 'desc'
      }
    });

    const starred = Array.isArray(response.data) ? response.data : response.data.items;
    return (starred ?? []).map(toStarredRepository);
  } catch (error) {
    logger.error(
      {
        userId: user.id,
        username: user.username,
        error: axios.isAxiosError(error)
          ? {
              status: error.response?.status,
              message: error.response?.data?.message ?? error.message,
              headers: error.response?.headers
            }
          : { message: (error as Error).message }
      },
      'Failed to fetch starred repositories'
    );
    throw new Error(
      axios.isAxiosError(error)
        ? `Unable to fetch starred repositories: ${error.response?.data?.message ?? error.message}`
        : `Unable to fetch starred repositories: ${(error as Error).message}`
    );
  }
};

export const fetchStarredWithSince = async (
  user: { id: string; username: string },
  since: Date
): Promise<StarredRepository[]> => {
  const starred = await fetchStarredRepositories(user, {
    perPage: 100,
    sort: 'created',
    direction: 'desc'
  });

  return starred.filter((repo) => {
    if (!repo.starred_at) {
      return false;
    }
    return new Date(repo.starred_at) <= new Date() && new Date(repo.starred_at) >= since;
  });
};
