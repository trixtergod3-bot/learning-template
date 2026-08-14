import { Cloud, CloudOff, Menu, UserRound, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { appConfiguration } from '@/app/config/appConfig';
import { readRuntimeEnvironment } from '@/app/config/runtimeEnvironment';
import { useAuthentication } from '@/features/auth/useAuthentication';
import { navigationIcons } from '@/ui/icons/navigationIcons';

const runtimeEnvironment = readRuntimeEnvironment();

const navigationClassName = ({ isActive }: { isActive: boolean }) =>
  `navigation-link${isActive ? ' navigation-link--active' : ''}`;

export function AppShell() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { backendConfigured, passwordRecovery, status } = useAuthentication();
  const location = useLocation();
  const navigate = useNavigate();
  const environmentLabel =
    status === 'authenticated' ? 'Signed in' : backendConfigured ? 'Cloud guest' : 'Local mode';

  useEffect(() => {
    if (passwordRecovery && location.pathname !== '/profile') {
      void navigate('/profile', { replace: true });
    }
  }, [location.pathname, navigate, passwordRecovery]);

  return (
    <div
      className="app-shell"
      style={{ '--accent': appConfiguration.branding.accent } as React.CSSProperties}
    >
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <header className="site-header">
        <div className="site-header__inner">
          <NavLink className="brand" to="/" aria-label="LearningTemplate home">
            <span className="brand__mark" aria-hidden="true">
              {appConfiguration.branding.logoText}
            </span>
            <span>
              <strong>{appConfiguration.appName}</strong>
              <small>{appConfiguration.tagline}</small>
            </span>
          </NavLink>

          <nav className="desktop-navigation" aria-label="Primary navigation">
            {appConfiguration.navigation.map((item) => {
              const Icon = navigationIcons[item.id];

              return (
                <NavLink
                  className={navigationClassName}
                  end={item.path === '/'}
                  key={item.id}
                  to={item.path}
                >
                  {Icon ? <Icon aria-hidden size={17} strokeWidth={2} /> : null}
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="header-actions">
            <span
              className={`environment-pill${backendConfigured ? ' environment-pill--online' : ''}`}
              title={
                status === 'authenticated'
                  ? 'Your Supabase session is authenticated.'
                  : backendConfigured
                    ? 'Supabase is configured; sign in to sync private learning data.'
                    : 'No backend is configured; the app is in local guest mode.'
              }
            >
              {status === 'authenticated' ? (
                <UserRound aria-hidden size={15} />
              ) : runtimeEnvironment.supabase.enabled ? (
                <Cloud aria-hidden size={15} />
              ) : (
                <CloudOff aria-hidden size={15} />
              )}
              {environmentLabel}
            </span>
            <button
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? 'Close navigation' : 'Open navigation'}
              className="menu-button"
              onClick={() => setIsMenuOpen((value) => !value)}
              type="button"
            >
              {isMenuOpen ? <X aria-hidden size={22} /> : <Menu aria-hidden size={22} />}
            </button>
          </div>
        </div>

        {isMenuOpen ? (
          <nav className="mobile-navigation" aria-label="Mobile navigation">
            {appConfiguration.navigation.map((item) => {
              const Icon = navigationIcons[item.id];

              return (
                <NavLink
                  className={navigationClassName}
                  end={item.path === '/'}
                  key={item.id}
                  onClick={() => setIsMenuOpen(false)}
                  to={item.path}
                >
                  {Icon ? <Icon aria-hidden size={18} strokeWidth={2} /> : null}
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        ) : null}
      </header>

      <main className="page-frame" id="main-content" tabIndex={-1}>
        <Outlet />
      </main>

      <footer className="site-footer">
        <p>
          LearningTemplate foundation · Built to teach any subject without rewriting the engine.
        </p>
      </footer>
    </div>
  );
}
