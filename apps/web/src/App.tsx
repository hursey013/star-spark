import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { TopNav } from './components/TopNav';
import { Landing } from './routes/Landing';
import { Dashboard } from './routes/Dashboard';
import { Settings } from './routes/Settings';
import { Account } from './routes/Account';
import { useSession } from './store/session';
import { LoadingState } from './components/LoadingState';

const AuthenticatedRoute = ({ children }: { children: React.ReactElement }) => {
  const status = useSession((state) => state.status);
  if (status === 'loading' || status === 'idle') {
    return <LoadingState message="Summoning your constellation..." />;
  }
  if (status !== 'authenticated') {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default function App() {
  const fetchUser = useSession((state) => state.fetchUser);
  const status = useSession((state) => state.status);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <div className="flex min-h-screen flex-col bg-brand-slate text-brand-sky-100">
      <TopNav />
      <main className="flex-1 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_50%)]">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/dashboard"
            element={
              <AuthenticatedRoute>
                <Dashboard />
              </AuthenticatedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <AuthenticatedRoute>
                <Settings />
              </AuthenticatedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <AuthenticatedRoute>
                <Account />
              </AuthenticatedRoute>
            }
          />
          <Route path="*" element={<Navigate to={status === 'authenticated' ? '/dashboard' : '/'} />} />
        </Routes>
      </main>
      <footer className="border-t border-slate-800/70 bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Star Spark. Crafted for curious builders.</p>
          <div className="flex gap-4">
            <a href="https://github.com" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href="mailto:hello@starspark.dev">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
