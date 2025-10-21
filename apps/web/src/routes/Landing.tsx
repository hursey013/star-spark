import { Link } from 'react-router-dom';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useSession } from '../store/session';
import { getAuthUrl } from '../lib/api';

const features = [
  {
    title: 'Star-guided reminders',
    description: 'Receive curated digests that highlight the repos you saved for later and match your current maker mood.',
    emoji: '🌠'
  },
  {
    title: 'Developer-native filters',
    description: 'Pick the languages, topics, and star thresholds that matter to you. No generic noise, just quality signal.',
    emoji: '🧭'
  },
  {
    title: 'Playful cadence controls',
    description: 'Choose when you want inspiration — from daily sparks to monthly deep dives — and tweak it anytime.',
    emoji: '🎛️'
  }
];

export const Landing = () => {
  const { status } = useSession((state) => ({ status: state.status }));

  return (
    <div className="relative isolate">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-16 lg:flex-row lg:items-center lg:py-24">
        <div className="flex-1 space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-sky-500/50 bg-brand-sky-500/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-brand-sky-200">
            Made for playful builders
          </span>
          <h1 className="font-display text-4xl leading-tight text-brand-sky-50 sm:text-5xl">
            Reignite the GitHub stars you saved for future magic.
          </h1>
          <p className="max-w-xl text-lg text-slate-300">
            Star Spark is your cosmic reminder system. We revisit your GitHub stars, cluster them into developer-friendly
            adventures, and send gorgeous Tailwind-powered emails that nudge you toward your next build night.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            {status === 'authenticated' ? (
              <Button as={Link} to="/dashboard">
                View dashboard
              </Button>
            ) : (
              <Button as="a" href={getAuthUrl()}>
                Connect GitHub
              </Button>
            )}
            <p className="text-sm text-slate-400">
              Star Spark is open source and loves experimentation.
            </p>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="flex gap-4">
              <span className="text-3xl" aria-hidden>
                {feature.emoji}
              </span>
              <div>
                <h2 className="text-lg font-semibold text-brand-sky-100">{feature.title}</h2>
                <p className="text-sm text-slate-400">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
