import axios from 'axios';

import { prisma } from '../lib/prisma.js';

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

const toStarredRepository = (item: any): StarredRepository => ({
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
    login: item.owner.login,
    avatar_url: item.owner.avatar_url,
    html_url: item.owner.html_url
  }
});

const resolveToken = async (userId: string) => {
  const token = await prisma.oAuthToken.findFirst({
    where: { userId }
  });

  if (!token) {
    throw new Error('No GitHub token available');
  }

  return token.accessToken;
};

export interface FetchStarredParams {
  page?: number;
  perPage?: number;
  since?: string;
  direction?: 'asc' | 'desc';
  sort?: 'created' | 'updated';
}

export const fetchStarredRepositories = async (
  userId: string,
  params: FetchStarredParams = {}
): Promise<StarredRepository[]> => {
  const accessToken = await resolveToken(userId);
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
};

export const fetchStarredWithSince = async (
  userId: string,
  since: Date
): Promise<StarredRepository[]> => {
  const starred = await fetchStarredRepositories(userId, {
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
