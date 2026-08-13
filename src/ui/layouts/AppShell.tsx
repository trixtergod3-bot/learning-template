import { CloudOff, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { appConfiguration } from '@/app/config/appConfig';
import { readRuntimeEnvironment } from '@/app/config/runtimeEnvironment';
import { navigationIcons } from '@/ui/icons/navigationIcons';

const runtimeEnvironment = readRuntimeEnvironment();

const navigationClassName = ({ isActive }: { isActive: boolean }) =>
  `navigation-link${isActive ? ' navigation-link--active' : ''}`;

export function AppShell() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
              className={`environment-pill${runtimeEnvironment.supabase.enabled ? ' environment-pill--online' : ''}`}
              title={
                runtimeEnvironment.supabase.enabled
                  ? 'Authenticated persistence is configured.'
                  : 'Phase 1 uses local-only guest mode.'
              }
            >
              <CloudOff aria-hidden size={15} />
              {runtimeEnvironment.supabase.enabled ? 'Cloud ready' : 'Local mode'}
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
