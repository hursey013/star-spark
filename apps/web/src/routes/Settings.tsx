import { FormEvent, useEffect, useState } from 'react';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { FormField, SelectInput, TextInput } from '../components/FormField';
import { LoadingState } from '../components/LoadingState';
import { api } from '../lib/api';
import { useSession, Cadence, User } from '../store/session';

interface PreferencesForm {
  notificationEmail: string;
  cadence: Cadence;
  languages: string;
  topics: string;
  minimumStars: number | '';
  includeArchived: boolean;
}

const cadenceCopy: Record<Cadence, string> = {
  DAILY: 'Daily sparks',
  WEEKLY: 'Weekly fuel-up',
  BIWEEKLY: 'Every other week',
  MONTHLY: 'Monthly deep dive'
};

const buildInitialState = (user: User | null): PreferencesForm => {
  const filters =
    (user?.filters as {
      languages?: string[];
      topics?: string[];
      minimumStars?: number;
      includeArchived?: boolean;
    }) ?? {};

  return {
    notificationEmail: user?.notificationEmail ?? user?.email ?? '',
    cadence: user?.cadence ?? 'WEEKLY',
    languages: Array.isArray(filters.languages) ? filters.languages.join(', ') : '',
    topics: Array.isArray(filters.topics) ? filters.topics.join(', ') : '',
    minimumStars: filters.minimumStars ?? '',
    includeArchived: Boolean(filters.includeArchived)
  };
};

export const Settings = () => {
  const user = useSession((state) => state.user);
  const setUser = useSession((state) => state.setUser);
  const [form, setForm] = useState<PreferencesForm>(buildInitialState(user));
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    setForm(buildInitialState(user));
  }, [user]);

  if (!user) {
    return <LoadingState message="Loading your preferences..." />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    const filters = {
      languages: form.languages
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      topics: form.topics
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      minimumStars: form.minimumStars === '' ? undefined : Number(form.minimumStars),
      includeArchived: form.includeArchived
    };

    try {
      const response = await api.patch<{ user: User }>('/api/settings', {
        notificationEmail: form.notificationEmail,
        cadence: form.cadence,
        filters
      });
      setUser(response.data.user);
      setFeedback({ type: 'success', message: 'Saved! Your constellation cues are updated.' });
    } catch (error) {
      setFeedback({ type: 'error', message: 'Something went sideways while saving. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Card as="form" onSubmit={handleSubmit} className="space-y-6">
        <header className="space-y-2">
          <h1 className="font-display text-3xl text-brand-sky-50">Notification settings</h1>
          <p className="text-sm text-slate-400">
            Tailor how Star Spark nudges you. We’ll use these preferences for your next SendGrid-powered delivery.
          </p>
        </header>

        <FormField label="Notification email" htmlFor="notificationEmail" required>
          <TextInput
            id="notificationEmail"
            type="email"
            autoComplete="email"
            required
            value={form.notificationEmail}
            onChange={(event) => setForm((prev) => ({ ...prev, notificationEmail: event.target.value }))}
          />
        </FormField>

        <FormField label="Cadence" htmlFor="cadence">
          <SelectInput
            id="cadence"
            value={form.cadence}
            onChange={(event) => setForm((prev) => ({ ...prev, cadence: event.target.value as Cadence }))}
          >
            {Object.entries(cadenceCopy).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </SelectInput>
        </FormField>

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            label="Preferred languages"
            htmlFor="languages"
            hint="Comma separated. We will prioritize repos tagged with these languages."
          >
            <TextInput
              id="languages"
              placeholder="TypeScript, Rust, Elixir"
              value={form.languages}
              onChange={(event) => setForm((prev) => ({ ...prev, languages: event.target.value }))}
            />
          </FormField>
          <FormField
            label="Dream topics"
            htmlFor="topics"
            hint="Comma separated topics such as astro, cli, robotics."
          >
            <TextInput
              id="topics"
              placeholder="astro, cli, robotics"
              value={form.topics}
              onChange={(event) => setForm((prev) => ({ ...prev, topics: event.target.value }))}
            />
          </FormField>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            label="Minimum GitHub stars"
            htmlFor="minimumStars"
            hint="Optional. Only include repos above this stargazer count."
          >
            <TextInput
              id="minimumStars"
              type="number"
              min={0}
              placeholder="0"
              value={form.minimumStars}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, minimumStars: event.target.value === '' ? '' : Number(event.target.value) }))
              }
            />
          </FormField>
          <FormField label="Include archived repos" htmlFor="includeArchived" hint="By default we skip archived projects.">
            <div className="flex items-center gap-3">
              <input
                id="includeArchived"
                type="checkbox"
                className="h-5 w-5 rounded border-slate-600 bg-slate-900 text-brand-sky-400 focus:ring-brand-sky-500"
                checked={form.includeArchived}
                onChange={(event) => setForm((prev) => ({ ...prev, includeArchived: event.target.checked }))}
              />
              <span className="text-sm text-slate-300">Let the retro gems shine</span>
            </div>
          </FormField>
        </div>

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save preferences'}
          </Button>
          {feedback ? (
            <span
              className={
                feedback.type === 'success'
                  ? 'text-sm text-brand-sky-200'
                  : 'text-sm text-red-200'
              }
            >
              {feedback.message}
            </span>
          ) : null}
        </div>
      </Card>
    </div>
  );
};
