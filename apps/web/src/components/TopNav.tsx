import { NavLink } from 'react-router-dom';

import { useSession } from '../store/session';
import { Button } from './Button';
import { getAuthUrl, api } from '../lib/api';

export const TopNav = () => {
  const { user, status, clearUser } = useSession((state) => ({
    user: state.user,
    status: state.status,
    clearUser: state.clearUser
  }));

  const handleLogout = async () => {
    await api.post('/api/auth/logout');
    clearUser();
  };

  return (
    <header className="border-b border-slate-800/70 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <NavLink to="/" className="text-lg font-semibold text-brand-sky-200">
          ✨ Star Spark
        </NavLink>
        <nav className="flex items-center gap-4 text-sm">
          {status === 'authenticated' ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 transition ${
                    isActive ? 'bg-brand-sky-500/20 text-brand-sky-100' : 'text-brand-sky-200 hover:text-brand-sky-50'
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 transition ${
                    isActive ? 'bg-brand-sky-500/20 text-brand-sky-100' : 'text-brand-sky-200 hover:text-brand-sky-50'
                  }`
                }
              >
                Settings
              </NavLink>
              <NavLink
                to="/account"
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 transition ${
                    isActive ? 'bg-brand-sky-500/20 text-brand-sky-100' : 'text-brand-sky-200 hover:text-brand-sky-50'
                  }`
                }
              >
                Account
              </NavLink>
              <div className="flex items-center gap-3">
                <span className="hidden text-xs text-slate-400 sm:block">
                  {user?.username ? `Signed in as ${user.username}` : 'Signed in'}
                </span>
                <Button variant="secondary" size="sm" onClick={handleLogout}>
                  Sign out
                </Button>
              </div>
            </>
          ) : (
            <Button as="a" href={getAuthUrl()}>
              Connect GitHub
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};
