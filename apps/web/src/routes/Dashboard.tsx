import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { LoadingState } from '../components/LoadingState';
import { api } from '../lib/api';
import { useSession } from '../store/session';
import { ReminderDigest } from '../types';

dayjs.extend(relativeTime);

export const Dashboard = () => {
  const user = useSession((state) => state.user);
  const [digest, setDigest] = useState<ReminderDigest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDigest = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ digest: ReminderDigest }>('/api/stars/digest-preview');
      setDigest(response.data.digest);
      setError(null);
    } catch (err) {
      setError('We could not fetch your constellation preview. Try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchDigest();
  }, []);

  if (loading) {
    return <LoadingState message="Gathering your brightest stars..." />;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Card className="space-y-6 text-center">
          <p className="text-slate-300">{error}</p>
          <Button onClick={fetchDigest}>Retry</Button>
        </Card>
      </div>
    );
  }

  if (!digest) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Card className="space-y-4 text-center">
          <h2 className="text-xl font-semibold text-brand-sky-100">No highlights yet</h2>
          <p className="text-sm text-slate-400">
            Once Star Spark syncs your GitHub stars we will craft a whimsical digest for you. Try starring a few projects that
            make you smile.
          </p>
          <Button onClick={fetchDigest}>Refresh</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12">
      <section className="space-y-4">
        <h1 className="font-display text-4xl text-brand-sky-50">{digest.title}</h1>
        <p className="max-w-2xl text-lg text-slate-300">{digest.intro}</p>
        {user?.lastDigestSentAt ? (
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Last sent {dayjs(user.lastDigestSentAt).fromNow()}
          </p>
        ) : null}
        <Button variant="secondary" size="sm" onClick={fetchDigest}>
          Refresh preview
        </Button>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {digest.highlights.map((highlight) => (
          <Card key={highlight.id} className="space-y-6">
            <header>
              <h2 className="text-2xl font-semibold text-brand-sky-100">{highlight.title}</h2>
              <p className="text-sm text-slate-400">{highlight.tagline}</p>
            </header>
            <ul className="space-y-4">
              {highlight.items.map((item) => (
                <li key={item.id} className="rounded-2xl bg-slate-900/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <a href={item.htmlUrl} className="text-lg font-medium text-brand-sky-100" target="_blank" rel="noreferrer">
                        {item.fullName}
                      </a>
                      <p className="text-sm text-slate-400">{item.description ?? 'A mysterious star awaiting your attention.'}</p>
                    </div>
                    <span className="rounded-full bg-brand-sky-500/10 px-3 py-1 text-xs text-brand-sky-200">
                      {item.language ?? 'Polyglot'}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-brand-sky-200">{item.vibe}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
                    <span>⭐ {item.stargazers.toLocaleString()} stars</span>
                    {item.topics.slice(0, 3).map((topic) => (
                      <span key={topic} className="rounded-full bg-slate-800/70 px-2 py-1">
                        #{topic}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </section>
    </div>
  );
};
