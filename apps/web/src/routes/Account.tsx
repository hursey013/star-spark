import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { LoadingState } from '../components/LoadingState';
import { api } from '../lib/api';
import { useSession } from '../store/session';

export const Account = () => {
  const user = useSession((state) => state.user);
  const clearUser = useSession((state) => state.clearUser);
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return <LoadingState message="Preparing your account stardust..." />;
  }

  const handleDelete = async () => {
    if (!confirm('This will delete your Star Spark account and disconnect GitHub. Continue?')) {
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);
      await api.delete('/api/account');
      clearUser();
      navigate('/');
    } catch (err) {
      setError('Could not delete your account. Please try again or contact support.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Card className="space-y-6">
        <header className="space-y-2">
          <h1 className="font-display text-3xl text-brand-sky-50">Account</h1>
          <p className="text-sm text-slate-400">
            Star Spark keeps only the essentials: your GitHub ID, contact email, and reminder preferences. Delete your account to
            remove everything immediately.
          </p>
        </header>
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
          <h2 className="text-lg font-semibold text-red-200">Danger zone</h2>
          <p className="mt-2 text-sm text-red-200/80">
            Deleting your account removes all settings, digests, and stored GitHub tokens. You can reconnect anytime for a fresh
            start.
          </p>
          <Button
            type="button"
            variant="ghost"
            className="mt-4 text-red-200 hover:bg-red-500/10 hover:text-red-100"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete my account'}
          </Button>
        </div>
        {error ? <p className="text-sm text-red-200">{error}</p> : null}
      </Card>
    </div>
  );
};
