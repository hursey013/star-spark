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
